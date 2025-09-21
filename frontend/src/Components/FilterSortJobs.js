import React, { useState, useEffect } from 'react';

const FilterSortJobs = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      location: '',
      job_type: '',
      tag: '',
      search: '',
      sort: 'posting_date_desc',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const jobTypes = [
    { value: '', label: 'All Job Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const sortOptions = [
    { value: 'posting_date_desc', label: 'Date Posted: Newest First' },
    { value: 'posting_date_asc', label: 'Date Posted: Oldest First' },
    { value: 'title_asc', label: 'Job Title: A-Z' },
    { value: 'title_desc', label: 'Job Title: Z-A' },
    { value: 'company_asc', label: 'Company: A-Z' },
    { value: 'company_desc', label: 'Company: Z-A' },
  ];

  return (
    <div className="filter-container">
      <form onSubmit={handleSubmit}>
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={localFilters.search}
              onChange={handleChange}
              placeholder="Search by title, company, or description..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={localFilters.location}
              onChange={handleChange}
              placeholder="e.g., New York, NY"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="job_type">Job Type</label>
            <select
              id="job_type"
              name="job_type"
              value={localFilters.job_type}
              onChange={handleChange}
            >
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="tag">Tag</label>
            <input
              type="text"
              id="tag"
              name="tag"
              value={localFilters.tag}
              onChange={handleChange}
              placeholder="e.g., Life, Health, Python"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              name="sort"
              value={localFilters.sort}
              onChange={handleChange}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
          </div>

          <div className="filter-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterSortJobs;
