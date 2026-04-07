from database.connection import Connection
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId

class IncidentsRepository(Connection):
    def __init__(self):
        super().__init__()

    def create_incident(self, incident_data):
            try:
                result = self.incidents_collection.insert_one(incident_data)
                # Add the mongo _id for frontend
                incident_data["_id"] = str(result.inserted_id)
                return incident_data
            except PyMongoError as e:
                raise RuntimeError(f"Database error creating incident: {str(e)}")

    def get_incidents(self, query_filter, skip, limit):
        try:
            cursor = self.incidents_collection.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
            
            # Clean up ObjectIds for JSON
            incidents = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                incidents.append(doc)
                
            return incidents
        except PyMongoError as e:
            raise RuntimeError(f"Database error fetching incidents: {str(e)}")

    def count_incidents(self, query_filter):
        try:
            return self.incidents_collection.count_documents(query_filter)
        except PyMongoError as e:
            raise RuntimeError(f"Database error counting incidents: {str(e)}")

    def update_incident(self, object_id_str, org_id, update_data):
        try:
            result = self.incidents_collection.find_one_and_update(
                {"_id": ObjectId(object_id_str), "org_id": org_id},
                {"$set": update_data},
                return_document=True
            )
            if result:
                result["_id"] = str(result["_id"])
            return result
        except PyMongoError as e:
            raise RuntimeError(f"Database error updating incident: {str(e)}")
        
    def delete_incident(self, incident_id, org_id):
        try:
            object_id = ObjectId(incident_id)
        except Exception:
            raise ValueError("Invalid incident ID.")

        try:
            result = self.incidents_collection.find_one_and_delete({
                "_id": object_id,
                "org_id": org_id,
            })

            if not result:
                raise ValueError("Incident not found.")

            result["_id"] = str(result["_id"])
            return result

        except PyMongoError as e:
            raise RuntimeError(f"Database error deleting incident: {str(e)}")