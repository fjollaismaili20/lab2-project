import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import JobSearch from "./JobSearch";
import toast from "react-hot-toast";
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const jobsPerPage = 6;
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  // Fetch all jobs on component mount
  useEffect(() => {
    fetchAllJobs();
  }, [currentPage]);

  const fetchAllJobs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/v1/job/getall?page=${currentPage}&limit=${jobsPerPage}`, {
        withCredentials: true,
      });
      setJobs(response.data);
      setSearchResults(null); // Clear search results when showing all jobs
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    try {
      setIsLoading(true);
      setLastSearchParams(searchParams);
      setCurrentPage(1); // Reset to first page when searching
      const response = await axios.get("http://localhost:4000/api/v1/job/search", {
        params: {
          ...searchParams,
          page: 1,
          limit: jobsPerPage
        },
        withCredentials: true,
      });
      setSearchResults(response.data);
      setTotalResults(response.data.total);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error("Failed to search jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setTotalResults(0);
    setLastSearchParams(null);
    setCurrentPage(1);
    fetchAllJobs();
  };

  // Determine which jobs to display
  const displayJobs = searchResults ? searchResults.jobs : jobs.jobs;
  const isSearchActive = searchResults !== null;

  // Pagination functions
  const handlePageChange = async (page) => {
    setCurrentPage(page);
    // If we're in search mode, re-run the search with the new page
    if (isSearchActive && lastSearchParams) {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:4000/api/v1/job/search", {
          params: {
            ...lastSearchParams,
            page: page,
            limit: jobsPerPage
          },
          withCredentials: true,
        });
        setSearchResults(response.data);
        setTotalResults(response.data.total);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Error searching jobs:', error);
        toast.error("Failed to search jobs");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (!isAuthorized) {
    navigateTo("/");
  }

  return (
    <div className="modern-jobs-container">
      {/* Header Section */}
      <div className="jobs-header">
        <h1 className="jobs-main-title">Available Jobs</h1>
        <p className="jobs-subtitle">Discover your next career opportunity</p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <JobSearch 
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {isLoading ? (
          <div className="jobs-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading jobs...</p>
            </div>
          </div>
        ) : displayJobs && displayJobs.length > 0 ? (
          displayJobs.map((job) => (
            <article key={job.id} className="job-card">
              {/* Card Header with Company Info */}
              <div className="job-card-header">
                {job.company && job.company.imageUrl ? (
                  <div className="company-logo">
                    <img 
                      src={`http://localhost:4000/${job.company.imageUrl}`} 
                      alt={job.company.companyName}
                      className="company-logo-img"
                    />
                  </div>
                ) : (
                  <div className="company-logo-placeholder">
                    <span className="company-initial">
                      {job.company?.companyName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                
                <div className="company-info">
                  <h3 className="company-name">{job.company?.companyName || 'Unknown Company'}</h3>
                  <div className="job-meta">
                    <span className="job-category">{job.category}</span>
                    <span className="job-location">📍 {job.city}, {job.country}</span>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="job-card-body">
                <h2 className="job-title">{job.title}</h2>
                
                <div className="job-details">
                  <div className="salary-info">
                    {job.fixedSalary ? (
                      <span className="salary">
                        <span className="salary-icon">💰</span>
                        ${job.fixedSalary.toLocaleString()}
                      </span>
                    ) : job.salaryFrom && job.salaryTo ? (
                      <span className="salary">
                        <span className="salary-icon">💰</span>
                        ${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()}
                      </span>
                    ) : (
                      <span className="salary">
                        <span className="salary-icon">💰</span>
                        Salary not specified
                      </span>
                    )}
                  </div>
                  
                  <div className="job-type-badge">
                    <span className="type-text">Full-time</span>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="job-card-footer">
                <Link to={`/job/${job.id}`} className="view-details-btn">
                  View Details
                  <span className="btn-arrow">→</span>
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs found</h3>
            <p>
              {isSearchActive 
                ? "Try adjusting your search criteria or clear filters to see all jobs."
                : "No jobs are currently available. Check back later for new opportunities!"
              }
            </p>
            {isSearchActive && (
              <button onClick={handleClearSearch} className="clear-search-btn">
                Show All Jobs
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="jobs-pagination">
          <div className="pagination-info">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn prev-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn next-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {isSearchActive && (
        <div className="search-results-info">
          <div className="results-badge">
            <span className="results-count">{totalResults}</span>
            <span className="results-text">jobs found</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
