from werkzeug.security import generate_password_hash
from database.connection import Connection

def seed_database():
    print("Connecting to database...")
    db_conn = Connection()
    
    orgs_collection = db_conn.organizations_collection
    
    print("Clearing existing organizations...")
    orgs_collection.delete_many({}) 

    print("Seeding University of Oregon...")
    uo_data = {
        "name": "University of Oregon",
        "connect_code": "123456",
        "password_hash": generate_password_hash("uo1234"),
        
        "contact_name": "John Dispatch",
        "email_address": "dispatch@uoregon.edu",
        "phone_number": "541-123-4567"
    }

    print("Seeding Oregon State University...")
    osu_data = {
        "name": "Oregon State University",
        "connect_code": "101412",
        "password_hash": generate_password_hash("osu1234"),
        
        "contact_name": "Jane Dispatch",
        "email_address": "dispatch@oregonstate.edu",
        "phone_number": "541-012-3456"
    }
    
    orgs_collection.insert_many([uo_data, osu_data])
    print("Seeding complete!")

if __name__ == "__main__":
    seed_database()