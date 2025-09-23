// src/Company/Company.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { FaBuilding, FaEdit, FaTrash, FaPlus, FaUpload, FaMapMarkerAlt, FaInfoCircle, FaCheck, FaTimes } from "react-icons/fa";
import { Context } from "../../main";
import "./Company.css";

const Company = () => {
  const { user } = useContext(Context);
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    CompanyID: "",
    CompanyName: "",
    Address: "",
    Description: "",
  });
  const [companyImage, setCompanyImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  // Check if user is an employer
  const isEmployer = user && user.role === 'Employer';

  // Merr të gjitha kompanitë
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/v1/companies"
        );
        setCompanies(response.data.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setCompanyImage(null);
    setImagePreview(null);
  };

  // Shto një kompani të re
  const addCompany = async () => {
    if (!newCompany.CompanyID || !newCompany.CompanyName || !newCompany.Address || !newCompany.Description) {
      toast.error("Please fill in all company details");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('CompanyID', newCompany.CompanyID);
      formData.append('CompanyName', newCompany.CompanyName);
      formData.append('Address', newCompany.Address);
      formData.append('Description', newCompany.Description);
      if (companyImage) {
        formData.append('companyImage', companyImage);
      }

      const response = await axios.post(
        "http://localhost:4000/api/v1/companies",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      setCompanies([...companies, response.data.company]);
      setNewCompany({
        CompanyID: "",
        CompanyName: "",
        Address: "",
        Description: "",
      });
      setCompanyImage(null);
      setImagePreview(null);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error(error.response?.data?.message || "Failed to add company");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fshi kompaninë
  const deleteCompany = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:4000/api/v1/companies/${id}`);
      setCompanies(companies.filter((company) => company.id !== id));
      toast.success("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(error.response?.data?.message || "Failed to delete company");
    }
  };

  // Start editing a company
  const startEditCompany = (company) => {
    setEditingCompany(company);
    setNewCompany({
      CompanyID: company.company_id,
      CompanyName: company.company_name,
      Address: company.address,
      Description: company.description,
    });
    setCompanyImage(null);
    setImagePreview(null);
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCompany(null);
    setNewCompany({
      CompanyID: "",
      CompanyName: "",
      Address: "",
      Description: "",
    });
    setCompanyImage(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  // Update company
  const updateCompany = async () => {
    if (!editingCompany) return;
    
    if (!newCompany.CompanyID || !newCompany.CompanyName || !newCompany.Address || !newCompany.Description) {
      toast.error("Please fill in all company details");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('CompanyID', newCompany.CompanyID);
      formData.append('CompanyName', newCompany.CompanyName);
      formData.append('Address', newCompany.Address);
      formData.append('Description', newCompany.Description);
      if (companyImage) {
        formData.append('companyImage', companyImage);
      }

      const response = await axios.put(
        `http://localhost:4000/api/v1/companies/${editingCompany.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      setCompanies(
        companies.map((company) =>
          company.id === editingCompany.id ? response.data.company : company
        )
      );
      
      cancelEdit();
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(error.response?.data?.message || "Failed to update company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const closeCompanyModal = () => {
    setShowCompanyModal(false);
    setSelectedCompany(null);
  };

  if (isLoading) {
    return (
      <div className="modern-companies-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-companies-container">
      {/* Header Section */}
      <div className="companies-header">
        <h1 className="companies-title">Companies</h1>
        <p className="companies-subtitle">Manage and explore company profiles</p>
        <div className="companies-stats">
          <div className="stat-item">
            <span className="stat-number">{companies.length}</span>
            <span className="stat-label">Total Companies</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{companies.filter(company => company.company_image_url).length}</span>
            <span className="stat-label">With Logo</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{isEmployer ? 'Admin' : 'Viewer'}</span>
            <span className="stat-label">Access Level</span>
          </div>
        </div>
      </div>

      {/* Info Message for Job Seekers */}
      {!isEmployer && user && (
        <div className="info-message">
          <FaInfoCircle className="info-icon" />
          <p>As a Job Seeker, you can view companies but cannot create, edit, or delete them.</p>
        </div>
      )}

      {/* Companies Grid */}
      <div className="companies-grid">
        {companies && companies.length > 0 ? (
          companies.map((company) => (
            <div key={company.id} className="company-card" onClick={() => handleCompanyClick(company)}>
              {/* Company Logo */}
              <div className="company-logo-section">
                {company.company_image_url ? (
                  <img
                    src={`http://localhost:4000/${company.company_image_url}`}
                    alt={company.company_name}
                    className="company-logo"
                  />
                ) : (
                  <div className="company-logo-placeholder">
                    <FaBuilding className="placeholder-icon" />
                  </div>
                )}
              </div>

              {/* Company Basic Info */}
              <div className="company-basic-info">
                <h3 className="company-name">{company.company_name}</h3>
                <p className="company-address">
                  <FaMapMarkerAlt className="address-icon" />
                  {company.address}
                </p>
                <p className="company-id">ID: {company.company_id}</p>
              </div>

              {/* Action Buttons (only for employers) */}
              {isEmployer && (
                <div className="company-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => startEditCompany(company)}
                    title="Edit Company"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => deleteCompany(company.id)}
                    title="Delete Company"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}

              {/* Click indicator */}
              <div className="click-indicator">
                <span>Click to view details</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>No companies found</h3>
            <p>
              {isEmployer 
                ? "You haven't added any companies yet. Create your first company profile!"
                : "No companies are available at the moment."}
            </p>
            {isEmployer && (
              <button className="create-company-btn" onClick={() => setIsEditing(false)}>
                <FaPlus className="btn-icon" />
                Add Your First Company
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Company Form */}
      {isEmployer && (
        <div className="company-form-container">
          <div className="form-header">
            <h2 className="form-title">
              <FaBuilding className="form-icon" />
              {isEditing ? 'Edit Company' : 'Add New Company'}
            </h2>
            {isEditing && (
              <button className="cancel-form-btn" onClick={cancelEdit}>
                <FaTimes />
              </button>
            )}
          </div>

          <div className="company-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Company ID *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newCompany.CompanyID}
                  onChange={(e) => setNewCompany({ ...newCompany, CompanyID: e.target.value })}
                  placeholder="Enter company ID"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newCompany.CompanyName}
                  onChange={(e) => setNewCompany({ ...newCompany, CompanyName: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newCompany.Address}
                  onChange={(e) => setNewCompany({ ...newCompany, Address: e.target.value })}
                  placeholder="Enter company address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  value={newCompany.Description}
                  onChange={(e) => setNewCompany({ ...newCompany, Description: e.target.value })}
                  placeholder="Enter company description"
                  rows="4"
                  required
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="image-upload-section">
              <label className="form-label">Company Logo/Image</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="companyImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <label htmlFor="companyImage" className="file-upload-label">
                  <FaUpload className="upload-icon" />
                  <span className="upload-text">
                    {imagePreview ? 'Change Image' : 'Choose Image or Drag & Drop'}
                  </span>
                  <span className="upload-hint">JPG, PNG, WEBP (Max 5MB)</span>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <button type="button" onClick={removeImage} className="remove-image-btn">
                    <FaTimes />
                  </button>
                </div>
              )}

              {/* Current Image (when editing) */}
              {isEditing && editingCompany?.company_image_url && !imagePreview && (
                <div className="current-image">
                  <p className="current-image-label">Current Image:</p>
                  <img 
                    src={`http://localhost:4000/${editingCompany.company_image_url}`} 
                    alt="Current" 
                    className="current-image-preview" 
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              {isEditing ? (
                <button 
                  className="update-btn"
                  onClick={updateCompany}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Update Company
                    </>
                  )}
                </button>
              ) : (
                <button 
                  className="add-btn"
                  onClick={addCompany}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Company
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Company Detail Modal */}
      {showCompanyModal && selectedCompany && (
        <div className="company-modal-overlay" onClick={closeCompanyModal}>
          <div className="company-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <FaBuilding className="modal-icon" />
                {selectedCompany.company_name}
              </h2>
              <button className="close-modal-btn" onClick={closeCompanyModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              {/* Company Logo */}
              <div className="modal-logo-section">
                {selectedCompany.company_image_url ? (
                  <img
                    src={`http://localhost:4000/${selectedCompany.company_image_url}`}
                    alt={selectedCompany.company_name}
                    className="modal-company-logo"
                  />
                ) : (
                  <div className="modal-logo-placeholder">
                    <FaBuilding className="modal-placeholder-icon" />
                  </div>
                )}
              </div>

              {/* Company Details */}
              <div className="modal-details">
                <div className="detail-section">
                  <h3 className="section-title">Company Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <div className="detail-content">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{selectedCompany.address}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-content">
                        <span className="detail-label">Company ID</span>
                        <span className="detail-value">{selectedCompany.company_id}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-content">
                        <span className="detail-label">Created</span>
                        <span className="detail-value">{formatDate(selectedCompany.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="description-section">
                  <h3 className="section-title">
                    <FaInfoCircle className="section-icon" />
                    About
                  </h3>
                  <p className="description-text">{selectedCompany.description}</p>
                </div>
              </div>

              {/* Modal Actions */}
              {isEmployer && (
                <div className="modal-actions">
                  <button
                    className="modal-action-btn edit-btn"
                    onClick={() => {
                      closeCompanyModal();
                      startEditCompany(selectedCompany);
                    }}
                  >
                    <FaEdit />
                    Edit Company
                  </button>
                  <button
                    className="modal-action-btn delete-btn"
                    onClick={() => {
                      closeCompanyModal();
                      deleteCompany(selectedCompany.id);
                    }}
                  >
                    <FaTrash />
                    Delete Company
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
