import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import JobList from './Components/JobList';
import JobForm from './Components/AddEditJob';
import FilterSortJobs from './Components/FilterSortJobs';
// import DeleteJob from './Components/DeleteJob';
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  loadScrapedJobs,
} from './api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loadingScrapedJobs, setLoadingScrapedJobs] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    job_type: '',
    tag: '',
    search: '',
    sort: 'posting_date_desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      };

      const response = await getJobs(params);
      setJobs(response.jobs);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
        total_pages: response.total_pages,
      }));
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.per_page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreateJob = async (jobData) => {
    try {
      const newJob = await createJob(jobData);
      setJobs((prev) => [newJob, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create job');
      console.error('Error creating job:', err);
    }
  };

  const handleUpdateJob = async (jobId, jobData) => {
    try {
      const updatedJob = await updateJob(jobId, jobData);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? updatedJob : job))
      );
      setEditingJob(null);
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleLoadScrapedJobs = async () => {
    try {
      setLoadingScrapedJobs(true);
      setError(null);
      const result = await loadScrapedJobs();
      alert(result.message);
      // Refresh the job list after loading
      await fetchJobs();
    } catch (err) {
      setError('Failed to load scraped jobs');
      console.error('Error loading scraped jobs:', err);
    } finally {
      setLoadingScrapedJobs(false);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="app">
        <div className="loading">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Job Listing Application</h1>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleLoadScrapedJobs}
            disabled={loadingScrapedJobs}
          >
            {loadingScrapedJobs ? 'Loading...' : 'Load Scraped Jobs'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add New Job
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <FilterSortJobs filters={filters} onFilterChange={handleFilterChange} />

      <JobList
        jobs={jobs}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {showForm && (
        <JobForm
          job={editingJob}
          onSubmit={
            editingJob
              ? (data) => handleUpdateJob(editingJob.id, data)
              : handleCreateJob
          }
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;
