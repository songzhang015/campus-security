from database.incidents_repository import IncidentsRepository
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

        # Apparently $in lets us check for multiple values at once
        high_critical_count = self.repo.count_incidents({
            "org_id": org_id,
            "priority": {"$in": ["HIGH", "CRITICAL"]},
            "status": {"$in": ["PENDING", "DISPATCHED"]}
        })

        dispatched_count = self.repo.count_incidents({
            "org_id": org_id, 
            "status": "DISPATCHED"
        })

        untouched_count = self.repo.count_incidents({
            "org_id": org_id, 
            "status": "PENDING"
        })

        resolved_count = self.repo.count_incidents({
            "org_id": org_id, 
            "status": "RESOLVED"
        })

        return {
            "highCritical": high_critical_count,
            "dispatched": dispatched_count,
            "untouched": untouched_count,
            "resolved": resolved_count
        }

stats_service = StatsService()