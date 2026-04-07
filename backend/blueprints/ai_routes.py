from flask import Blueprint, request
from services.ai_service import ai_service
from services.incidents_service import incidents_service
from helpers.utils import build_response 
from anthropic import APIError
from middleware.auth_middleware import token_required

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/parse", methods=["POST"])
@token_required
def parse_incident():
    """
    POST /api/ai/parse
    Parses an incident description and categorizes it (autofill)

    Expects body: { "description": "Raw text from the dispatcher..." }
    """
    try:
        data = request.get_json()
        if not data or "description" not in data:
            return build_response(False, "Missing 'description' in request body.", 400)

        description = data["description"]

        categorized_data = ai_service.parse_incident_description(description)

        return build_response(True, categorized_data, 200)

    except ValueError as e:
        return build_response(False, str(e), 400)

    except APIError as e:
        print(f"Anthropic Network Error: {str(e)}")
        return build_response(False, "Failed to connect to the AI service.", 502)

    except RuntimeError as e:
        print(f"AI Service Error: {str(e)}")
        return build_response(False, "AI failed to categorize the incident properly.", 500)

    except Exception as e:
        print(f"Unexpected Server Error in AI Route: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)
    
@ai_bp.route("/handoff", methods=["GET"])
@token_required
def get_shift_handoff():
    """
    GET /api/ai/handoff?hours=12
    Generates a shift handoff report
    """
    try:
        org_id = request.org_id
        
        hours_param = request.args.get("hours", 12)
        try:
            hours = int(hours_param)
        except ValueError:
            return build_response(False, "Hours parameter must be a valid integer.", 400)

        recent_incidents = incidents_service.get_recent_incidents_for_handoff(org_id, hours)
        
        clean_data = [
            {
                "id": inc.get("id"),
                "priority": inc.get("priority"),
                "status": inc.get("status"),
                "description": inc.get("description")
            }
            for inc in recent_incidents
        ]

        report_markdown = ai_service.generate_shift_handoff(clean_data, hours)

        return build_response(True, report_markdown, 200)

    except ValueError as e:
        return build_response(False, str(e), 400)
    except APIError as e:
        print(f"Anthropic Error: {str(e)}")
        return build_response(False, "Failed to connect to the AI service.", 502)
    except Exception as e:
        print(f"Server Error in Handoff Route: {str(e)}")
        return build_response(False, "An unexpected error occurred.", 500)


@ai_bp.route("/alert", methods=["POST"])
@token_required
def draft_alert():
    """
    POST /api/ai/alert
    Given an incident description that's HIGH or CRITICAL status, draft SMS/Email to copy

    Expects body: { "incident": { "description": "...", "location": "...", ... } }
    """
    try:
        data = request.get_json()
        if not data or "incident" not in data:
            return build_response(False, "Missing 'incident' details in request body.", 400)

        incident_details = data["incident"]

        drafts = ai_service.draft_campus_alert(incident_details)

        return build_response(True, drafts, 200)

    except APIError as e:
        print(f"Anthropic Error: {str(e)}")
        return build_response(False, "Failed to connect to the AI service.", 502)
    except RuntimeError as e:
        print(f"AI Formatting Error: {str(e)}")
        return build_response(False, "AI failed to format the alert properly.", 500)
    except Exception as e:
        print(f"Server Error in Alert Route: {str(e)}")
        return build_response(False, "An unexpected error occurred.", 500)