from flask import jsonify
from datetime import datetime, timezone

def build_response(success, response_data, status_code):
    """
    Standardized API response formatter.
    """
    return jsonify({
        "success": success,
        "response": response_data,
        "time": datetime.now(timezone.utc).isoformat()
    }), status_code