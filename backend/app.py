from flask import Flask
from blueprints.auth.Routes import auth_bp
from blueprints.organizations.Routes import organizations_bp
from blueprints.incidents.Routes import incidents_bp
from blueprints.ai.Routes import ai_bp
from blueprints.stats.Routes import stats_bp
from blueprints.inquiries.Routes import inquiries_bp
import os

app = Flask(__name__)

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(organizations_bp, url_prefix="/api")
app.register_blueprint(incidents_bp, url_prefix="/api")
app.register_blueprint(ai_bp, url_prefix="/api")
app.register_blueprint(stats_bp, url_prefix="/api")
app.register_blueprint(inquiries_bp, url_prefix="/api")

@app.route("/")
def index():
    return "Hello world!"

@app.route("/health")
def health():
    return "All services active!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)