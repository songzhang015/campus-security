from database.inquiries_repository import InquiriesRepository
import random
from datetime import date

class InquiriesService:
    def __init__(self):
        self.repo = InquiriesRepository()

    def submit_inquiry(self, data):
        if not data:
            raise ValueError("No data provided.")

        university = data.get("university")
        name = data.get("name")
        email = data.get("email")

        if not university:
            raise ValueError("A valid university name is required.")

        if not name:
            raise ValueError("A valid contact name is required.")

        if not email or "@" not in email:
            raise ValueError("A valid email address is required.")

        clean_inquiry = {
                "university": university.strip(),
                "name": name.strip(),
                "email": email.strip(),
                "phone": data.get("phone", "").strip(),
                "dispatch_system": data.get("dispatchSystem", "").strip(),
                "incidents_estimate": data.get("incidents", "").strip(),
                "comments": data.get("comments", "").strip(),
            }

        inquiry_id = self.repo.create_inquiry(clean_inquiry)
        
        return "Your inquiry has been received. Our team will contact you shortly."

inquiries_service = InquiriesService()