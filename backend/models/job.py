from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Job(Base):
    __tablename__ = 'jobs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    location = Column(String(200), nullable=False)
    posting_date = Column(DateTime, default=datetime.utcnow)
    job_type = Column(String(50), nullable=False, default='full-time')  # full-time, part-time, contract, internship
    tags = Column(Text, nullable=True)  # comma-separated tags
    description = Column(Text, nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    experience_level = Column(String(50), nullable=True)  # entry, mid, senior, etc.
    skills_required = Column(Text, nullable=True)
    application_url = Column(String(500), nullable=True)
    source = Column(String(100), nullable=True, default='manual')  # manual, scraped, etc.
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'posting_date': self.posting_date.isoformat() if self.posting_date else None,
            'job_type': self.job_type,
            'tags': self.tags,
            'description': self.description,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'experience_level': self.experience_level,
            'skills_required': self.skills_required,
            'application_url': self.application_url,
            'source': self.source
        }
