from database.organizations_repository import OrganizationsRepository
import os
import jwt
from datetime import datetime, timedelta, timezone
from werkzeug.security import check_password_hash

class AuthService:
    def __init__(self):
        self.repo = OrganizationsRepository()
        self.jwt_secret = os.getenv("JWT_SECRET")
        if not self.jwt_secret:
            raise ValueError("JWT_SECRET is missing from environment variables.")

    def verify_connection_code(self, connect_code):
        if not connect_code or len(str(connect_code)) != 6:
            raise ValueError("Connection code must be exactly 6 digits.")

        org = self.repo.find_org_by_code(str(connect_code))
        if not org:
            raise ValueError("Invalid connection code. Organization not found.")

        return {"name": org["name"]}

    def login(self, connect_code, password):
        if not connect_code or not password:
            raise ValueError("Both connection code and password are required.")

        org = self.repo.find_org_by_code(str(connect_code))
        if not org:
            raise ValueError("Invalid connection code.")

        stored_hash = org.get("password_hash")

        if not stored_hash or not check_password_hash(stored_hash, password):
            raise ValueError("Incorrect password.")

        payload = {
            "org_id": str(org["_id"]),
            "org_name": org["name"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm="HS256")
        
        return {
            "token": token,
            "org_name": org["name"]
        }

auth_service = AuthService()