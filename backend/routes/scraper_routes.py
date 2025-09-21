import os
import json
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import sessionmaker
from sqlalchemy import or_, and_
from ..models.job import Job
from ..db import engine
from datetime import datetime

scraper_bp = Blueprint('scraper', __name__)
Session = sessionmaker(bind=engine)

# Adjust this path to your Scraper folder
SCRAPER_JSON_PATH = os.path.join(os.path.dirname(__file__), "../../Scraper/scraped_jobs.json")

@scraper_bp.route('/scraper-jobs', methods=['GET'])
def get_scraped_jobs():
    """Return jobs from the scraped_jobs.json file with optional filtering"""
    try:
        if not os.path.exists(SCRAPER_JSON_PATH):
            return jsonify({'error': 'Scraped jobs file not found'}), 404

        with open(SCRAPER_JSON_PATH, "r", encoding="utf-8") as f:
            jobs = json.load(f)

        # Apply filters if provided
        location = request.args.get('location')
        job_type = request.args.get('job_type')
        search = request.args.get('search')
        
        filtered_jobs = jobs
        
        if location:
            filtered_jobs = [job for job in filtered_jobs 
                           if location.lower() in job.get('location', '').lower()]
        
        if job_type:
            filtered_jobs = [job for job in filtered_jobs 
                           if job.get('job_type') == job_type]
        
        if search:
            search_lower = search.lower()
            filtered_jobs = [job for job in filtered_jobs 
                           if (search_lower in job.get('title', '').lower() or
                               search_lower in job.get('company', '').lower() or
                               search_lower in job.get('description', '').lower())]

        return jsonify({'jobs': filtered_jobs, 'total': len(filtered_jobs)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@scraper_bp.route('/load-scraped-jobs', methods=['POST'])
def load_scraped_jobs_to_db():
    """Load scraped jobs from JSON file into the database"""
    try:
        if not os.path.exists(SCRAPER_JSON_PATH):
            return jsonify({'error': 'Scraped jobs file not found'}), 404

        with open(SCRAPER_JSON_PATH, "r", encoding="utf-8") as f:
            scraped_jobs = json.load(f)

        session = Session()
        loaded_count = 0
        skipped_count = 0
        
        for job_data in scraped_jobs:
            # Check if job already exists (by title, company, and application_url)
            existing_job = session.query(Job).filter(
                Job.title == job_data.get('title'),
                Job.company == job_data.get('company'),
                Job.application_url == job_data.get('application_url')
            ).first()
            
            if existing_job:
                skipped_count += 1
                continue
            
            # Parse posting date
            posting_date = None
            if job_data.get('posting_date'):
                try:
                    posting_date = datetime.fromisoformat(job_data['posting_date'].replace('Z', '+00:00'))
                except:
                    posting_date = datetime.now()
            else:
                posting_date = datetime.now()
            
            # Create new job
            job = Job(
                title=job_data.get('title', ''),
                company=job_data.get('company', ''),
                location=job_data.get('location', ''),
                job_type=job_data.get('job_type', 'full-time'),
                tags=job_data.get('tags'),
                description=job_data.get('description'),
                salary_min=job_data.get('salary_min'),
                salary_max=job_data.get('salary_max'),
                experience_level=job_data.get('experience_level'),
                skills_required=job_data.get('skills_required'),
                application_url=job_data.get('application_url'),
                source=job_data.get('source', 'scraper'),
                posting_date=posting_date
            )
            
            session.add(job)
            loaded_count += 1
        
        session.commit()
        
        return jsonify({
            'message': f'Successfully loaded {loaded_count} jobs, skipped {skipped_count} duplicates',
            'loaded': loaded_count,
            'skipped': skipped_count
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
