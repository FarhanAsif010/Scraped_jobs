import React, { useState, useEffect } from 'react';

const JobForm = ({ job, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'full-time',
    tags: '',
    description: '',
    salary_min: '',
    salary_max: '',
    experience_level: 'mid',
    skills_required: '',
    application_url: '',
    source: 'manual',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        job_type: job.job_type || 'full-time',
        tags: job.tags || '',
        description: job.description || '',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        experience_level: job.experience_level || 'mid',
        skills_required: job.skills_required || '',
        application_url: job.application_url || '',
        source: job.source || 'manual',
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.salary_min && formData.salary_max) {
      const min = parseFloat(formData.salary_min);
      const max = parseFloat(formData.salary_max);
      if (min > max) {
        newErrors.salary_max =
          'Maximum salary must be greater than minimum salary';
      }
    }

    if (formData.application_url && !isValidUrl(formData.application_url)) {
      newErrors.application_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
    };

    onSubmit(submitData);
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead/Principal' },
    { value: 'executive', label: 'Executive' },
  ];

  return (
    <div className="form-container">
      <div className="form-content">
        <div className="form-header">
          <h2>{job ? 'Edit Job' : 'Add New Job'}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="e.g., Software Engineer"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={errors.company ? 'error' : ''}
              placeholder="e.g., Google"
            />
            {errors.company && (
              <span className="error-text">{errors.company}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
              placeholder="e.g., San Francisco, CA"
            />
            {errors.location && (
              <span className="error-text">{errors.location}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., Life, Health, Python, Remote (comma-separated)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              rows="5"
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="salary_min">Minimum Salary</label>
              <input
                type="number"
                id="salary_min"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="e.g., 50000"
                min="0"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="salary_max">Maximum Salary</label>
              <input
                type="number"
                id="salary_max"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="e.g., 80000"
                min="0"
                className={errors.salary_max ? 'error' : ''}
              />
              {errors.salary_max && (
                <span className="error-text">{errors.salary_max}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="job_type">Job Type</label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="experience_level">Experience Level</label>
              <select
                id="experience_level"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
              >
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skills_required">Required Skills</label>
            <textarea
              id="skills_required"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleChange}
              placeholder="List the required skills, separated by commas..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="application_url">Application URL</label>
            <input
              type="url"
              id="application_url"
              name="application_url"
              value={formData.application_url}
              onChange={handleChange}
              className={errors.application_url ? 'error' : ''}
              placeholder="https://company.com/careers/job-id"
            />
            {errors.application_url && (
              <span className="error-text">{errors.application_url}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="manual">Manual Entry</option>
              <option value="indeed">Indeed</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
