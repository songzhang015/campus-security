import os
import jwt
from functools import wraps
from flask import request
from helpers.utils import build_response

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return build_response(False, "Authentication token is missing.", 401)

        try:
            secret_key = os.getenv("JWT_SECRET")
            payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            
            request.org_id = payload["org_id"]
            
        except jwt.ExpiredSignatureError:
            return build_response(False, "Your session has expired. Please log in again.", 401)
        except jwt.InvalidTokenError:
            return build_response(False, "Invalid authentication token.", 401)
        except Exception as e:
            return build_response(False, "An error occurred while verifying your session.", 500)

        return f(*args, **kwargs)
        
    return decorated