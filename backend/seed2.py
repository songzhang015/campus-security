import random
from datetime import datetime, timedelta, timezone
from database.connection import Connection

conn = Connection()
collection = conn.incidents_collection

ORG_ID = "69d30f97868fca0a885357cb"

PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
TYPES = ["CAMPUS_SECURITY", "POLICE", "MEDICAL", "MAINTENANCE", "RESIDENCE"]
STATUSES = ["PENDING", "DISPATCHED", "RESOLVED"]
CATEGORIES = ["NOISE_COMPLAINT", "TRESPASSING", "THEFT", "PROPERTY_DAMAGE", "WEAPON",
              "HARASSMENT", "SUSPICIOUS_PERSON", "INJURY", "MISCONDUCT", "FIRE_ALARM",
              "PLUMBING_ISSUE", "OTHER"]

LOCATIONS = [
    "Knight Library, Floor 2", "Erb Memorial Union", "Lot 54, East Entrance",
    "Hayward Field", "Pacific Hall, Room 101", "Hamilton Hall", "Autzen Stadium",
    "Student Recreation Center", "Lillis Business Complex", "Allen Hall"
]

DESCRIPTIONS = [
    "Student experiencing severe respiratory distress in the study area.",
    "Vandalism reported on parked vehicles near the east entrance.",
    "Broken pipe causing minor flooding in the first-floor restroom.",
    "Suspicious individual reported loitering near the parking structure.",
    "Student reported theft of laptop from unattended bag.",
    "Fire alarm triggered in the residence hall, cause unknown.",
    "Physical altercation reported between two students outside the union.",
    "Noise complaint from neighboring residents regarding a loud gathering.",
    "Unattended package found near the main entrance, security notified.",
    "Student found unresponsive in dormitory room, EMS contacted.",
    "Graffiti discovered on the south wall of the engineering building.",
    "Report of a weapon spotted near the athletics facility.",
    "Water leak from ceiling on the third floor of the library.",
    "Trespasser reported in the restricted server room.",
    "Student reported harassment near the campus bus stop.",
]

def random_timestamp():
    now = datetime.now(timezone.utc)
    offset = random.randint(0, 60 * 24 * 14)
    return (now - timedelta(minutes=offset)).isoformat()

incidents = []
for i in range(120):
    desc = random.choice(DESCRIPTIONS)
    incidents.append({
        "org_id": ORG_ID,
        "id": f"#{random.randint(100000, 999999)}",
        "priority": random.choice(PRIORITIES),
        "type": random.choice(TYPES),
        "category": random.choice(CATEGORIES),
        "location": random.choice(LOCATIONS),
        "status": random.choice(STATUSES),
        "description": desc,
        "short_desc": desc[:40] + "...",
        "created_at": random_timestamp(),
        "dispatched_at": None,
        "resolved_at": None,
        "assigned": None,
        "follow_up": None,
    })

result = collection.insert_many(incidents)
print(f"Inserted {len(result.inserted_ids)} incidents.")