import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
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
    
    if (!companyId) {
      toast.error("Please select a company for this job");
      return;
    }
    
    if (salaryType === "Fixed Salary") {
      setSalaryFrom("");
      setSalaryTo("");
    } else if (salaryType === "Ranged Salary") {
      setFixedSalary("");
    } else {
      setSalaryFrom("");
      setSalaryTo("");
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
    
    if (salaryType === "Fixed Salary" && fixedSalary.length >= 4) {
      jobData.fixedSalary = fixedSalary;
    } else if (salaryType === "Ranged Salary") {
      jobData.salaryFrom = salaryFrom;
      jobData.salaryTo = salaryTo;
    }
    
    await axios
      .post(
        "http://localhost:4000/api/v1/job/post",
        jobData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
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
      })
      .catch((err) => {
        console.error("Job posting error:", err);
        if (err.response?.status === 401) {
          toast.error("Please log in to post a job");
          navigateTo("/login");
        } else {
          toast.error(err.response?.data?.message || "Failed to post job");
        }
      });
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
    <>
      <div className="job_post page">
        <div className="container">
          <h3>POST NEW JOB</h3>
          <form onSubmit={handleJobPost}>
            <div className="wrapper">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job Title"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Graphics & Design">Graphics & Design</option>
                <option value="Mobile App Development">
                  Mobile App Development
                </option>
                <option value="Frontend Web Development">
                  Frontend Web Development
                </option>
              
                <option value="Account & Finance">Account & Finance</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Video Animation">Video Animation</option>
                <option value="MEAN Stack Development">
                  MEAN STACK Development
                </option>
                <option value="MEVN Stack Development">
                  MEVN STACK Development
                </option>
                   <option value="Computer network">
                   Computer network
                </option>
                <option value="Data Entry Operator">Data Entry Operator</option>
              </select>
            </div>
            <div className="wrapper">
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                <option value="">Select Company *</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="wrapper">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
            <div className="salary_wrapper">
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
              >
                <option value="default">Select Salary Type</option>
                <option value="Fixed Salary">Fixed Salary</option>
                <option value="Ranged Salary">Ranged Salary</option>
              </select>
              <div>
                {salaryType === "default" ? (
                  <p>Please provide Salary Type *</p>
                ) : salaryType === "Fixed Salary" ? (
                  <input
                    type="number"
                    placeholder="Enter Fixed Salary"
                    value={fixedSalary}
                    onChange={(e) => setFixedSalary(e.target.value)}
                  />
                ) : (
                  <div className="ranged_salary">
                    <input
                      type="number"
                      placeholder="Salary From"
                      value={salaryFrom}
                      onChange={(e) => setSalaryFrom(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Salary To"
                      value={salaryTo}
                      onChange={(e) => setSalaryTo(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
            <textarea
              rows="10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job Description"
            />
            <button type="submit">Create Job</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PostJob;
