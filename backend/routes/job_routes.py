from flask import Blueprint, request, jsonify
from sqlalchemy.orm import sessionmaker
from sqlalchemy import or_, and_
from ..models.job import Job
from ..db import engine
import json
from datetime import datetime

job_bp = Blueprint('jobs', __name__)
Session = sessionmaker(bind=engine)

@job_bp.route('/', methods=['GET'], strict_slashes=False)
def get_jobs():
    """Get all jobs with optional filtering and sorting"""
    session = Session()
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        location = request.args.get('location')
        job_type = request.args.get('job_type')
        tag = request.args.get('tag')
        search = request.args.get('search')
        sort = request.args.get('sort', 'posting_date_desc')
        
        # Build query
        query = session.query(Job)
        
        # Apply filters
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
        if job_type:
            query = query.filter(Job.job_type == job_type)
        if tag:
            query = query.filter(Job.tags.ilike(f'%{tag}%'))
        if search:
            query = query.filter(
                or_(
                    Job.title.ilike(f'%{search}%'),
                    Job.company.ilike(f'%{search}%'),
                    Job.description.ilike(f'%{search}%')
                )
            )
        
        # Apply sorting
        if sort == 'posting_date_desc':
            query = query.order_by(Job.posting_date.desc())
        elif sort == 'posting_date_asc':
            query = query.order_by(Job.posting_date.asc())
        elif sort == 'title_asc':
            query = query.order_by(Job.title.asc())
        elif sort == 'title_desc':
            query = query.order_by(Job.title.desc())
        elif sort == 'company_asc':
            query = query.order_by(Job.company.asc())
        elif sort == 'company_desc':
            query = query.order_by(Job.company.desc())
        else:
            # Default sorting
            query = query.order_by(Job.posting_date.desc())
        
        # Pagination
        total = query.count()
        jobs = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return jsonify({
            'jobs': [job.to_dict() for job in jobs],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@job_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Get a specific job by ID"""
    session = Session()
    try:
        job = session.query(Job).filter(Job.id == job_id).first()
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        return jsonify(job.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@job_bp.route('/', methods=['POST'])
def create_job():
    """Create a new job"""
    session = Session()
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'company', 'location']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create new job
        job = Job(
            title=data['title'],
            company=data['company'],
            location=data['location'],
            job_type=data.get('job_type', 'full-time'),
            tags=data.get('tags'),
            description=data.get('description'),
            salary_min=data.get('salary_min'),
            salary_max=data.get('salary_max'),
            experience_level=data.get('experience_level'),
            skills_required=data.get('skills_required'),
            application_url=data.get('application_url'),
            source=data.get('source', 'manual')
        )
        
        session.add(job)
        session.commit()
        
        return jsonify(job.to_dict()), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@job_bp.route('/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """Update an existing job"""
    session = Session()
    try:
        job = session.query(Job).filter(Job.id == job_id).first()
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        for field in ['title', 'company', 'location', 'job_type', 'tags', 'description', 
                     'salary_min', 'salary_max', 'experience_level', 'skills_required', 
                     'application_url', 'source']:
            if field in data:
                setattr(job, field, data[field])
        
        session.commit()
        return jsonify(job.to_dict())
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@job_bp.route('/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Delete a job"""
    session = Session()
    try:
        job = session.query(Job).filter(Job.id == job_id).first()
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        session.delete(job)
        session.commit()
        
        return jsonify({'message': 'Job deleted successfully'})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@job_bp.route('/search', methods=['GET'])
def search_jobs():
    """Search jobs by title, company, or description"""
    session = Session()
    try:
        query_text = request.args.get('q', '')
        if not query_text:
            return jsonify({'error': 'Search query is required'}), 400
        
        jobs = session.query(Job).filter(
            or_(
                Job.title.ilike(f'%{query_text}%'),
                Job.company.ilike(f'%{query_text}%'),
                Job.description.ilike(f'%{query_text}%'),
                Job.tags.ilike(f'%{query_text}%')
            )
        ).all()
        
        return jsonify({'jobs': [job.to_dict() for job in jobs]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
