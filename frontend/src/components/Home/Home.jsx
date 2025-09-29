import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../main";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FaSuitcase, 
  FaBuilding, 
  FaUsers, 
  FaUserPlus,
  FaChartBar,
  FaFileAlt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye
} from "react-icons/fa";
import './Home.css';

const Home = () => {
  const { isAuthorized, user } = useContext(Context);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalUsers: 0,
    totalApplications: 0
  });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthorized) {
      fetchHomeData();
    }
  }, [isAuthorized]);

  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [jobsResponse, companiesResponse, blogsResponse, statsResponse] = await Promise.all([
        axios.get("http://localhost:4000/api/v1/job/getall?limit=6", {
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/v1/companies", {
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/v1/blogs?limit=3", {
          withCredentials: true,
        }),
        axios.get("http://localhost:4000/api/v1/reports/stats", {
          withCredentials: true,
        })
      ]);

      // Set featured data
      setFeaturedJobs(jobsResponse.data.jobs || []);
      setFeaturedCompanies(companiesResponse.data.companies?.slice(0, 6) || []);
      setRecentBlogs(blogsResponse.data.blogs || []);

      // Get real statistics from the reports API
      const overallStats = statsResponse.data.data?.overallStats || {};
      
      // Calculate stats with real data
      setStats({
        totalJobs: overallStats.total_jobs || jobsResponse.data.totalJobs || jobsResponse.data.jobs?.length || 0,
        totalCompanies: companiesResponse.data.companies?.length || 0,
        totalUsers: overallStats.unique_applicants || 0, // Using unique applicants as user count
        totalApplications: overallStats.total_applications || 0
      });

    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error("Failed to load home data");
      
      // Fallback to basic data if stats API fails
      try {
        const [jobsResponse, companiesResponse] = await Promise.all([
          axios.get("http://localhost:4000/api/v1/job/getall?limit=6", {
            withCredentials: true,
          }),
          axios.get("http://localhost:4000/api/v1/companies", {
            withCredentials: true,
          })
        ]);

        setFeaturedJobs(jobsResponse.data.jobs || []);
        setFeaturedCompanies(companiesResponse.data.companies?.slice(0, 6) || []);
        
        setStats({
          totalJobs: jobsResponse.data.totalJobs || jobsResponse.data.jobs?.length || 0,
          totalCompanies: companiesResponse.data.companies?.length || 0,
          totalUsers: 0,
          totalApplications: 0
        });
      } catch (fallbackError) {
        console.error('Fallback data fetch failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return <Navigate to={"/login"} />;
  }


  const JobCard = ({ job }) => (
    <div className="job-card">
      <div className="job-header">
        <div className="job-company-logo">
          {job.company?.companyName?.charAt(0) || '?'}
        </div>
        <div className="job-info">
          <h3>{job.company?.companyName || 'Unknown Company'}</h3>
          <p>
            <FaMapMarkerAlt className="job-meta-item" />
            {job.city}, {job.country}
          </p>
        </div>
      </div>
      <h3 className="job-title">{job.title}</h3>
      <div className="job-meta">
        <span className="job-meta-item">
          💼 {job.category}
        </span>
        <span className="job-meta-item">
          <FaCalendarAlt /> Full-time
        </span>
      </div>
      {job.fixedSalary && (
        <div className="job-salary">
          💰 ${job.fixedSalary.toLocaleString()}
        </div>
      )}
    </div>
  );

  const CompanyCard = ({ company }) => (
    <div className="company-card">
      <div className="company-logo">
        {company.company_name?.charAt(0) || '?'}
      </div>
      <h3 className="company-name">{company.company_name}</h3>
      <p className="company-location">
        <FaMapMarkerAlt /> {company.address}
      </p>
    </div>
  );

  const BlogCard = ({ blog }) => (
    <div className="blog-card">
      <div className="blog-image">
        📝
      </div>
      <div className="blog-content">
        <h3 className="blog-title">{blog.title}</h3>
        <p className="blog-excerpt">
          {blog.description?.substring(0, 100)}...
        </p>
        <div className="blog-meta">
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>
            <FaEye /> {blog.views || 0}
          </span>
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, icon: Icon, link, color = 'blue' }) => (
    <Link to={link} className="action-card">
      <div className="action-icon">
        <Icon />
      </div>
      <h3 className="action-title">{title}</h3>
      <p className="action-description">{description}</p>
    </Link>
  );

  if (isLoading) {
    return (
      <div className="modern-home-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to JobPortal
            </h1>
            <p className="hero-subtitle">
              Your gateway to career opportunities. Connect with top companies, discover your next role, and advance your professional journey.
            </p>
            <div className="hero-actions">
              <Link to="/job/getall" className="hero-btn hero-btn-primary">
                <FaSuitcase />
                Browse Jobs
              </Link>
              {user?.role === 'Employer' && (
                <Link to="/job/post" className="hero-btn hero-btn-secondary">
                  <FaUserPlus />
                  Post a Job
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visualization">
            <div className="stats-preview">
              <div className="preview-stat">
                <div className="preview-number">
                  {isLoading ? (
                    <div className="loading-dots">...</div>
                  ) : (
                    stats.totalJobs.toLocaleString()
                  )}
                </div>
                <div className="preview-label">Active Jobs</div>
              </div>
              <div className="preview-stat">
                <div className="preview-number">
                  {isLoading ? (
                    <div className="loading-dots">...</div>
                  ) : (
                    stats.totalCompanies.toLocaleString()
                  )}
                </div>
                <div className="preview-label">Companies</div>
              </div>
              <div className="preview-stat">
                <div className="preview-number">
                  {isLoading ? (
                    <div className="loading-dots">...</div>
                  ) : (
                    stats.totalUsers.toLocaleString()
                  )}
                </div>
                <div className="preview-label">Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content Grid */}
      <section className="main-content">
        <div className="content-container">
          <div className="content-grid">
            {/* Featured Jobs */}
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Latest Jobs</h2>
                <Link to="/job/getall" className="section-link">
                  View All <FaArrowRight />
                </Link>
              </div>
              <div className="jobs-grid">
                {featuredJobs.length > 0 ? (
                  featuredJobs.slice(0, 3).map((job) => (
                    <Link key={job.id} to={`/job/${job.id}`}>
                      <JobCard job={job} />
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No jobs available at the moment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Companies */}
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Top Companies</h2>
                <Link to="/companies" className="section-link">
                  View All <FaArrowRight />
                </Link>
              </div>
              <div className="companies-grid">
                {featuredCompanies.length > 0 ? (
                  featuredCompanies.slice(0, 3).map((company) => (
                    <Link key={company.id} to="/companies">
                      <CompanyCard company={company} />
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No companies available at the moment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Blog Posts */}
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Latest Insights</h2>
                <Link to="/blogs" className="section-link">
                  View All <FaArrowRight />
                </Link>
              </div>
              <div className="blog-grid">
                {recentBlogs.length > 0 ? (
                  recentBlogs.slice(0, 3).map((blog) => (
                    <Link key={blog._id} to={`/blog/${blog._id}`}>
                      <BlogCard blog={blog} />
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No blog posts available at the moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <div className="quick-actions-container">
          <div className="section-header">
            <h2 className="section-title">Quick Access</h2>
            <p className="section-subtitle">Navigate to your most used features</p>
          </div>
          <div className="actions-grid">
            <ActionCard
              title="Browse Jobs"
              description="Explore job opportunities"
              icon={FaSuitcase}
              link="/job/getall"
            />
            <ActionCard
              title="Companies"
              description="Discover companies"
              icon={FaBuilding}
              link="/companies"
            />
            <ActionCard
              title="My Applications"
              description="Track applications"
              icon={FaFileAlt}
              link="/applications/me"
            />
            {user?.role === 'Employer' && (
              <>
                <ActionCard
                  title="Post Job"
                  description="Create job posting"
                  icon={FaUserPlus}
                  link="/job/post"
                />
                <ActionCard
                  title="My Jobs"
                  description="Manage jobs"
                  icon={FaSuitcase}
                  link="/job/me"
                />
                <ActionCard
                  title="Reports"
                  description="View analytics"
                  icon={FaChartBar}
                  link="/reports"
                />
              </>
            )}
            <ActionCard
              title="Blog"
              description="Read insights"
              icon={FaFileAlt}
              link="/blogs"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
