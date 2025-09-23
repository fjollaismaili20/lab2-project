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
              {/* Company Image */}
              {job.company && job.company.imageUrl && (
                <div className="job-card-image">
                  <img 
                    src={`http://localhost:4000/${job.company.imageUrl}`} 
                    alt={job.company.companyName}
                    className="card-company-image"
                  />
                  <div className="job-card-overlay">
                    <span className="view-details">Click to view details →</span>
                  </div>
                  
                  {/* Image Title and Description */}
                  <div className="image-content">
                    <h3 className="image-title">{job.company.companyName}</h3>
                    <p className="image-description">Leading company in {job.category}</p>
                  </div>
                </div>
              )}
              
              <div className="job-card-content">
                <div className="job-card-meta">
                  <span className="job-category">
                    <span className="category-icon">💼</span>
                    {job.category}
                  </span>
                  <span className="job-location">
                    📍 {job.country}, {job.city}
                  </span>
                </div>
                
                <h2 className="job-card-title">{job.title}</h2>
                
                {job.company && (
                  <p className="job-company">
                    <span className="company-icon">🏢</span>
                    {job.company.companyName}
                  </p>
                )}
                
                <div className="job-salary">
                  {job.fixedSalary ? (
                    <span className="salary-amount">
                      💰 ${job.fixedSalary.toLocaleString()}
                    </span>
                  ) : job.salaryFrom && job.salaryTo ? (
                    <span className="salary-amount">
                      💰 ${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()}
                    </span>
                  ) : (
                    <span className="salary-amount">💰 Salary not specified</span>
                  )}
                </div>
                
                <div className="job-card-footer">
                  <Link to={`/job/${job.id}`} className="job-details-link">
                    View Details
                  </Link>
                  <span className="job-type">Full-time</span>
                </div>
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
