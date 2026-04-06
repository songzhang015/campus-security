from database.Connection import Connection
from pymongo.errors import PyMongoError
from datetime import datetime, timezone

class InquiriesRepository(Connection):
    def __init__(self):
        super().__init__()

    def create_inquiry(self, inquiry_data):
        try:
            inquiry_data["created_at"] = datetime.now(timezone.utc).isoformat()
            
            result = self.collection.insert_one(inquiry_data)
            return str(result.inserted_id)
            
        except PyMongoError as e:
            raise RuntimeError(f"Database error saving inquiry: {str(e)}")