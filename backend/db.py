from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.job import Base

import os

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///job_listings.db')

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize the database and create tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
