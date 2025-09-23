import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import './PostJob.css';

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthorized, user } = useContext(Context);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/companies");
        setCompanies(response.data.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to load companies");
        setCompanies([]); // Set empty array on error
      }
    };
    fetchCompanies();
  }, []);

  const handleJobPost = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent multiple submissions
    
    // Validate required fields
    if (!title || !description || !category || !country || !city || !location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate field lengths according to database constraints
    if (title.length < 3 || title.length > 30) {
      toast.error("Job title must be between 3 and 30 characters");
      return;
    }
    
    if (description.length < 30 || description.length > 500) {
      toast.error("Job description must be between 30 and 500 characters");
      return;
    }
    
    if (location.length < 20) {
      toast.error("Location must be at least 20 characters long");
      return;
    }
    
    if (!companyId) {
      toast.error("Please select a company for this job");
      return;
    }
    
    if (salaryType === "default") {
      toast.error("Please select a salary type");
      return;
    }
    
    // Validate salary fields based on type
    if (salaryType === "Fixed Salary") {
      if (!fixedSalary || fixedSalary < 1000) {
        toast.error("Please enter a valid fixed salary (minimum 1000)");
        return;
      }
      setSalaryFrom("");
      setSalaryTo("");
    } else if (salaryType === "Ranged Salary") {
      if (!salaryFrom || !salaryTo || salaryFrom < 1000 || salaryTo < 1000) {
        toast.error("Please enter valid salary range (minimum 1000)");
        return;
      }
      if (parseInt(salaryFrom) >= parseInt(salaryTo)) {
        toast.error("Salary 'From' must be less than 'To'");
        return;
      }
      setFixedSalary("");
    }
    
    const jobData = {
      title,
      description,
      category,
      country,
      city,
      location,
      companyId,
    };
    
    if (salaryType === "Fixed Salary") {
      jobData.fixedSalary = parseInt(fixedSalary);
    } else if (salaryType === "Ranged Salary") {
      jobData.salaryFrom = parseInt(salaryFrom);
      jobData.salaryTo = parseInt(salaryTo);
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:4000/api/v1/job/post",
        jobData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      toast.success(response.data.message);
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setCountry("");
      setCity("");
      setLocation("");
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
      setSalaryType("default");
      setCompanyId("");
    } catch (err) {
      console.error("Job posting error:", err);
      if (err.response?.status === 401) {
        toast.error("Please log in to post a job");
        navigateTo("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to post job");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = useNavigate();
  
  // Handle navigation in useEffect to avoid calling navigate during render
  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
    } else if (user && user.role !== "Employer") {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  return (
    <div className="modern-post-job-container">
      {/* Header Section */}
      <div className="post-job-header">
        <h1 className="post-job-title">Post New Job</h1>
        <p className="post-job-subtitle">Create a new job posting and find the perfect candidate</p>
      </div>

      {/* Form Section */}
      <div className="post-job-form-section">
        <form onSubmit={handleJobPost} className="modern-post-job-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Basic Information
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter job title (3-30 characters)"
                  className="form-input"
                  maxLength={30}
                />
                <div className="char-count">{title.length}/30</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  <option value="Graphics & Design">Graphics & Design</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Frontend Web Development">Frontend Web Development</option>
                  <option value="Account & Finance">Account & Finance</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Video Animation">Video Animation</option>
                  <option value="MEAN Stack Development">MEAN Stack Development</option>
                  <option value="MEVN Stack Development">MEVN Stack Development</option>
                  <option value="Computer network">Computer network</option>
                  <option value="Data Entry Operator">Data Entry Operator</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company *</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📍</span>
              Location Details
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter complete address (minimum 20 characters)"
                className="form-input"
                minLength={20}
              />
              <div className="char-count">{location.length} characters (minimum 20)</div>
            </div>
          </div>

          {/* Salary Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">💰</span>
              Salary Information
            </h2>
            
            <div className="form-group">
              <label className="form-label">Salary Type *</label>
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
                className="form-select"
              >
                <option value="default">Select Salary Type</option>
                <option value="Fixed Salary">Fixed Salary</option>
                <option value="Ranged Salary">Ranged Salary</option>
              </select>
            </div>

            {salaryType === "Fixed Salary" && (
              <div className="form-group">
                <label className="form-label">Fixed Salary *</label>
                <div className="salary-input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    placeholder="Enter fixed salary"
                    value={fixedSalary}
                    onChange={(e) => setFixedSalary(e.target.value)}
                    className="form-input salary-input"
                    min="1000"
                  />
                </div>
                <div className="input-hint">Minimum: $1,000</div>
              </div>
            )}

            {salaryType === "Ranged Salary" && (
              <div className="salary-range-group">
                <div className="form-group">
                  <label className="form-label">Salary From *</label>
                  <div className="salary-input-group">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      placeholder="From"
                      value={salaryFrom}
                      onChange={(e) => setSalaryFrom(e.target.value)}
                      className="form-input salary-input"
                      min="1000"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Salary To *</label>
                  <div className="salary-input-group">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      placeholder="To"
                      value={salaryTo}
                      onChange={(e) => setSalaryTo(e.target.value)}
                      className="form-input salary-input"
                      min="1000"
                    />
                  </div>
                </div>
              </div>
            )}

            {salaryType === "default" && (
              <div className="salary-placeholder">
                <div className="placeholder-icon">💰</div>
                <p>Please select a salary type to continue</p>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📄</span>
              Job Description
            </h2>
            
            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the job responsibilities, requirements, and what makes this opportunity special (30-500 characters)"
                className="form-textarea"
                rows="8"
                minLength={30}
                maxLength={500}
              />
              <div className="char-count">{description.length}/500</div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Creating Job...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Create Job Posting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
