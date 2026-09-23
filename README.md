# PaveTrack

A full-stack web application — a civic platform where citizens report potholes, authorities process and repair them, and an AI verification step confirms the repair using image and GPS comparison.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, React Leaflet
- **Backend**: Python (FastAPI), PyMongo
- **Database**: MongoDB Atlas
- **AI Verification**: Google Gemini API (`google-genai` SDK)

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_here (e.g., generate a random string)
```

### 2. Backend Setup
Navigate to the `backend/` directory and install the requirements:
```bash
cd backend
pip install -r requirements.txt
```

Run the seed script to populate MongoDB with sample data:
```bash
python seed.py
```

Start the FastAPI server:
```bash
uvicorn main:app --reload
```
The backend will run on `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal, navigate to the `frontend/` directory, install dependencies, and start Vite:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.
