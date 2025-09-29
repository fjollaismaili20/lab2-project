import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { Context } from "../../main";
import { useNavigate, Link } from "react-router-dom";
import './MyJobs.css';

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthorized, user } = useContext(Context);

  const navigateTo = useNavigate();
  //Fetching all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/job/getmyjobs",
          { withCredentials: true }
        );
        setMyJobs(data.myJobs);
      } catch (error) {
        toast.error(error.response.data.message);
        setMyJobs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);
  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  //Function For Enabling Editing Mode
  const handleEnableEdit = (jobId) => {
    //Here We Are Giving Id in setEditingMode because We want to enable only that job whose ID has been send.
    setEditingMode(jobId);
  };

  //Function For Disabling Editing Mode
  const handleDisableEdit = () => {
    setEditingMode(null);
  };

  //Function For Updating The Job
  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find((job) => job.id === jobId);
    await axios
      .put(`http://localhost:4000/api/v1/job/update/${jobId}`, updatedJob, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setEditingMode(null);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  //Function For Deleting Job
  const handleDeleteJob = async (jobId) => {
    await axios
      .delete(`http://localhost:4000/api/v1/job/delete/${jobId}`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setMyJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleInputChange = (jobId, field, value) => {
    // Update the job object in the jobs state with the new value
    setMyJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === jobId ? { ...job, [field]: value } : job))
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  if (isLoading) {
    return (
      <div className="modern-my-jobs-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-my-jobs-container">
      {/* Header Section */}
      <div className="my-jobs-header">
        <h1 className="my-jobs-title">My Posted Jobs</h1>
        <p className="my-jobs-subtitle">Manage and edit your job postings</p>
        <div className="jobs-stats">
          <div className="stat-item">
            <span className="stat-number">{myJobs.length}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{myJobs.filter(job => !job.expired).length}</span>
            <span className="stat-label">Active Jobs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{myJobs.filter(job => job.expired).length}</span>
            <span className="stat-label">Expired Jobs</span>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="my-jobs-grid">
        {myJobs.length > 0 ? (
          myJobs.map((job) => (
            <div key={job.id} className={`job-management-card ${editingMode === job.id ? 'editing' : ''}`}>
              {/* Company Image */}
              {job.company && job.company.imageUrl && (
                <div className="job-card-image">
                  <img 
                    src={`http://localhost:4000/${job.company.imageUrl}`} 
                    alt={job.company.companyName}
                    className="card-company-image"
                  />
                  <div className="job-status-badge">
                    {job.expired ? (
                      <span className="status-expired">Expired</span>
                    ) : (
                      <span className="status-active">Active</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="job-card-content">
                {/* Job Header */}
                <div className="job-header">
                  <h2 className="job-title">
                    {editingMode === job.id ? (
                      <input
                        type="text"
                        value={job.title}
                        onChange={(e) => handleInputChange(job.id, "title", e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      job.title
                    )}
                  </h2>
                  <div className="job-actions">
                    {editingMode === job.id ? (
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdateJob(job.id)}
                          className="save-btn"
                          title="Save Changes"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleDisableEdit()}
                          className="cancel-btn"
                          title="Cancel"
                        >
                          <RxCross2 />
                        </button>
                      </div>
                    ) : (
                      <div className="view-actions">
                        <button
                          onClick={() => handleEnableEdit(job.id)}
                          className="edit-btn"
                          title="Edit Job"
                        >
                          <FaEdit />
                        </button>
                        <Link to={`/job/${job.id}`} className="view-btn" title="View Job">
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="delete-btn"
                          title="Delete Job"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Info */}
                {job.company && (
                  <div className="company-info">
                    <span className="company-icon">🏢</span>
                    <span className="company-name">{job.company.companyName}</span>
                  </div>
                )}

                {/* Job Details Grid */}
                <div className="job-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    {editingMode === job.id ? (
                      <select
                        value={job.category}
                        onChange={(e) => handleInputChange(job.id, "category", e.target.value)}
                        className="edit-select"
                      >
                        <option value="Graphics & Design">Graphics & Design</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                        <option value="Frontend Web Development">Frontend Web Development</option>
                        <option value="MERN Stack Development">MERN Stack Development</option>
                        <option value="Account & Finance">Account & Finance</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Video Animation">Video Animation</option>
                        <option value="MEAN Stack Development">MEAN Stack Development</option>
                        <option value="MEVN Stack Development">MEVN Stack Development</option>
                        <option value="Data Entry Operator">Data Entry Operator</option>
                      </select>
                    ) : (
                      <span className="detail-value">{job.category}</span>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">📍 {job.city}, {job.country}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Salary</span>
                    {editingMode === job.id ? (
                      <div className="salary-edit">
                        {job.fixedSalary ? (
                          <input
                            type="number"
                            value={job.fixedSalary}
                            onChange={(e) => handleInputChange(job.id, "fixedSalary", e.target.value)}
                            className="edit-input salary-input"
                            placeholder="Fixed Salary"
                          />
                        ) : (
                          <div className="salary-range-edit">
                            <input
                              type="number"
                              value={job.salaryFrom}
                              onChange={(e) => handleInputChange(job.id, "salaryFrom", e.target.value)}
                              className="edit-input salary-input"
                              placeholder="From"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={job.salaryTo}
                              onChange={(e) => handleInputChange(job.id, "salaryTo", e.target.value)}
                              className="edit-input salary-input"
                              placeholder="To"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="detail-value salary">{formatSalary(job)}</span>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    {editingMode === job.id ? (
                      <select
                        value={job.expired}
                        onChange={(e) => handleInputChange(job.id, "expired", e.target.value === 'true')}
                        className="edit-select"
                      >
                        <option value={false}>Active</option>
                        <option value={true}>Expired</option>
                      </select>
                    ) : (
                      <span className={`detail-value status ${job.expired ? 'expired' : 'active'}`}>
                        {job.expired ? 'Expired' : 'Active'}
                      </span>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Posted</span>
                    <span className="detail-value">📅 {formatDate(job.jobPostedOn)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">💼 Full-time</span>
                  </div>
                </div>

                {/* Description */}
                <div className="job-description">
                  <span className="detail-label">Description</span>
                  {editingMode === job.id ? (
                    <textarea
                      value={job.description}
                      onChange={(e) => handleInputChange(job.id, "description", e.target.value)}
                      className="edit-textarea"
                      rows="3"
                    />
                  ) : (
                    <p className="description-text">{job.description}</p>
                  )}
                </div>

                {/* Location Details */}
                <div className="job-location-details">
                  <span className="detail-label">Full Address</span>
                  {editingMode === job.id ? (
                    <textarea
                      value={job.location}
                      onChange={(e) => handleInputChange(job.id, "location", e.target.value)}
                      className="edit-textarea"
                      rows="2"
                    />
                  ) : (
                    <p className="location-text">{job.location}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs posted yet</h3>
            <p>You haven't posted any jobs yet. Create your first job posting to get started!</p>
            <Link to="/job/post" className="create-job-btn">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
