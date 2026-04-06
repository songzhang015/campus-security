from flask import Blueprint, jsonify, request
from services.IncidentsService import incidents_service
import traceback

incidents_bp = Blueprint("incidents", __name__)

@incidents_bp.route("/users/<user_id>/entries", methods=["GET"])