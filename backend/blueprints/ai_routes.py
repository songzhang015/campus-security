from flask import Blueprint, jsonify, request
from services.AIService import ai_service
import traceback

from utils import build_response 
from services.ai_service import AIService
from anthropic import APIError

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/parse", methods=["POST"])
def parse_incident():
    """
    POST /api/ai/parse
    Expects body: { "description": "Raw text from the dispatcher..." }
    
    Response:
    {
        "success": True,
        "data": [
            {
                "entryTitle": "Columbian Brew",
                "entryDate": "2025-02-01",
                "roastLevel": "Medium",
                ...
            }
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        if not data or "description" not in data:
            return build_response(False, "Missing 'description' in request body.", 400)

        description = data["description"]

        # Call the service layer
        categorized_data = ai_service.parse_incident_description(description)

        return build_response(True, categorized_data, 200)

    except ValueError as e:
        # Catches business logic errors (e.g., description too short)
        return build_response(False, str(e), 400)

    except APIError as e:
        # Catches Anthropic network errors, rate limits, or bad API keys
        print(f"Anthropic Network Error: {str(e)}")
        return build_response(False, "Failed to connect to the AI service.", 502)

    except RuntimeError as e:
        # Catches our JSON parsing error if Claude goes rogue
        print(f"AI Service Error: {str(e)}")
        return build_response(False, "AI failed to categorize the incident properly.", 500)

    except Exception as e:
        # General catch-all for unexpected crashes
        print(f"Unexpected Server Error in AI Route: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)