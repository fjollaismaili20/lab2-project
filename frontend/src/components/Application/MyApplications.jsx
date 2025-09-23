import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEye, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaCalendarAlt, FaBuilding } from "react-icons/fa";
import ResumeModal from "./ResumeModal";
import './MyApplications.css';

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        if (user && user.role === "Employer") {
          const response = await axios.get("http://localhost:4000/api/v1/application/employer/getall", {
            withCredentials: true,
          });
          setApplications(response.data.applications);
        } else if (user && user.role === "Job Seeker") {
          const response = await axios.get("http://localhost:4000/api/v1/application/jobseeker/getall", {
            withCredentials: true,
          });
          setApplications(response.data.applications);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to fetch applications');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAuthorized) {
      fetchApplications();
    }
  }, [user, isAuthorized]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  const deleteApplication = (id) => {
    try {
      axios
        .delete(`http://localhost:4000/api/v1/application/delete/${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          toast.success(res.data.message);
          setApplications((prevApplication) =>
            prevApplication.filter((application) => application.id !== id)
          );
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const openModal = (fileUrl) => {
    // Prepend server URL if it's a relative path
    const fullFileUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `http://localhost:4000/${fileUrl}`;
    
    // Check if it's a PDF file
    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
      // For PDFs, trigger download
      downloadFile(fullFileUrl, getFilenameFromUrl(fullFileUrl));
    } else {
      // For images, show in modal
      setResumeImageUrl(fullFileUrl);
      setModalOpen(true);
    }
  };

  const downloadFile = (url, filename) => {
    // Check if it's an old Cloudinary URL or external URL
    if (url.includes('cloudinary.com') || (url.startsWith('http') && !url.includes('localhost'))) {
      // For old Cloudinary URLs or external URLs, show an error message
      toast.error('This file is no longer available. Please ask the applicant to resubmit their resume.');
      return;
    }
    
    // Extract just the filename from the URL for the API call
    const justFilename = filename || getFilenameFromUrl(url);
    const downloadUrl = `http://localhost:4000/api/v1/application/download/${justFilename}`;
    
    // Add authentication headers by using fetch instead of direct link
    fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    })
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      return response.text().then(text => {
        console.error('Download failed response:', text);
        throw new Error(`Download failed: ${response.status} - ${text}`);
      });
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = justFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('File downloaded successfully!');
    })
    .catch(error => {
      console.error('Download error:', error);
      toast.error(`Download failed: ${error.message}`);
    });
  };

  const getFilenameFromUrl = (url) => {
    return url.split('/').pop() || 'resume.pdf';
  };


  const closeModal = () => {
    setModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="modern-applications-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-applications-container">
      {/* Header Section */}
      <div className="applications-header">
        <h1 className="applications-title">
          {user && user.role === "Job Seeker" ? "My Applications" : "Job Applications"}
        </h1>
        <p className="applications-subtitle">
          {user && user.role === "Job Seeker" 
            ? "Track your job applications and their status" 
            : "Review applications from job seekers"}
        </p>
        <div className="applications-stats">
          <div className="stat-item">
            <span className="stat-number">{applications.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{applications.filter(app => app.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{applications.filter(app => app.status === 'reviewed').length}</span>
            <span className="stat-label">Reviewed</span>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="applications-grid">
        {applications.length > 0 ? (
          applications.map((application) => (
            <div key={application.id} className="application-card">
              {/* Application Header */}
              <div className="application-card-header">
                <div className="applicant-info">
                  <div className="applicant-avatar">
                    <FaUser />
                  </div>
                  <div className="applicant-details">
                    <h3 className="applicant-name">{application.name}</h3>
                    <p className="applicant-email">{application.email}</p>
                  </div>
                </div>
                <div className="application-actions">
                  {user && user.role === "Job Seeker" && (
                    <button
                      onClick={() => deleteApplication(application.id)}
                      className="delete-btn"
                      title="Delete Application"
                    >
                      <FaTrash />
                    </button>
                  )}
                  <button
                    onClick={() => openModal(application.resume_url)}
                    className="view-resume-btn"
                    title="View Resume"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>

              {/* Application Details */}
              <div className="application-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <FaPhone className="detail-icon" />
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{application.phone}</span>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{application.address}</span>
                  </div>
                </div>

                {application.job && (
                  <div className="job-info">
                    <div className="job-header">
                      <FaBuilding className="job-icon" />
                      <span className="job-label">Applied for</span>
                    </div>
                    <div className="job-details">
                      <h4 className="job-title">{application.job.title}</h4>
                      <p className="job-company">{application.job.company?.companyName}</p>
                      <p className="job-location">📍 {application.job.city}, {application.job.country}</p>
                    </div>
                  </div>
                )}

                <div className="application-meta">
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <span className="meta-label">Applied on</span>
                    <span className="meta-value">{formatDate(application.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span className={`status-badge ${application.status || 'pending'}`}>
                      {application.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="cover-letter-section">
                <h4 className="cover-letter-title">
                  <FaFileAlt className="cover-letter-icon" />
                  Cover Letter
                </h4>
                <p className="cover-letter-content">{application.cover_letter}</p>
              </div>

              {/* Resume Preview */}
              <div className="resume-section">
                <h4 className="resume-title">Resume</h4>
                <div className="resume-preview-container">
                  <ResumePreview 
                    resumeUrl={application.resume_url}
                    onClick={() => openModal(application.resume_url)}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No applications found</h3>
            <p>
              {user && user.role === "Job Seeker" 
                ? "You haven't applied to any jobs yet. Start applying to see your applications here!"
                : "No job applications have been submitted yet."}
            </p>
            {user && user.role === "Job Seeker" && (
              <a href="/job/getall" className="browse-jobs-btn">
                Browse Available Jobs
              </a>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </div>
  );
};

export default MyApplications;

const ResumePreview = ({ resumeUrl, onClick }) => {
  const isPdf = resumeUrl && resumeUrl.toLowerCase().includes('.pdf');
  const isImage = resumeUrl && (
    resumeUrl.toLowerCase().includes('.png') || 
    resumeUrl.toLowerCase().includes('.jpg') || 
    resumeUrl.toLowerCase().includes('.jpeg') || 
    resumeUrl.toLowerCase().includes('.webp')
  );
  
  // Check if it's an old Cloudinary URL or external URL (but not localhost)
  const isOldCloudinaryUrl = resumeUrl && (
    resumeUrl.includes('cloudinary.com') || 
    (resumeUrl.startsWith('http') && !resumeUrl.includes('localhost'))
  );
  
  const fullUrl = resumeUrl.startsWith('http') 
    ? resumeUrl 
    : `http://localhost:4000/${resumeUrl}`;

  if (isPdf) {
    return (
      <div className="modern-resume-preview pdf" onClick={onClick}>
        <div className="resume-icon">
          {isOldCloudinaryUrl ? '⚠️' : '📄'}
        </div>
        <div className="resume-type">
          {isOldCloudinaryUrl ? 'Old Resume' : 'PDF Resume'}
        </div>
        <div className="resume-action">
          {isOldCloudinaryUrl ? 'File unavailable' : 'Click to download'}
        </div>
      </div>
    );
  }

  if (isOldCloudinaryUrl) {
    return (
      <div className="modern-resume-preview old-image" onClick={onClick}>
        <div className="resume-icon">⚠️</div>
        <div className="resume-type">Old Image</div>
        <div className="resume-action">File unavailable</div>
      </div>
    );
  }

  return (
    <div className="modern-resume-preview image" onClick={onClick}>
      <img
        src={fullUrl}
        alt="resume"
        className="resume-image"
      />
      <div className="resume-overlay">
        <FaEye className="overlay-icon" />
        <span>View Resume</span>
      </div>
    </div>
  );
};

