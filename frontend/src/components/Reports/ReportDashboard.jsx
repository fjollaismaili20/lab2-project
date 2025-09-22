import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../../main';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FaChartBar, 
  FaFilePdf, 
  FaFileExcel, 
  FaDownload, 
  FaCalendarAlt,
  FaFilter,
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaChartLine
} from 'react-icons/fa';

const ReportDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    period: 'daily'
  });
  const [reportFilters, setReportFilters] = useState({
    companyId: '',
    category: '',
    jobId: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    companies: [],
    categories: [],
    jobs: []
  });

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized || (user && user.role !== "Employer")) {
      navigateTo("/");
      return;
    }
    fetchFilters();
    // Don't fetch report data on mount - let user click Generate Report
  }, [isAuthorized, user]);

  const fetchFilters = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/v1/reports/filters', {
        withCredentials: true
      });
      setAvailableFilters(response.data.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast.error('Failed to load filter options');
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (dateRange.period) params.append('period', dateRange.period);

      console.log('Fetching report data with params:', params.toString());
      console.log('Stats URL:', `http://localhost:4000/api/v1/reports/stats?${params}`);

      const response = await axios.get(`http://localhost:4000/api/v1/reports/stats?${params}`, {
        withCredentials: true
      });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailedData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (reportFilters.companyId) params.append('companyId', reportFilters.companyId);
      if (reportFilters.category) params.append('category', reportFilters.category);
      if (reportFilters.jobId) params.append('jobId', reportFilters.jobId);

      const response = await axios.get(`http://localhost:4000/api/v1/reports/detailed?${params}`, {
        withCredentials: true
      });
      setDetailedData(response.data.data);
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      toast.error('Failed to load detailed data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format, reportType = 'detailed') => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (dateRange.period) params.append('period', dateRange.period);
      if (reportFilters.companyId) params.append('companyId', reportFilters.companyId);
      if (reportFilters.category) params.append('category', reportFilters.category);
      if (reportFilters.jobId) params.append('jobId', reportFilters.jobId);
      params.append('reportType', reportType);

      console.log(`Exporting ${format} report with type: ${reportType}`);
      console.log('Export URL:', `http://localhost:4000/api/v1/reports/export/${format}?${params}`);

      const response = await axios.get(`http://localhost:4000/api/v1/reports/export/${format}?${params}`, {
        withCredentials: true,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `job-report-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const ChartCard = ({ title, data, type = 'bar' }) => (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-content">
        {data && data.length > 0 ? (
          <div className="chart-bars">
            {data.slice(0, 10).map((item, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-label">{item.period || item.category || item.company_name}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${Math.max(5, (item.application_count || item.total_applications || 0) / Math.max(...data.map(d => d.application_count || d.total_applications || 0)) * 100)}%` 
                    }}
                  ></div>
                  <span className="bar-value">{item.application_count || item.total_applications || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No data available</p>
        )}
      </div>
    </div>
  );

  if (!isAuthorized || (user && user.role !== "Employer")) {
    return null;
  }

  return (
    <div className="report-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1><FaChartBar /> Report Dashboard</h1>
          <p>Comprehensive analytics and insights for job applications</p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <h3><FaFilter /> Report Filters</h3>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  placeholder="End Date"
                />
              </div>
            </div>
            <div className="filter-group">
              <label>Period</label>
              <select
                value={dateRange.period}
                onChange={(e) => setDateRange({...dateRange, period: e.target.value})}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Company</label>
              <select
                value={reportFilters.companyId}
                onChange={(e) => setReportFilters({...reportFilters, companyId: e.target.value})}
              >
                <option value="">All Companies</option>
                {availableFilters.companies.map(company => (
                  <option key={company.id} value={company.id}>{company.company_name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select
                value={reportFilters.category}
                onChange={(e) => setReportFilters({...reportFilters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Job</label>
              <select
                value={reportFilters.jobId}
                onChange={(e) => setReportFilters({...reportFilters, jobId: e.target.value})}
              >
                <option value="">All Jobs</option>
                {availableFilters.jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title} - {job.company_name}</option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button onClick={fetchReportData} className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Generate Report'}
              </button>
              <button onClick={fetchDetailedData} className="btn-secondary" disabled={isLoading}>
                Load Detailed Data
              </button>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="export-section">
          <h3><FaDownload /> Export Reports</h3>
          <div className="export-buttons">
            <button 
              onClick={() => handleExport('pdf', 'detailed')} 
              className="export-btn pdf-btn"
              disabled={isLoading}
            >
              <FaFilePdf /> Export Detailed PDF
            </button>
            <button 
              onClick={() => handleExport('excel', 'detailed')} 
              className="export-btn excel-btn"
              disabled={isLoading}
            >
              <FaFileExcel /> Export Detailed Excel
            </button>
            <button 
              onClick={() => handleExport('pdf', 'stats')} 
              className="export-btn pdf-btn"
              disabled={isLoading}
            >
              <FaFilePdf /> Export Statistics PDF
            </button>
            <button 
              onClick={() => handleExport('excel', 'stats')} 
              className="export-btn excel-btn"
              disabled={isLoading}
            >
              <FaFileExcel /> Export Statistics Excel
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar /> Overview
          </button>
          <button 
            className={`tab ${activeTab === 'detailed' ? 'active' : ''}`}
            onClick={() => setActiveTab('detailed')}
          >
            <FaUsers /> Detailed View
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating report...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {activeTab === 'overview' && reportData && (
              <div className="overview-tab">
                {/* Statistics Cards */}
                <div className="stats-grid">
                  <StatCard
                    title="Total Applications"
                    value={reportData.overallStats.total_applications}
                    icon={FaUsers}
                    color="blue"
                  />
                  <StatCard
                    title="Unique Applicants"
                    value={reportData.overallStats.unique_applicants}
                    icon={FaUsers}
                    color="green"
                  />
                  <StatCard
                    title="Jobs with Applications"
                    value={reportData.overallStats.jobs_with_applications}
                    icon={FaBriefcase}
                    color="orange"
                  />
                  <StatCard
                    title="Avg Applications/Job"
                    value={reportData.overallStats.avg_applications_per_job}
                    icon={FaChartLine}
                    color="purple"
                  />
                </div>

                {/* Charts */}
                <div className="charts-grid">
                  <ChartCard
                    title="Application Trends"
                    data={reportData.trends}
                    type="line"
                  />
                  <ChartCard
                    title="Top Categories"
                    data={reportData.categoryStats}
                    type="bar"
                  />
                  <ChartCard
                    title="Top Companies"
                    data={reportData.companyStats}
                    type="bar"
                  />
                </div>
              </div>
            )}

            {activeTab === 'detailed' && detailedData && (
              <div className="detailed-tab">
                <div className="detailed-header">
                  <h3>Detailed Applications ({detailedData.total})</h3>
                </div>
                <div className="applications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Application Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedData.applications.map((app, index) => (
                        <tr key={index}>
                          <td>{app.applicant_name}</td>
                          <td>{app.applicant_email}</td>
                          <td>{app.job_title}</td>
                          <td>{app.company_name}</td>
                          <td>{app.job_category}</td>
                          <td>{app.country}, {app.city}</td>
                          <td>{new Date(app.application_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;
