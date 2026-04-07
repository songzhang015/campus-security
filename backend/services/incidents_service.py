from database.incidents_repository import IncidentsRepository
import random
from datetime import datetime, timedelta, timezone

class IncidentsService:
    def __init__(self):
        self.repo = IncidentsRepository()

    def create_incident(self, org_id, data):
        if not data.get("description") or not data.get("location"):
            raise ValueError("Description and location are required.")

        # TODO:
        # If you're reading this I'm too lazy to check for ID collisions, please don't sue me
        # ;-;
        new_id = f"#{random.randint(100000, 999999)}"

        new_incident = {
            "org_id": org_id,
            "id": new_id,
            "priority": data.get("priority"),
            "type": data.get("type"),
            "category": data.get("category"),
            "location": data.get("location"),
            "status": "PENDING",
            "description": data.get("description"),
            "short_desc": data.get("short_desc", data.get("description")[:40] + "..."),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "dispatched_at": None,
            "resolved_at": None,
            "assigned": None,
            "follow_up": None,
        }

        return self.repo.create_incident(new_incident)

    def get_paginated_incidents(self, org_id, filters):
        query = {"org_id": org_id}

        status = filters.get("status", "All")
        if status.upper() != "ALL":
            query["status"] = status.upper()

        priority = filters.get("priority", "All")
        if priority.upper() != "ALL":
            query["priority"] = priority.upper()

        time_filter = filters.get("time", "Last 24h")
        now = datetime.now(timezone.utc)
        
        if time_filter == "Last 24h":
            query["created_at"] = {"$gte": (now - timedelta(hours=24)).isoformat()}
        elif time_filter == "Last 7 Days":
            query["created_at"] = {"$gte": (now - timedelta(days=7)).isoformat()}
        elif time_filter == "Last 30 Days":
            query["created_at"] = {"$gte": (now - timedelta(days=30)).isoformat()}

        try:
            page = int(filters.get("page", 1))
            limit = int(filters.get("limit", 10))
            if limit not in [10, 20, 50]:
                limit = 10
        except ValueError:
            page, limit = 1, 10

        skip = (page - 1) * limit

        incidents = self.repo.get_incidents(query, skip, limit)
        total_count = self.repo.count_incidents(query)

        return {
            "incidents": incidents,
            "pagination": {
                "total": total_count,
                "page": page,
                "limit": limit,
                "total_pages": (total_count + limit - 1) // limit
            }
        }

    def update_incident(self, object_id, org_id, data):
        update_data = {k: v for k, v in data.items() if k not in ["_id", "id", "org_id", "created_at"]}
        
        if not update_data:
            raise ValueError("No valid update data provided.")

        updated_doc = self.repo.update_incident(object_id, org_id, update_data)
        if not updated_doc:
            raise ValueError("Incident not found or you do not have permission to edit it.")
            
        return updated_doc

    def get_recent_incidents_for_handoff(self, org_id, hours):
        """Fetches a flat list of incidents for the AI handoff generation."""
        if not isinstance(hours, int) or not (1 <= hours <= 24):
            raise ValueError("Hours must be an integer between 1 and 24.")
            
        now = datetime.now(timezone.utc)
        query = {
            "org_id": org_id,
            "created_at": {"$gte": (now - timedelta(hours=hours)).isoformat()}
        }
        
        return self.repo.get_incidents(query, skip=0, limit=200)
   
    def delete_incident(self, incident_id, org_id):
        if not incident_id:
            raise ValueError("Incident ID is required.")

        return self.repo.delete_incident(incident_id, org_id)

incidents_service = IncidentsService()