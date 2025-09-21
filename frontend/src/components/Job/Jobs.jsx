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
                  <p>{element.title}</p>
                  <p>{element.category}</p>
                  <p>{element.country}</p>
                  {element.company && (
                    <p>Company: {element.company.companyName}</p>
                  )}
                  <Link to={`/job/${element.id}`}>Job Details</Link>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
