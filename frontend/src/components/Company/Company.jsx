// src/Company/Company.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
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

  // Check if user is an employer
  const isEmployer = user && user.role === 'Employer';

  // Merr të gjitha kompanitë
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/companies"
        );
        setCompanies(response.data.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]); // Set empty array on error
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
    }
  };

  return (
    <div className="companyContainer">
      <h1>Company List</h1>
      {!isEmployer && user && (
        <div className="info-message">
          <p>As a Job Seeker, you can view companies but cannot create, edit, or delete them.</p>
        </div>
      )}
      <ul className="companyList">
        {companies && companies.length > 0 ? companies.map((company) => (
          <li key={company.id} className="companyItem">
            {company.company_image_url && (
              <div className="companyImageContainer">
                <img
                  src={`http://localhost:4000/${company.company_image_url}`}
                  alt={company.company_name}
                  className="companyLogo"
                />
              </div>
            )}
            <div className="companyInfo">
              <h2 className="companyName">{company.company_name}</h2>
              <p className="companyAddress">{company.address}</p>
              <p className="companyDescription">{company.description}</p>
            </div>
            {isEmployer && (
              <div className="companyActions">
                <button
                  className="editButton"
                  onClick={() => startEditCompany(company)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => deleteCompany(company.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        )) : (
          <li className="no-companies">
            <p>No companies found. Add your first company below!</p>
          </li>
        )}
      </ul>

      {isEmployer && (
        <>
          <h2>{isEditing ? 'Edit Company' : 'Add New Company'}</h2>
          <div className="addCompanyForm">
        <input
          type="text"
          value={newCompany.CompanyID}
          onChange={(e) =>
            setNewCompany({ ...newCompany, CompanyID: e.target.value })
          }
          placeholder="Company ID"
        />
        <input
          type="text"
          value={newCompany.CompanyName}
          onChange={(e) =>
            setNewCompany({ ...newCompany, CompanyName: e.target.value })
          }
          placeholder="Company Name"
        />
        <input
          type="text"
          value={newCompany.Address}
          onChange={(e) =>
            setNewCompany({ ...newCompany, Address: e.target.value })
          }
          placeholder="Address"
        />
        <textarea
          value={newCompany.Description}
          onChange={(e) =>
            setNewCompany({ ...newCompany, Description: e.target.value })
          }
          placeholder="Description"
        ></textarea>
        
        {/* Image Upload Section */}
        <div className="imageUploadSection">
          <label htmlFor="companyImage" className="imageUploadLabel">
            Company Logo/Image (Optional)
          </label>
          <input
            type="file"
            id="companyImage"
            accept="image/*"
            onChange={handleImageChange}
            className="imageInput"
          />
          {imagePreview && (
            <div className="imagePreview">
              <img src={imagePreview} alt="Preview" className="previewImage" />
              <button type="button" onClick={removeImage} className="removeImageBtn">
                Remove Image
              </button>
            </div>
          )}
          {isEditing && editingCompany?.company_image_url && !imagePreview && (
            <div className="currentImagePreview">
              <p>Current Image:</p>
              <img 
                src={`http://localhost:4000/${editingCompany.company_image_url}`} 
                alt="Current" 
                className="previewImage" 
              />
            </div>
          )}
        </div>

        <div className="formButtons">
          {isEditing ? (
            <>
              <button className="updateButton" onClick={updateCompany}>
                Update Company
              </button>
              <button className="cancelButton" onClick={cancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <button className="addButton" onClick={addCompany}>
              Add Company
            </button>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Company;
