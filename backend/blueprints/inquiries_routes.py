from flask import Blueprint, jsonify, request
from services.InquiriesService import inquiries_service
from utils import build_response

inquiries_bp = Blueprint("inquiries", __name__)

@inquiries_bp.route("/inquiry", methods=["POST"])
def create_inquiry():
    """
    POST /api/public/inquiry
    Expects: { "university": "...", "name": "...", "email": "..." }
    """
    try:
        data = request.get_json()
        
        success_message = inquiries_service.submit_inquiry(data)
        
        return build_response(True, success_message, 201)

    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error in Inquiry: {str(e)}")
        return build_response(False, "We are experiencing technical difficulties. Please try again later.", 500)
    except Exception as e:
        print(f"Server Error in Inquiry: {str(e)}")
        return build_response(False, "An unexpected error occurred.", 500)