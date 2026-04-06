from flask import Blueprint, jsonify, request
from services.StatsService import stats_service
import traceback

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/users/<user_id>/entries", methods=["GET"])
