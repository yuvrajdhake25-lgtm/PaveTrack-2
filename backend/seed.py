import os
from datetime import datetime, timedelta
from database import users_collection, complaints_collection
from auth import hash_password
from bson import ObjectId

def seed_db():
    print("Clearing collections...")
    users_collection.delete_many({})
    complaints_collection.delete_many({})

    print("Creating mock users...")
    citizen_id = ObjectId()
    admin_id = ObjectId()

    users_collection.insert_many([
        {
            "_id": citizen_id,
            "name": "Jane Citizen",
            "email": "jane@example.com",
            "phone": "1234567890",
            "password_hash": hash_password("password"),
            "role": "citizen",
            "area": "Navi Mumbai"
        },
        {
            "_id": admin_id,
            "name": "Admin User",
            "email": "admin@example.com",
            "phone": "0987654321",
            "password_hash": hash_password("admin"),
            "role": "admin",
            "area": "All"
        }
    ])

    print("Creating mock complaints...")
    now = datetime.utcnow()
    
    # 1. The specific requested scenario (PTH-2026-00125)
    complaints_collection.insert_one({
        "complaint_code": "PTH-2026-00125",
        "user_id": citizen_id,
        "location": "Airoli, Navi Mumbai",
        "latitude": 19.1590,
        "longitude": 72.9986,
        "description": "Large pothole causing traffic slowdowns.",
        "severity": "High",
        "status": "ai_verified",
        "photo_before": "/static/potholes/mock_before.jpg",
        "assigned_contractor": "RoadWorks Inc.",
        "created_at": now - timedelta(days=5),
        "updated_at": now - timedelta(hours=1),
        "status_history": [
            {"status": "reported", "timestamp": now - timedelta(days=5)},
            {"status": "verified", "timestamp": now - timedelta(days=4)},
            {"status": "assigned", "timestamp": now - timedelta(days=3)},
            {"status": "work_started", "timestamp": now - timedelta(days=2)},
            {"status": "repair_submitted", "timestamp": now - timedelta(hours=2)},
            {"status": "ai_verified", "timestamp": now - timedelta(hours=1)}
        ],
        "repair_submission": {
            "photo_after": "/static/potholes/mock_after.jpg",
            "latitude": 19.1591,
            "longitude": 72.9987,
            "submitted_at": now - timedelta(hours=2)
        },
        "ai_verification": {
            "gps_match_score": 90,
            "angle_match_score": 88,
            "background_match_score": 93,
            "road_region_score": 91,
            "overall_score": 92,
            "verified": True,
            "needs_manual_review": False,
            "reasoning": "High confidence match. Background structures align, and the repaired region corresponds to the previous pothole coordinates."
        }
    })

    # 2. A reported but not processed one
    complaints_collection.insert_one({
        "complaint_code": "PTH-2026-00126",
        "user_id": citizen_id,
        "location": "Vashi, Navi Mumbai",
        "latitude": 19.0760,
        "longitude": 72.9977,
        "description": "Small cracks forming on the edge of the highway.",
        "severity": "Low",
        "status": "reported",
        "photo_before": "/static/potholes/mock_before.jpg",
        "assigned_contractor": None,
        "created_at": now - timedelta(hours=5),
        "updated_at": now - timedelta(hours=5),
        "status_history": [
            {"status": "reported", "timestamp": now - timedelta(hours=5)}
        ]
    })

    # 3. A closed one
    complaints_collection.insert_one({
        "complaint_code": "PTH-2026-00127",
        "user_id": citizen_id,
        "location": "Kopar Khairane",
        "latitude": 19.1034,
        "longitude": 73.0030,
        "description": "Deep pothole fixed last week.",
        "severity": "Critical",
        "status": "closed",
        "photo_before": "/static/potholes/mock_before.jpg",
        "assigned_contractor": "City Repairs Corp",
        "created_at": now - timedelta(days=10),
        "updated_at": now - timedelta(days=2),
        "status_history": [
            {"status": "reported", "timestamp": now - timedelta(days=10)},
            {"status": "closed", "timestamp": now - timedelta(days=2)}
        ]
    })

    # Create dummy image files if they don't exist
    os.makedirs("static/potholes", exist_ok=True)
    with open("static/potholes/mock_before.jpg", "w") as f:
        f.write("mock image content")
    with open("static/potholes/mock_after.jpg", "w") as f:
        f.write("mock image content")

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
