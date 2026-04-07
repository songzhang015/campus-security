from flask import Blueprint, jsonify, request
from services.inquiries_service import inquiries_service
from helpers.utils import build_response

inquiries_bp = Blueprint("inquiries", __name__)

@inquiries_bp.route("/", methods=["POST"])
def create_inquiry():
    """
    POST /api/inquiries/
    Expects: { "university": "...", "name": "...", "email": "..." }
    """
    try:
        data = request.get_json()
        res = inquiries_service.submit_inquiry(data)
        
        return build_response(True, res, 201)

    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error in Inquiry: {str(e)}")
        return build_response(False, "We are experiencing technical difficulties. Please try again later.", 500)
    except Exception as e:
        print(f"Server Error in Inquiry: {str(e)}")
        return build_response(False, "An unexpected error occurred.", 500)