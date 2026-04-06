from flask import Blueprint, jsonify, request
from services.OrganizationsService import organizations_service
import traceback

organizations_bp = Blueprint("organizations", __name__)

@organizations_bp.route("/users/<user_id>/entries", methods=["GET"])
