from database.incidents_repository import IncidentsRepository
import random
from datetime import date

class StatsService:
    def __init__(self):
        self.repo = IncidentsRepository()

    def get_dashboard_stats(self, org_id):
        """
        Calculates all-time dashboard stats for a specific organization.
        We use MongoDB's count_documents (via the repo) which is highly optimized.
        """
        if not org_id:
            raise ValueError("Organization ID is required to fetch stats.")

        # 1. High / Critical Count ($in lets us check for multiple values at once)
        high_critical_count = self.repo.count_incidents({
            "org_id": org_id,
            "priority": {"$in": ["HIGH", "CRITICAL"]},
            "status": {"$in": ["PENDING", "DISPATCHED"]}
        })

        # 2. Dispatched Count
        dispatched_count = self.repo.count_incidents({
            "org_id": org_id, 
            "status": "DISPATCHED"
        })

        # 3. Pending Count
        untouched_count = self.repo.count_incidents({
            "org_id": org_id, 
            "status": "PENDING"
        })

        # 4. Resolved Count
        resolved_count = self.repo.count_incidents({
            "org_id": org_id, 
            "status": "RESOLVED"
        })

        # Return the exact JSON shape your Next.js frontend expects
        return {
            "highCritical": high_critical_count,
            "dispatched": dispatched_count,
            "untouched": untouched_count,
            "resolved": resolved_count
        }

stats_service = StatsService()