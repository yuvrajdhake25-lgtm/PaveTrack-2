import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

# Connect to the PaveTrack database
db = client["pavetrack_db"]

# Expose collections
users_collection = db["users"]
complaints_collection = db["complaints"]
