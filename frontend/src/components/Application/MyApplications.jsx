import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    try {
      if (user && user.role === "Employer") {
        axios
          .get("http://localhost:4000/api/v1/application/employer/getall", {
            withCredentials: true,
          })
          .then((res) => {
            setApplications(res.data.applications);
          });
      } else {
        axios
          .get("http://localhost:4000/api/v1/application/jobseeker/getall", {
            withCredentials: true,
          })
          .then((res) => {
            setApplications(res.data.applications);
          });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, [isAuthorized]);

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
    // Extract just the filename from the URL for the API call
    const justFilename = filename || getFilenameFromUrl(url);
    const downloadUrl = `http://localhost:4000/api/v1/application/download/${justFilename}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = justFilename;
    link.target = '_blank';
    
    // Add authentication headers by using fetch instead of direct link
    fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    })
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error('Download failed');
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
    })
    .catch(error => {
      console.error('Download error:', error);
      // Fallback to direct URL
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const getFilenameFromUrl = (url) => {
    return url.split('/').pop() || 'resume.pdf';
  };


  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="my_applications page">
      {user && user.role === "Job Seeker" ? (
        <div className="container">
          <h1>My Applications</h1>
          {applications.length <= 0 ? (
            <>
              {" "}
              <h4>No Applications Found</h4>{" "}
            </>
          ) : (
            applications.map((element) => {
              return (
                <JobSeekerCard
                  element={element}
                  key={element.id}
                  deleteApplication={deleteApplication}
                  openModal={openModal}
                />
              );
            })
          )}
        </div>
      ) : (
        <div className="container">
          <h1>Applications From Job Seekers</h1>
          {applications.length <= 0 ? (
            <>
              <h4>No Applications Found</h4>
            </>
          ) : (
            applications.map((element) => {
              return (
                <EmployerCard
                  element={element}
                  key={element.id}
                  openModal={openModal}
                />
              );
            })
          )}
        </div>
      )}
      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

const ResumePreview = ({ resumeUrl, onClick }) => {
  const isPdf = resumeUrl && resumeUrl.toLowerCase().endsWith('.pdf');
  const isImage = resumeUrl && (
    resumeUrl.toLowerCase().endsWith('.png') || 
    resumeUrl.toLowerCase().endsWith('.jpg') || 
    resumeUrl.toLowerCase().endsWith('.jpeg') || 
    resumeUrl.toLowerCase().endsWith('.webp')
  );
  const fullUrl = resumeUrl.startsWith('http') 
    ? resumeUrl 
    : `http://localhost:4000/${resumeUrl}`;

  if (isPdf) {
    return (
      <div className="pdf-preview" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="pdf-icon" style={{
          width: '100px',
          height: '120px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #e74c3c',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#2c3e50',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          ':hover': {
            backgroundColor: '#e74c3c',
            color: 'white'
          }
        }}>
          <div style={{ fontSize: '28px', marginBottom: '8px', color: '#e74c3c' }}>📄</div>
          <div style={{ fontWeight: 'bold', textAlign: 'center' }}>PDF Resume</div>
          <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>Click to download</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={fullUrl}
      alt="resume"
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        maxWidth: '100px',
        maxHeight: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '2px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    />
  );
};

const JobSeekerCard = ({ element, deleteApplication, openModal }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.cover_letter}
          </p>
        </div>
        <div className="resume">
          <ResumePreview 
            resumeUrl={element.resume_url}
            onClick={() => openModal(element.resume_url)}
          />
        </div>
        <div className="btn_area">
          <button onClick={() => deleteApplication(element.id)}>
            Delete Application
          </button>
        </div>
      </div>
    </>
  );
};

const EmployerCard = ({ element, openModal }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.cover_letter}
          </p>
        </div>
        <div className="resume">
          <ResumePreview 
            resumeUrl={element.resume_url}
            onClick={() => openModal(element.resume_url)}
          />
        </div>
      </div>
    </>
  );
};
