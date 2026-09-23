from pymongo import MongoClient
client = MongoClient('mongodb+srv://pavetrack_user:Rw9TmHk181LWsyEs@cluster0.dpziffj.mongodb.net/pavetrack_db?retryWrites=true&w=majority&appName=Cluster0')
db = client['pavetrack_db']
for code in ['PTH-2026-00125', 'PTH-2026-00127']:
    db['complaints'].update_one({'complaint_code': code}, {'$set': {'photo_before': '/static/potholes/before_1790130491.693793_image_8b34f833.jpg'}})
print('Updated successfully')
