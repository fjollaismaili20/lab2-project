import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();
  useEffect(() => {
    try {
      axios
        .get("http://localhost:4000/api/v1/job/getall", {
          withCredentials: true,
        })
        .then((res) => {
          setJobs(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);
  if (!isAuthorized) {
    navigateTo("/");
  }

  return (
    <section className="jobs page">
      <div className="container">
        <h1>ALL AVAILABLE JOBS</h1>
        <div className="banner">
          {jobs.jobs &&
            jobs.jobs.map((element) => {
              return (
                <div className="card" key={element.id}>
                  {element.company && element.company.imageUrl && (
                    <div className="company-image-container">
                      <img 
                        src={`http://localhost:4000/${element.company.imageUrl}`} 
                        alt={element.company.companyName}
                        className="company-cover-image"
                      />
                    </div>
                  )}
                  <div className="job-content">
                    <h3>{element.title}</h3>
                    <p className="category">{element.category}</p>
                    <p className="location">{element.country}, {element.city}</p>
                    {element.company && (
                      <p className="company-name">Company: {element.company.companyName}</p>
                    )}
                    <Link to={`/job/${element.id}`} className="job-details-link">Job Details</Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
