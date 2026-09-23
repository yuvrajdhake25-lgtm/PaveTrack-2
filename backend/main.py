import os
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from bson import ObjectId

from database import users_collection, complaints_collection
from auth import hash_password, verify_password, create_access_token, get_current_user
from ai_verification import compute_full_verification, check_photo_authenticity

app = FastAPI(title="PaveTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:8000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "https://pavetrack-2.onrender.com",
        "https://pavetrack-2.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/potholes", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Helper to convert ObjectId to string in mongo documents
def doc_helper(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if doc and "user_id" in doc and isinstance(doc["user_id"], ObjectId):
        doc["user_id"] = str(doc["user_id"])
    return doc

class SignupModel(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: str = "citizen"
    area: Optional[str] = None

class LoginModel(BaseModel):
    email: str
    password: str

@app.post("/auth/signup")
def signup(user: SignupModel):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password_hash"] = hash_password(user.password)
    del user_dict["password"]
    
    result = users_collection.insert_one(user_dict)
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@app.post("/auth/login")
def login(user: LoginModel):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": str(db_user["_id"]), "role": db_user.get("role")})
    return {"access_token": token, "token_type": "bearer", "user": doc_helper(db_user)}

@app.post("/complaints")
def create_complaint(
    location: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    severity: str = Form(...),
    description: Optional[str] = Form(None),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    timestamp = datetime.utcnow()
    file_path = f"static/potholes/before_{timestamp.timestamp()}_{photo.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    count = complaints_collection.count_documents({}) + 1
    complaint_code = f"PTH-{timestamp.year}-{count:05d}"
    
    complaint = {
        "complaint_code": complaint_code,
        "user_id": ObjectId(current_user["sub"]),
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
        "severity": severity,
        "description": description,
        "photo_before": f"/{file_path}",
        "status": "reported",
        "assigned_contractor": None,
        "created_at": timestamp,
        "updated_at": timestamp,
        "status_history": [{"status": "reported", "timestamp": timestamp}]
    }
    
    result = complaints_collection.insert_one(complaint)
    complaint["_id"] = str(result.inserted_id)
    complaint["user_id"] = str(complaint["user_id"])
    return complaint

@app.get("/complaints")
def get_complaints(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    role = current_user.get("role")
    
    query = {} if role in ["admin", "contractor", "municipal"] else {"user_id": ObjectId(user_id)}
    complaints = list(complaints_collection.find(query).sort("created_at", -1))
    return [doc_helper(c) for c in complaints]

@app.get("/complaints/map")
def get_complaints_map():
    complaints = list(complaints_collection.find(
        {},
        {"latitude": 1, "longitude": 1, "status": 1, "severity": 1, "complaint_code": 1}
    ))
    return [doc_helper(c) for c in complaints]

@app.get("/complaints/{code}")
def get_complaint(code: str):
    complaint = complaints_collection.find_one({"complaint_code": code})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return doc_helper(complaint)

@app.post("/complaints/{code}/repair-submission")
def submit_repair(
    code: str,
    latitude: float = Form(...),
    longitude: float = Form(...),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    complaint = complaints_collection.find_one({"complaint_code": code})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    timestamp = datetime.utcnow()
    file_path = f"static/potholes/after_{timestamp.timestamp()}_{photo.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    repair_submission = {
        "photo_after": f"/{file_path}",
        "latitude": latitude,
        "longitude": longitude,
        "submitted_at": timestamp
    }
    
    complaints_collection.update_one(
        {"_id": complaint["_id"]},
        {
            "$set": {
                "repair_submission": repair_submission,
                "status": "repair_submitted",
                "updated_at": timestamp
            },
            "$push": {"status_history": {"status": "repair_submitted", "timestamp": timestamp}}
        }
    )
    
    # Run AI verification in background — don't block the response
    def run_verification_bg(complaint_id, complaint_doc, repair_sub):
        try:
            complaint_doc["repair_submission"] = repair_sub
            ai_result = compute_full_verification(complaint_doc, repair_sub)
            new_status = "manual_review" if ai_result["needs_manual_review"] else "ai_verified"
            complaints_collection.update_one(
                {"_id": complaint_id},
                {
                    "$set": {
                        "ai_verification": ai_result,
                        "status": new_status,
                        "updated_at": datetime.utcnow()
                    },
                    "$push": {"status_history": {"status": new_status, "timestamp": datetime.utcnow()}}
                }
            )
            print(f"AI verification complete for {complaint_doc.get('complaint_code')}: {new_status} ({ai_result.get('overall_score')}%)")
        except Exception as e:
            print(f"Background AI verification error: {e}")

    import threading
    thread = threading.Thread(target=run_verification_bg, args=(complaint["_id"], complaint, repair_submission), daemon=True)
    thread.start()
    
    return {"message": "Repair submitted. AI verification running in background.", "status": "repair_submitted"}

@app.post("/complaints/{code}/check-authenticity")
def verify_authenticity(code: str):
    complaint = complaints_collection.find_one({"complaint_code": code})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    repair_sub = complaint.get("repair_submission")
    if not repair_sub or not repair_sub.get("photo_after"):
        raise HTTPException(status_code=400, detail="No repair photo available to verify")
        
    photo_path = repair_sub["photo_after"]
    if photo_path.startswith("/"): 
        photo_path = photo_path[1:]
        
    result = check_photo_authenticity(photo_path)
    return result

@app.get("/complaints/{code}/verification")
def get_verification(code: str):
    complaint = complaints_collection.find_one({"complaint_code": code}, {"ai_verification": 1, "repair_submission": 1})
    if not complaint or "ai_verification" not in complaint:
        raise HTTPException(status_code=404, detail="Verification not found")
    return doc_helper(complaint)

@app.patch("/complaints/{code}/approve")
def approve_complaint(code: str, current_user: dict = Depends(get_current_user)):
    complaint = complaints_collection.find_one({"complaint_code": code})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    role = current_user.get("role", "citizen")
    
    # Only citizens can close a complaint (municipal/contractor cannot)
    if role not in ["citizen", "admin"]:
        raise HTTPException(status_code=403, detail="Only the reporting citizen can close this complaint")
        
    if complaint.get("status") != "ai_verified":
        raise HTTPException(status_code=400, detail=f"Complaint must be AI verified before closing. Current status: {complaint.get('status')}")
    
    timestamp = datetime.utcnow()
    complaints_collection.update_one(
        {"_id": complaint["_id"]},
        {
            "$set": {"status": "closed", "updated_at": timestamp},
            "$push": {"status_history": {"status": "closed", "timestamp": timestamp}}
        }
    )
    return {"message": "Complaint closed successfully"}

class AssignModel(BaseModel):
    contractor_name: str

@app.patch("/complaints/{code}/assign")
def assign_complaint(code: str, body: AssignModel, current_user: dict = Depends(get_current_user)):
    complaint = complaints_collection.find_one({"complaint_code": code})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    timestamp = datetime.utcnow()
    complaints_collection.update_one(
        {"_id": complaint["_id"]},
        {
            "$set": {
                "assigned_contractor": body.contractor_name,
                "status": "assigned",
                "updated_at": timestamp
            },
            "$push": {"status_history": {"status": "assigned", "timestamp": timestamp}}
        }
    )
    return {"message": f"Assigned to {body.contractor_name}"}

@app.patch("/complaints/{code}/work-started")
def mark_work_started(code: str, current_user: dict = Depends(get_current_user)):
    complaint = complaints_collection.find_one({"complaint_code": code})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    timestamp = datetime.utcnow()
    complaints_collection.update_one(
        {"_id": complaint["_id"]},
        {
            "$set": {"status": "work_started", "updated_at": timestamp},
            "$push": {"status_history": {"status": "work_started", "timestamp": timestamp}}
        }
    )
    return {"message": "Work started"}
