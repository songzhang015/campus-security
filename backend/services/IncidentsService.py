from database.IncidentsRepository import IncidentsRepository
import random
from datetime import date

class IncidentsService:
    def __init__(self):
        self.repo = IncidentsRepository()

    def get_all_entries(self, user_id):
        user_exists = self.repo.user_exists(user_id)
        if not user_exists:
            raise ValueError(f"User with ID {user_id} not found")
        return self.repo.find_all_entries(user_id)

incidents_service = IncidentsService()