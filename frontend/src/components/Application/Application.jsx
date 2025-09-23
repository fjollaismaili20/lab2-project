import axios from "axios";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../main";
import { FaUpload, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";
import './Application.css';
const Application = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthorized, user } = useContext(Context);

  const navigateTo = useNavigate();

  // Function to handle file input changes
  const handleFileChange = (event) => {
    const resume = event.target.files[0];
    setResume(resume);
  };

  const { id } = useParams();
  const handleApplication = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);
    formData.append("jobId", id);

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/application/post",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setName("");
      setEmail("");
      setCoverLetter("");
      setPhone("");
      setAddress("");
      setResume("");
      toast.success(data.message);
      navigateTo("/job/getall");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized || (user && user.role === "Employer")) {
    navigateTo("/");
  }

  return (
    <div className="modern-application-container">
      {/* Header Section */}
      <div className="application-header">
        <h1 className="application-title">Job Application</h1>
        <p className="application-subtitle">Complete your application to apply for this position</p>
      </div>

      {/* Application Form */}
      <div className="application-form-container">
        <form onSubmit={handleApplication} className="modern-application-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FaUser className="section-icon" />
              Personal Information
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <FaUser className="input-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="input-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="input-icon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt className="input-icon" />
                  Address *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Cover Letter Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FaFileAlt className="section-icon" />
              Cover Letter
            </h3>
            <div className="form-group">
              <label className="form-label">Cover Letter *</label>
              <textarea
                className="form-textarea"
                placeholder="Tell us why you're the perfect fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="6"
                required
              />
              <div className="character-count">
                {coverLetter.length}/1000 characters
              </div>
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FaUpload className="section-icon" />
              Resume Upload
            </h3>
            <div className="form-group">
              <label className="form-label">Upload Resume *</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf, .jpg, .jpeg, .png, .webp"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                  <FaUpload className="upload-icon" />
                  <span className="upload-text">
                    {resume ? resume.name : "Choose file or drag and drop"}
                  </span>
                  <span className="upload-hint">PDF, JPG, PNG, WEBP (Max 5MB)</span>
                </label>
              </div>
              {resume && (
                <div className="file-preview">
                  <FaFileAlt className="file-icon" />
                  <span className="file-name">{resume.name}</span>
                  <span className="file-size">
                    {(resume.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Section */}
          <div className="form-submit-section">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Submitting Application...
                </>
              ) : (
                <>
                  <FaUpload className="submit-icon" />
                  Submit Application
                </>
              )}
            </button>
            <p className="submit-note">
              By submitting this application, you agree to our terms and conditions.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Application;
