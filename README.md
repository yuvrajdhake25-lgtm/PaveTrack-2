# PaveTrack 🛣️
**AI-Assisted Civic Repair Accountability Platform**

> **The Problem isn't only that potholes go unreported. The bigger problem is knowing whether a reported pothole was actually repaired.** 
>
> PaveTrack moves beyond standard civic reporting apps by enforcing a traceable, AI-verified accountability lifecycle. It ensures that when a contractor changes a status to "Repaired," they must submit cryptographic and visual evidence that enters an AI assessment workflow before the issue is closed.

---

## 🚀 Key Innovation
The core differentiator of PaveTrack is the **Repair Verification Lifecycle**. We use multimodal AI (Google Gemini Vision) not as a gimmick, but as an objective verification layer. A contractor cannot simply close a ticket; they must upload an after-repair photo with GPS metadata. The AI scores the submission based on location consistency, camera angle, background matching, and repair quality.

## 🔄 The Workflow (One Pothole's Journey)
1. **Citizen Report:** A citizen reports a pothole, capturing an image and GPS coordinates.
2. **Municipal Triage:** The municipality reviews the report on a geospatial dashboard and assigns a contractor.
3. **Contractor Repair:** The contractor performs the work and submits an "After" photo with fresh GPS metadata.
4. **AI Verification:** The system compares the Before/After evidence.
5. **Resolution:** If the AI confidence score is >75%, the repair is verified and closed. Otherwise, it is flagged for manual municipal review.

## 🏗️ Architecture & Tech Stack
PaveTrack is a modern, decoupled full-stack application.
* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
* **Backend:** FastAPI (Python), Uvicorn
* **Database:** MongoDB Atlas (NoSQL Document Store)
* **Storage:** Cloudinary (Permanent Cloud Image Hosting)
* **AI Engine:** Google Gemini Pro Vision 3.6 (Multimodal Assessment)
* **Maps:** OpenStreetMap (OSM) via Leaflet

## 🧠 AI Verification Methodology
Our AI integration does not claim to replace physical ground-truth inspection. Instead, it acts as an **AI-Assisted Evidence Assessment**.
The verification engine receives the original report data and the contractor's repair submission. It calculates a unified score based on:
1. **Haversine GPS Match:** Mathematical distance between the two coordinate sets.
2. **Camera Angle Consistency:** Assessed via Gemini Vision.
3. **Background Match:** Surrounding environmental consistency.
4. **Repair Quality:** Visual confirmation of fresh asphalt/concrete filling the original void.

## 👥 User Roles & Ecosystem
PaveTrack connects three isolated silos into one accountability chain:
* **Citizen:** Report, Track, and Hold Accountable
* **Municipality:** Manage, Assign, and Audit
* **Contractor:** Repair and Submit Proof

## 📸 Screenshots
*(Add screenshots of your UI here: The Map Dashboard, The Before/After Comparison, and the AI Breakdown)*

## ⚙️ Setup & Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas Account
- Cloudinary Account
- Gemini API Key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (or `venv\Scripts\activate` on Windows)
pip install -r requirements.txt
# Create a .env file with MONGO_URI, GEMINI_API_KEY, CLOUDINARY_*, and JWT_SECRET
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
# Create a .env.local file with VITE_API_URL=http://localhost:8000
npm run dev
```

## 🔑 Demo Credentials
To evaluate the platform, use the following test accounts:
* **Citizen:** `citizen@test.com` / `password123`
* **Municipality:** `muni@test.com` / `password123`
* **Contractor:** `contractor@test.com` / `password123`

## 🚧 Limitations & Future Scope
* **Current Limitation:** Image-based AI is susceptible to spoofing (e.g., taking a photo of a screen).
* **Future Scope:** Implement cryptographic device metadata hashing, forced in-app camera capture (disallowing gallery uploads), and tight geofencing to guarantee the contractor is physically standing on the pothole coordinates when submitting evidence.

## 🎥 Demo Video
*(Link your YouTube demo video here)*

---
*Built with ❤️ by Pixel Paradox.*
