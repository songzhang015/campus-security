from database.connection import Connection
from pymongo.errors import PyMongoError

class OrganizationsRepository(Connection):
    def __init__(self):
        super().__init__()
        
    def find_org_by_code(self, connect_code):
        try:
            return self.organizations_collection.find_one({"connect_code": connect_code})
        except PyMongoError as e:
            raise RuntimeError(f"Database error finding organization: {str(e)}")