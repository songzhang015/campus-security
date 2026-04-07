from flask import Flask
from flask_cors import CORS
from helpers.utils import build_response
from blueprints.ai_routes import ai_bp
from blueprints.auth_routes import auth_bp
from blueprints.incidents_routes import incidents_bp
from blueprints.inquiries_routes import inquiries_bp
from blueprints.stats_routes import stats_bp
import os

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://campus-security-2wjnm2ns6-song-zhangs-projects.vercel.app",
    ],
)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(incidents_bp, url_prefix="/api/incidents")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(stats_bp, url_prefix="/api/stats")
app.register_blueprint(inquiries_bp, url_prefix="/api/inquiries")

@app.route("/")
def index():
    return "Hello world!"

@app.route("/health")
def health():
    return build_response(True, "Services are running!", 200)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)