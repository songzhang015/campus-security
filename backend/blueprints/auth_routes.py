from flask import Blueprint, jsonify, request
from services.auth_service import auth_service
from helpers.utils import build_response

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/verify", methods=["POST"])
def verify_code():
    """
    POST /api/auth/verify
    Expects: { "connect_code": "123456" }
    """
    try:
        data = request.get_json()
        code = data.get("connect_code")
        
        result = auth_service.verify_connection_code(code)
        return build_response(True, result, 200)

    except ValueError as e:
        return build_response(False, str(e), 400)
    except RuntimeError as e:
        print(f"DB Error: {str(e)}")
        return build_response(False, "A database error occurred.", 500)
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Expects: { "connect_code": "123456", "password": "my_password" }
    """
    try:
        data = request.get_json()
        code = data.get("connect_code")
        password = data.get("password")
        
        result = auth_service.login(code, password)
        return build_response(True, result, 200)

    except ValueError as e:
        return build_response(False, str(e), 401)
    except RuntimeError as e:
        print(f"DB Error: {str(e)}")
        return build_response(False, "A database error occurred.", 500)
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return build_response(False, "An unexpected server error occurred.", 500)