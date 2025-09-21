const API_BASE_URL = 'http://localhost:5000/api/jobs';
const SCRAPER_API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Get all jobs with optional filters
export const getJobs = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    if (
      params[key] !== '' &&
      params[key] !== null &&
      params[key] !== undefined
    ) {
      queryParams.append(key, params[key]);
    }
  });

  const url = queryParams.toString()
    ? `${API_BASE_URL}?${queryParams.toString()}`
    : API_BASE_URL;

  const response = await fetch(url);
  return handleResponse(response);
};

// Get a specific job by ID
export const getJob = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/${jobId}`);
  return handleResponse(response);
};

// Create a new job
export const createJob = async (jobData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
  });
  return handleResponse(response);
};

// Update an existing job
export const updateJob = async (jobId, jobData) => {
  const response = await fetch(`${API_BASE_URL}/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
  });
  return handleResponse(response);
};

// Delete a job
export const deleteJob = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/${jobId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Search jobs
export const searchJobs = async (query) => {
  const response = await fetch(
    `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`
  );
  return handleResponse(response);
};

// Get scraped jobs from JSON file
export const getScrapedJobs = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    if (
      params[key] !== '' &&
      params[key] !== null &&
      params[key] !== undefined
    ) {
      queryParams.append(key, params[key]);
    }
  });

  const url = queryParams.toString()
    ? `${SCRAPER_API_URL}/scraper-jobs?${queryParams.toString()}`
    : `${SCRAPER_API_URL}/scraper-jobs`;

  const response = await fetch(url);
  return handleResponse(response);
};

// Load scraped jobs into database
export const loadScrapedJobs = async () => {
  const response = await fetch(`${SCRAPER_API_URL}/load-scraped-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};
