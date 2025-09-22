import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import JobSearch from "./JobSearch";
import toast from "react-hot-toast";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  // Fetch all jobs on component mount
  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:4000/api/v1/job/getall", {
        withCredentials: true,
      });
      setJobs(response.data);
      setSearchResults(null); // Clear search results when showing all jobs
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
      const response = await axios.get("http://localhost:4000/api/v1/job/search", {
        params: searchParams,
        withCredentials: true,
      });
      setSearchResults(response.data);
      setTotalResults(response.data.total);
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
    fetchAllJobs();
  };

  // Determine which jobs to display
  const displayJobs = searchResults ? searchResults.jobs : jobs.jobs;
  const isSearchActive = searchResults !== null;
  if (!isAuthorized) {
    navigateTo("/");
  }

  return (
    <section className="jobs page">
      <div className="container">
        <div className="jobs-header">
          <h1>
            {isSearchActive ? `SEARCH RESULTS (${totalResults} found)` : 'ALL AVAILABLE JOBS'}
          </h1>
        </div>

        <JobSearch 
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : (
          <div className="banner">
            {displayJobs && displayJobs.length > 0 ? (
              displayJobs.map((element) => {
                return (
                  <div className="card" key={element.id}>
                    {element.company && element.company.imageUrl && (
                      <div className="company-image-container">
                        <img 
                          src={`http://localhost:4000/${element.company.imageUrl}`} 
                          alt={element.company.companyName}
                          className="company-cover-image"
                        />
                      </div>
                    )}
                    <div className="job-content">
                      <h3>{element.title}</h3>
                      <p className="category">{element.category}</p>
                      <p className="location">{element.country}, {element.city}</p>
                      {element.company && (
                        <p className="company-name">Company: {element.company.companyName}</p>
                      )}
                      {element.fixedSalary && (
                        <p className="salary">Salary: ${element.fixedSalary.toLocaleString()}</p>
                      )}
                      {element.salaryFrom && element.salaryTo && (
                        <p className="salary">Salary: ${element.salaryFrom.toLocaleString()} - ${element.salaryTo.toLocaleString()}</p>
                      )}
                      <Link to={`/job/${element.id}`} className="job-details-link">Job Details</Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <h3>No jobs found</h3>
                <p>
                  {isSearchActive 
                    ? "Try adjusting your search criteria or clear filters to see all jobs."
                    : "No jobs are currently available."
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
        )}
      </div>
    </section>
  );
};

export default Jobs;
