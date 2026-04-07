from flask import Blueprint, jsonify, request
from services.stats_service import stats_service
from helpers.utils import build_response
from middleware.auth_middleware import token_required

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/", methods=["GET"])
@token_required
def get_dashboard_stats():
    """
    GET /api/stats/dashboard
    Returns the 4 key metrics for the top of the frontend dashboard.
    """
    try:
        org_id = request.org_id
        
        stats = stats_service.get_dashboard_stats(org_id)
        
        return build_response(True, stats, 200)

    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error fetching stats: {str(e)}")
        return build_response(False, "A database error occurred.", 500)
    except Exception as e:
        print(f"Server Error fetching stats: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)