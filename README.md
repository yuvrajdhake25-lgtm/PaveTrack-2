# PaveTrack 🛣️

**An AI-Assisted Civic Repair Accountability Platform**

PaveTrack is an end-to-end lifecycle management platform designed to solve a critical gap in civic infrastructure: **accountability**. 

While many apps allow citizens to report potholes, very few provide a transparent, traceable workflow to prove that the reported issue was *actually repaired*. PaveTrack bridges this gap by connecting citizens, municipalities, and contractors into a single ecosystem, capped off by an innovative AI-assisted verification layer.

---

## 🛑 The Problem
The problem isn't only that potholes go unreported. The bigger problem is **knowing whether a reported pothole was actually repaired**. Citizens lack transparency, and municipalities lack the manpower to physically inspect every contractor's claimed repair.

## 💡 The Solution
PaveTrack follows the entire repair lifecycle. It replaces disjointed reporting dashboards with a unified accountability system:
**Report** ➔ **Assign** ➔ **Repair & Submit Evidence** ➔ **Verify (AI)** ➔ **Resolve**

## 🚀 Key Innovation: AI-Assisted Verification
Our strongest differentiator is the **repair-verification workflow**. Contractors cannot simply change a ticket status to "Repaired." They must submit geographic and photographic evidence, which enters an automated verification pipeline.

### AI Verification Methodology
We utilize **Google Gemini 3.6 Flash** (Multimodal Vision AI) combined with spatial calculations to act as a preliminary inspection layer. The AI evaluates:
1. **GPS Coordinate Match:** Haversine distance calculation between the initial report and the repair submission.
2. **Camera Angle Consistency:** Ensuring the contractor's photo matches the perspective of the citizen's report.
3. **Background/Surroundings Match:** Verifying permanent fixtures (trees, curbs, buildings) to confirm location authenticity.
4. **Repair Quality Assessment:** Analyzing the road region to determine if the pothole has been adequately filled and paved.

If the AI confidence score drops below a threshold, the system automatically flags the ticket for **Manual Review** by the municipality.

---

## 🏗️ Architecture & Tech Stack

* **Frontend:** React.js (Vite), TailwindCSS, Lucide Icons, Leaflet (Maps)
* **Backend:** Python, FastAPI, Uvicorn
* **Database:** MongoDB Atlas (NoSQL)
* **Cloud Storage:** Cloudinary (Permanent HTTPS image hosting)
* **AI Engine:** Google Gemini SDK (`google-genai`)

## 👥 User Roles (The Ecosystem)

* **Citizen:** Reports issues with GPS & photos, tracks status, and reviews final AI verification to close the ticket.
* **Municipality:** Manages incoming reports, assigns them to contractors, and handles edge-case manual reviews.
* **Contractor:** Receives assignments, travels to the location, completes the work, and uploads "After" photographic evidence.

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yuvrajdhake25-lgtm/PaveTrack-2.git
cd "PaveTrack 2"
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
```
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
JWT_SECRET=your_secret_key
MONGO_URI=your_mongodb_cluster_url
GEMINI_API_KEY=your_google_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```
Run the server:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup (React/Vite)
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:8000
```
Run the client:
```bash
npm run dev
```

---

## 🧪 Demo Credentials
To experience the full lifecycle, you can create a new account or use these generic test accounts (ensure roles are set in your DB):
* **Citizen:** `citizen@test.com` / `password123`
* **Municipality:** `admin@test.com` / `password123`
* **Contractor:** `contractor@test.com` / `password123`

---

## ⚠️ Limitations & Future Scope
* **AI Limitations:** Image-based AI is *not* equivalent to ground-truth physical inspection. It is an "assistive" layer designed to filter out obvious fraud and reduce municipal workload.
* **Future Enhancements:** A production system would add stronger anti-spoofing controls, including signed EXIF timestamps, strict geofencing enforcement (preventing uploads if the device is not physically at the GPS coordinates), and device metadata validation.

---
*Built as a technical case study for civic infrastructure accountability.*
