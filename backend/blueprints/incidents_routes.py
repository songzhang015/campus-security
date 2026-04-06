from flask import Blueprint, jsonify, request
from services.incidents_service import incidents_service
from helpers.utils import build_response
from middleware.auth_middleware import token_required

incidents_bp = Blueprint("incidents", __name__)

@incidents_bp.route("/", methods=["GET"])
@token_required
def get_incidents():
    """
    GET /api/incidents?status=All&priority=High&time=Last 24h&page=1&limit=10
    """
    try:
        org_id = request.org_id
        
        # Grab URL parameters
        filters = {
            "status": request.args.get("status", "All"),
            "priority": request.args.get("priority", "All"),
            "time": request.args.get("time", "Last 24h"),
            "page": request.args.get("page", 1),
            "limit": request.args.get("limit", 10)
        }
        
        result = incidents_service.get_paginated_incidents(org_id, filters)
        return build_response(True, result, 200)
        
    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error fetching incidents: {str(e)}")
        return build_response(False, "A database error occurred.", 500)
    except Exception as e:
        print(f"Server Error fetching incidents: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)


@incidents_bp.route("/", methods=["POST"])
@token_required
def create_incident():
    """POST /api/incidents"""
    try:
        org_id = request.org_id
        data = request.get_json()
        
        new_incident = incidents_service.create_incident(org_id, data)
        return build_response(True, new_incident, 201)
        
    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error creating incident: {str(e)}")
        return build_response(False, "A database error occurred.", 500)
    except Exception as e:
        print(f"Server Error creating incident: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)


@incidents_bp.route("/<incident_id>", methods=["PATCH"])
@token_required
def update_incident(incident_id):
    """PATCH /api/incidents/<incident_id>"""
    try:
        org_id = request.org_id
        data = request.get_json()
        
        updated = incidents_service.update_incident(incident_id, org_id, data)
        return build_response(True, updated, 200)
        
    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error updating incident: {str(e)}")
        return build_response(False, "A database error occurred.", 500)
    except Exception as e:
        print(f"Server Error updating incident: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)