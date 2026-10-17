import os
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from auth import hash_password

load_dotenv('C:/PaveTrack 2/backend/.env')
client = MongoClient(os.getenv('MONGO_URI'))
db = client['pavetrack_db']

def init_users():
    # 1. Ensure admin@pavetrack.gov
    admin_gov = db.users.find_one({'email': 'admin@pavetrack.gov'})
    if not admin_gov:
        db.users.insert_one({
            'name': 'System Administrator',
            'email': 'admin@pavetrack.gov',
            'password_hash': hash_password('admin123'),
            'phone': '9876543210',
            'role': 'admin',
            'approval_status': 'approved',
            'area': 'Central Administration',
            'created_at': datetime.utcnow()
        })
        print('Created admin@pavetrack.gov')
    else:
        db.users.update_one(
            {'email': 'admin@pavetrack.gov'},
            {'$set': {'approval_status': 'approved', 'role': 'admin'}}
        )
        print('Updated admin@pavetrack.gov')

    # 2. Ensure admin@example.com is approved admin
    db.users.update_one(
        {'email': 'admin@example.com'},
        {'$set': {'approval_status': 'approved', 'role': 'admin'}}
    )
    print('Updated admin@example.com')

    # 3. Ensure all citizens are approved
    db.users.update_many(
        {'role': 'citizen', 'approval_status': {'$exists': False}},
        {'$set': {'approval_status': 'approved'}}
    )

    # 4. For demo accounts muncipal12@gmail.com and contractor12@gmail.com, set approved
    db.users.update_one({'email': 'muncipal12@gmail.com'}, {'$set': {'approval_status': 'approved'}})
    db.users.update_one({'email': 'contractor12@gmail.com'}, {'$set': {'approval_status': 'approved'}})

    # 5. Any other municipal or contractor without approval_status becomes pending
    db.users.update_many(
        {'role': {'$in': ['municipal', 'contractor']}, 'approval_status': {'$exists': False}},
        {'$set': {'approval_status': 'pending'}}
    )

    print('\n--- ALL USERS IN DB ---')
    for u in db.users.find({}, {'password_hash': 0}):
        print(f"Email: {u.get('email')} | Role: {u.get('role')} | Status: {u.get('approval_status', 'pending')}")

if __name__ == '__main__':
    init_users()
