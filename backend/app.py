from flask import Flask
from flask_cors import CORS
from .routes.job_routes import job_bp
from .routes.scraper_routes import scraper_bp
from .db import init_db

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Initialize database
    init_db()
    
    # Register blueprints
    app.register_blueprint(job_bp, url_prefix='/api/jobs')
    app.register_blueprint(scraper_bp, url_prefix='/api')
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
