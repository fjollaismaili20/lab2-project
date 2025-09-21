// src/Company/Company.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    CompanyID: "",
    CompanyName: "",
    Address: "",
    Description: "",
  });

  // Merr të gjitha kompanitë
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/companies"
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  // Shto një kompani të re
  const addCompany = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/companies",
        newCompany
      );
      setCompanies([...companies, response.data]);
      setNewCompany({
        CompanyID: "",
        CompanyName: "",
        Address: "",
        Description: "",
      });
    } catch (error) {
      console.error("Error adding company:", error);
    }
  };

  // Fshi kompaninë
  const deleteCompany = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/companies/${id}`);
      setCompanies(companies.filter((company) => company._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  // Edito kompaninë
  const updateCompany = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/companies/${id}`,
        newCompany
      );
      setCompanies(
        companies.map((company) =>
          company._id === id ? response.data : company
        )
      );
      setNewCompany({
        CompanyID: "",
        CompanyName: "",
        Address: "",
        Description: "",
      });
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  return (
    <div className="companyContainer">
      <h1>Company List</h1>
      <ul className="companyList">
        {companies.map((company) => (
          <li key={company._id} className="companyItem">
            <h2 className="companyName">{company.CompanyName}</h2>
            <p className="companyAddress">{company.Address}</p>
            <p className="companyDescription">{company.Description}</p>
            <button
              className="editButton"
              onClick={() => updateCompany(company._id)}
            >
              Edit
            </button>
            <button
              className="deleteButton"
              onClick={() => deleteCompany(company._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Add New Company</h2>
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
        <button className="addButton" onClick={addCompany}>
          Add Company
        </button>
      </div>
    </div>
  );
};

export default Company;
