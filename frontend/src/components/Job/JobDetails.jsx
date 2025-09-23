import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigateTo = useNavigate();

  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:4000/api/v1/job/${id}`, {
          withCredentials: true,
        });
        setJob(response.data.job);
      } catch (error) {
        console.error('Error fetching job details:', error);
        navigateTo("/notfound");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigateTo]);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  if (isLoading) {
    return (
      <div className="modern-job-details-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (job) => {
    if (job.fixedSalary) {
      return `$${job.fixedSalary.toLocaleString()}`;
    } else if (job.salaryFrom && job.salaryTo) {
      return `$${job.salaryFrom.toLocaleString()} - $${job.salaryTo.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  return (
    <div className="modern-job-details-container">
      {/* Header Section */}
      <div className="job-details-header">
        <div className="breadcrumb">
          <Link to="/jobs" className="breadcrumb-link">← Back to Jobs</Link>
        </div>
        <h1 className="job-details-title">{job.title}</h1>
        <div className="job-meta-info">
          <span className="job-category-badge">
            <span className="category-icon">💼</span>
            {job.category}
          </span>
          <span className="job-location">
            <span className="location-icon">📍</span>
            {job.city}, {job.country}
          </span>
          <span className="job-posted-date">
            <span className="date-icon">📅</span>
            Posted {formatDate(job.jobPostedOn)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="job-details-content">
        {/* Company Section */}
        {job.company && (
          <div className="company-section">
            <div className="company-header">
              {job.company.imageUrl && (
                <div className="company-logo">
                  <img 
                    src={`http://localhost:4000/${job.company.imageUrl}`} 
                    alt={job.company.companyName}
                    className="company-image"
                  />
                </div>
              )}
              <div className="company-info">
                <h2 className="company-name">{job.company.companyName}</h2>
                <p className="company-address">
                  <span className="address-icon">🏢</span>
                  {job.company.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Job Information Grid */}
        <div className="job-info-grid">
          <div className="info-card">
            <div className="info-icon">💰</div>
            <div className="info-content">
              <h3>Salary</h3>
              <p className="salary-amount">{formatSalary(job)}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <h3>Location</h3>
              <p>{job.location}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">💼</div>
            <div className="info-content">
              <h3>Category</h3>
              <p>{job.category}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📅</div>
            <div className="info-content">
              <h3>Posted Date</h3>
              <p>{formatDate(job.jobPostedOn)}</p>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="job-description-section">
          <h2 className="section-title">Job Description</h2>
          <div className="description-content">
            <p>{job.description}</p>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="requirements-section">
          <h2 className="section-title">Job Requirements</h2>
          <div className="requirements-content">
            <ul className="requirements-list">
              <li>Experience in {job.category} field</li>
              <li>Strong problem-solving skills</li>
              <li>Excellent communication abilities</li>
              <li>Team player with leadership qualities</li>
              <li>Willingness to learn and adapt</li>
            </ul>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <h2 className="section-title">What We Offer</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🏥</span>
              <span>Health Insurance</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🏖️</span>
              <span>Paid Time Off</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📚</span>
              <span>Learning & Development</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💻</span>
              <span>Remote Work Options</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <span>Career Growth</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">👥</span>
              <span>Great Team</span>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="action-section">
          {user && user.role === "Employer" ? (
            <div className="employer-message">
              <div className="message-icon">👨‍💼</div>
              <h3>This is your job posting</h3>
              <p>You can manage this job from your dashboard.</p>
              <Link to="/myjobs" className="manage-job-btn">
                Manage Job
              </Link>
            </div>
          ) : (
            <div className="apply-section">
              <div className="apply-content">
                <h3>Ready to Apply?</h3>
                <p>Join our team and make a difference in your career!</p>
                <Link to={`/application/${job.id}`} className="apply-btn">
                  Apply Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
