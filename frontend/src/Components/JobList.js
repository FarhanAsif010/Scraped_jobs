import React, { useState } from 'react';
import DeleteJob from './DeleteJob';

const JobList = ({
  jobs,
  onEdit,
  onDelete,
  loading,
  pagination,
  onPageChange,
}) => {
  const [deleteJob, setDeleteJob] = useState(null);

  const handleDeleteClick = (job) => {
    setDeleteJob(job);
  };

  const handleDeleteConfirm = (jobId) => {
    onDelete(jobId);
    setDeleteJob(null);
  };

  const handleDeleteCancel = () => {
    setDeleteJob(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return `${Math.ceil(diffDays / 30)}mo ago`;
  };
  const parseLocation = (locationString, jobSalary) => {
    if (!locationString && !jobSalary) {
      return { country: '', city: '', remote: false, salary: '' };
    }

    const lines = locationString ? locationString.split('\n') : [];
    const result = { country: '', city: '', remote: false, salary: '' };

    lines.forEach((line) => {
      if (line.includes('🇺🇸')) result.country = 'US USA';
      else if (line.includes('🇮🇳')) result.country = 'IN India';
      else if (line.includes('🇩🇪')) result.country = 'DE Germany';
      else if (line.includes('💰')) result.salary = line.replace('💰 ', '');
      else if (line.includes('🏠 Remote')) result.remote = true;
      else if (line.trim() && !result.city) result.city = line.trim();
    });

    // If salary wasn’t found in location, use job.salary field (manual/edited jobs)
    if (!result.salary && jobSalary) {
      result.salary = jobSalary;
    }

    return result;
  };

  const getCompanyLogo = (company) => {
    const logos = {
      'Liberty Mutual': '🦅',
      MetLife: 'M',
      'Swiss Re': '🏔️',
      'Hannover Re': '🏛️',
      WTW: '📊',
      AXA: '🔷',
      Allianz: '⚡',
      Zurich: '🏢',
      AIG: '🔵',
      Chubb: '🛡️',
      Prudential: '🔒',
      'State Farm': '🏠',
      Progressive: '🚗',
      GEICO: '🦎',
      Farmers: '🌾',
      Nationwide: '🏦',
      Travelers: '✈️',
      USAA: '🪖',
      'Berkshire Hathaway': '💰',
      'American Family': '👨‍👩‍👧‍👦',
    };
    return logos[company] || company.charAt(0).toUpperCase();
  };

  const handleJobClick = (job) => {
    if (job.application_url) {
      window.open(job.application_url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderPagination = () => {
    if (pagination.total_pages <= 1) return null;

    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.total_pages;

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={currentPage === 1 ? 'disabled' : ''}
      >
        Previous
      </button>
    );

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button key="1" onClick={() => onPageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={i === currentPage ? 'active' : ''}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? 'disabled' : ''}
      >
        Next
      </button>
    );

    return pages;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="job-list">
        <div className="loading">Loading jobs...</div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="job-list">
        <div className="loading">
          No jobs found. Try adjusting your filters or add a new job.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="job-cards-container">
        {jobs.map((job) => {
          const locationInfo = parseLocation(job.location, job.salary);
          const companyLogo = getCompanyLogo(job.company);
          const tags = job.tags ? job.tags.split(', ') : [];

          return (
            <div
              key={job.id}
              className={`job-card ${!job.application_url ? 'no-link' : ''}`}
              onClick={() => handleJobClick(job)}
              title={
                job.application_url
                  ? 'Click to apply'
                  : 'No application link available'
              }
            >
              <div className="job-card-header">
                <div className="company-logo">
                  <span className="logo-symbol">{companyLogo}</span>
                </div>
                <div className="job-info">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="company-name">{job.company}</div>
                </div>
              </div>

              <div className="job-location-info">
                {locationInfo.country && (
                  <span className="country">{locationInfo.country}</span>
                )}
                {locationInfo.city && (
                  <span className="city">{locationInfo.city}</span>
                )}
                {locationInfo.remote && <span className="remote">Remote</span>}
              </div>

              <div className="job-tags-container">
                {tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="job-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="job-footer">
                <span className="posting-date">
                  {formatDate(job.posting_date)}
                </span>
                {locationInfo.salary && (
                  <span className="salary-info">{locationInfo.salary}</span>
                )}
              </div>

              {/* Admin actions - only show when not clicking the card */}
              <div
                className="admin-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onEdit(job)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeleteClick(job)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination">{renderPagination()}</div>

      {deleteJob && (
        <DeleteJob
          job={deleteJob}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
};

export default JobList;
