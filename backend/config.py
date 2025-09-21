import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///job_listings.db')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Pagination settings
    DEFAULT_PAGE_SIZE = int(os.getenv('DEFAULT_PAGE_SIZE', '10'))
    MAX_PAGE_SIZE = int(os.getenv('MAX_PAGE_SIZE', '100'))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    DATABASE_URL = 'sqlite:///job_listings_dev.db'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    DATABASE_URL = os.getenv('DATABASE_URL')

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_URL = 'sqlite:///job_listings_test.db'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
