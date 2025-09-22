import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { pool, applicationQueries, jobQueries, userQueries } from "../database/postgresSchemas.js";
import ErrorHandler from "../middlewares/error.js";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Get application statistics for reports
export const getApplicationStats = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, period = 'daily', companyId, category, jobId } = req.query;
  
  const client = await pool.connect();
  try {
    let dateFilter = '';
    let groupByClause = '';
    let dateFormat = '';
    
    // Set date format based on period
    if (period === 'daily') {
      dateFormat = 'YYYY-MM-DD';
      groupByClause = 'DATE(a.created_at)';
    } else if (period === 'weekly') {
      dateFormat = 'YYYY-"W"WW';
      groupByClause = 'DATE_TRUNC(\'week\', a.created_at)';
    } else if (period === 'monthly') {
      dateFormat = 'YYYY-MM';
      groupByClause = 'DATE_TRUNC(\'month\', a.created_at)';
    }

    // Build date filter
    if (startDate && endDate) {
      dateFilter = `AND a.created_at >= '${startDate} 00:00:00' AND a.created_at <= '${endDate} 23:59:59'`;
    } else if (startDate) {
      dateFilter = `AND a.created_at >= '${startDate} 00:00:00'`;
    } else if (endDate) {
      dateFilter = `AND a.created_at <= '${endDate} 23:59:59'`;
    } else {
      dateFilter = '';
    }

    // Build additional filters
    let additionalFilters = '';
    if (companyId) {
      additionalFilters += ` AND j.company_id = '${companyId}'`;
    }
    if (category) {
      additionalFilters += ` AND j.category = '${category}'`;
    }
    if (jobId) {
      additionalFilters += ` AND j.id = '${jobId}'`;
    }

    // Get application trends
    const trendsQuery = `
      SELECT 
        TO_CHAR(${groupByClause}, '${dateFormat}') as period,
        COUNT(*) as application_count,
        COUNT(DISTINCT a.job_id) as unique_jobs,
        COUNT(DISTINCT a.applicant_id) as unique_applicants
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE 1=1 ${dateFilter}${additionalFilters}
      GROUP BY ${groupByClause}
      ORDER BY ${groupByClause}
    `;

    // Get job-wise application statistics
    const jobStatsQuery = `
      SELECT 
        j.id,
        j.title,
        j.category,
        c.company_name,
        COUNT(a.id) as application_count,
        j.job_posted_on,
        j.expired
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE 1=1 ${dateFilter}${additionalFilters}
      GROUP BY j.id, j.title, j.category, c.company_name, j.job_posted_on, j.expired
      ORDER BY application_count DESC
    `;

    // Get category-wise statistics
    const categoryStatsQuery = `
      SELECT 
        j.category,
        COUNT(DISTINCT j.id) as total_jobs,
        COUNT(a.id) as total_applications,
        ROUND(AVG(application_counts.app_count), 2) as avg_applications_per_job
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      LEFT JOIN (
        SELECT job_id, COUNT(*) as app_count
        FROM applications
        WHERE 1=1 ${dateFilter.replace(/a\./g, '')}
        GROUP BY job_id
      ) application_counts ON j.id = application_counts.job_id
      WHERE 1=1 ${dateFilter}${additionalFilters}
      GROUP BY j.category
      ORDER BY total_applications DESC
    `;

    // Get company-wise statistics
    const companyStatsQuery = `
      SELECT 
        c.id,
        c.company_name,
        COUNT(DISTINCT j.id) as total_jobs,
        COUNT(a.id) as total_applications,
        ROUND(AVG(application_counts.app_count), 2) as avg_applications_per_job
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id
      LEFT JOIN applications a ON j.id = a.job_id
      LEFT JOIN (
        SELECT job_id, COUNT(*) as app_count
        FROM applications
        WHERE 1=1 ${dateFilter.replace(/a\./g, '')}
        GROUP BY job_id
      ) application_counts ON j.id = application_counts.job_id
      WHERE 1=1 ${dateFilter}${additionalFilters}
      GROUP BY c.id, c.company_name
      HAVING COUNT(DISTINCT j.id) > 0
      ORDER BY total_applications DESC
    `;

    // Get overall statistics
    const overallStatsQuery = `
      SELECT 
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT a.applicant_id) as unique_applicants,
        COUNT(DISTINCT a.job_id) as jobs_with_applications,
        (SELECT COUNT(*) FROM jobs WHERE 1=1 ${additionalFilters}) as total_jobs,
        ROUND(AVG(application_counts.app_count), 2) as avg_applications_per_job
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN (
        SELECT job_id, COUNT(*) as app_count
        FROM applications
        WHERE 1=1 ${dateFilter.replace(/a\./g, '')}
        GROUP BY job_id
      ) application_counts ON a.job_id = application_counts.job_id
      WHERE 1=1 ${dateFilter}${additionalFilters}
    `;

    console.log('Executing report queries with dateFilter:', dateFilter);
    console.log('Additional filters:', additionalFilters);
    console.log('StartDate:', startDate, 'EndDate:', endDate, 'Period:', period);
    console.log('CompanyId:', companyId, 'Category:', category, 'JobId:', jobId);

    let trendsResult, jobStatsResult, categoryStatsResult, companyStatsResult, overallStatsResult;
    
    try {
      [trendsResult, jobStatsResult, categoryStatsResult, companyStatsResult, overallStatsResult] = await Promise.all([
        client.query(trendsQuery),
        client.query(jobStatsQuery),
        client.query(categoryStatsQuery),
        client.query(companyStatsQuery),
        client.query(overallStatsQuery)
      ]);
    } catch (queryError) {
      console.error('SQL Query Error:', queryError);
      throw queryError;
    }

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        trends: trendsResult.rows,
        jobStats: jobStatsResult.rows,
        categoryStats: categoryStatsResult.rows,
        companyStats: companyStatsResult.rows,
        overallStats: overallStatsResult.rows[0] || {
          total_applications: 0,
          unique_applicants: 0,
          jobs_with_applications: 0,
          total_jobs: 0,
          avg_applications_per_job: 0
        }
      }
    });

  } catch (error) {
    console.error('Error generating application stats:', error);
    return next(new ErrorHandler("Failed to generate application statistics", 500));
  } finally {
    client.release();
  }
});

// Get detailed application report
export const getDetailedApplicationReport = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, jobId, companyId, category } = req.query;
  
  const client = await pool.connect();
  try {
    let whereConditions = ['1=1'];
    let params = [];
    let paramCount = 0;

    // Add date filter
    if (startDate) {
      paramCount++;
      whereConditions.push(`a.created_at >= $${paramCount}`);
      params.push(startDate);
    }
    if (endDate) {
      paramCount++;
      whereConditions.push(`a.created_at <= $${paramCount}`);
      params.push(endDate);
    }

    // Add job filter
    if (jobId) {
      paramCount++;
      whereConditions.push(`a.job_id = $${paramCount}`);
      params.push(jobId);
    }

    // Add company filter
    if (companyId) {
      paramCount++;
      whereConditions.push(`j.company_id = $${paramCount}`);
      params.push(companyId);
    }

    // Add category filter
    if (category) {
      paramCount++;
      whereConditions.push(`j.category = $${paramCount}`);
      params.push(category);
    }

    const detailedQuery = `
      SELECT 
        a.id as application_id,
        a.name as applicant_name,
        a.email as applicant_email,
        a.phone as applicant_phone,
        a.created_at as application_date,
        j.title as job_title,
        j.category as job_category,
        c.company_name,
        j.country,
        j.city,
        j.fixed_salary,
        j.salary_from,
        j.salary_to,
        u.name as user_name,
        u.email as user_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN users u ON a.applicant_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY a.created_at DESC
    `;

    const result = await client.query(detailedQuery, params);

    res.status(200).json({
      success: true,
      data: {
        applications: result.rows,
        total: result.rows.length,
        filters: { startDate, endDate, jobId, companyId, category }
      }
    });

  } catch (error) {
    console.error('Error generating detailed report:', error);
    return next(new ErrorHandler("Failed to generate detailed report", 500));
  } finally {
    client.release();
  }
});

// Get available filters for report generation
export const getReportFilters = catchAsyncErrors(async (req, res, next) => {
  const client = await pool.connect();
  try {
    // Get all companies
    const companiesResult = await client.query('SELECT id, company_name FROM companies ORDER BY company_name');
    
    // Get all job categories
    const categoriesResult = await client.query('SELECT DISTINCT category FROM jobs ORDER BY category');
    
    // Get all jobs with basic info
    const jobsResult = await client.query(`
      SELECT j.id, j.title, c.company_name, j.category
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      ORDER BY j.title
    `);

    // Get date range
    const dateRangeResult = await client.query(`
      SELECT 
        MIN(created_at) as earliest_application,
        MAX(created_at) as latest_application
      FROM applications
    `);

    res.status(200).json({
      success: true,
      data: {
        companies: companiesResult.rows,
        categories: categoriesResult.rows.map(row => row.category),
        jobs: jobsResult.rows,
        dateRange: dateRangeResult.rows[0]
      }
    });

  } catch (error) {
    console.error('Error fetching report filters:', error);
    return next(new ErrorHandler("Failed to fetch report filters", 500));
  } finally {
    client.release();
  }
});

// Export report as PDF
export const exportReportPDF = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, jobId, companyId, category, reportType = 'detailed' } = req.query;
  
  const client = await pool.connect();
  try {
    let reportData;
    
    if (reportType === 'detailed') {
      // Get detailed report data directly
      let whereConditions = ['1=1'];
      let params = [];
      let paramCount = 0;

      // Add date filter
      if (startDate) {
        paramCount++;
        whereConditions.push(`a.created_at >= $${paramCount}`);
        params.push(startDate);
      }
      if (endDate) {
        paramCount++;
        whereConditions.push(`a.created_at <= $${paramCount}`);
        params.push(endDate);
      }

      // Add job filter
      if (jobId) {
        paramCount++;
        whereConditions.push(`a.job_id = $${paramCount}`);
        params.push(jobId);
      }

      // Add company filter
      if (companyId) {
        paramCount++;
        whereConditions.push(`j.company_id = $${paramCount}`);
        params.push(companyId);
      }

      // Add category filter
      if (category) {
        paramCount++;
        whereConditions.push(`j.category = $${paramCount}`);
        params.push(category);
      }

      const detailedQuery = `
        SELECT 
          a.id as application_id,
          a.name as applicant_name,
          a.email as applicant_email,
          a.phone as applicant_phone,
          a.created_at as application_date,
          j.title as job_title,
          j.category as job_category,
          c.company_name,
          j.country,
          j.city,
          j.fixed_salary,
          j.salary_from,
          j.salary_to,
          u.name as user_name,
          u.email as user_email
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN users u ON a.applicant_id = u.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY a.created_at DESC
      `;

      const result = await client.query(detailedQuery, params);
      reportData = {
        applications: result.rows,
        total: result.rows.length
      };
    } else {
      // Get statistics report data directly
      let dateFilter = '';
      let groupByClause = '';
      let dateFormat = '';
      
      // Set date format based on period
      const period = req.query.period || 'daily';
      if (period === 'daily') {
        dateFormat = 'YYYY-MM-DD';
        groupByClause = 'DATE(a.created_at)';
      } else if (period === 'weekly') {
        dateFormat = 'YYYY-"W"WW';
        groupByClause = 'DATE_TRUNC(\'week\', a.created_at)';
      } else if (period === 'monthly') {
        dateFormat = 'YYYY-MM';
        groupByClause = 'DATE_TRUNC(\'month\', a.created_at)';
      }

      // Build date filter
      if (startDate && endDate) {
        dateFilter = `AND a.created_at >= '${startDate} 00:00:00' AND a.created_at <= '${endDate} 23:59:59'`;
      } else if (startDate) {
        dateFilter = `AND a.created_at >= '${startDate} 00:00:00'`;
      } else if (endDate) {
        dateFilter = `AND a.created_at <= '${endDate} 23:59:59'`;
      }

      // Get application trends
      const trendsQuery = `
        SELECT 
          TO_CHAR(${groupByClause}, '${dateFormat}') as period,
          COUNT(*) as application_count,
          COUNT(DISTINCT a.job_id) as unique_jobs,
          COUNT(DISTINCT a.applicant_id) as unique_applicants
        FROM applications a
        WHERE 1=1 ${dateFilter}
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause}
      `;

      // Get overall statistics
      const overallStatsQuery = `
        SELECT 
          COUNT(DISTINCT a.id) as total_applications,
          COUNT(DISTINCT a.applicant_id) as unique_applicants,
          COUNT(DISTINCT a.job_id) as jobs_with_applications,
          COUNT(DISTINCT j.id) as total_jobs,
          ROUND(AVG(application_counts.app_count), 2) as avg_applications_per_job
        FROM applications a
        CROSS JOIN jobs j
        LEFT JOIN (
          SELECT job_id, COUNT(*) as app_count
          FROM applications
          WHERE 1=1 ${dateFilter.replace(/a\./g, '')}
          GROUP BY job_id
        ) application_counts ON j.id = application_counts.job_id
        WHERE 1=1 ${dateFilter}
      `;

      const [trendsResult, overallStatsResult] = await Promise.all([
        client.query(trendsQuery),
        client.query(overallStatsQuery)
      ]);

      reportData = {
        trends: trendsResult.rows,
        overallStats: overallStatsResult.rows[0] || {
          total_applications: 0,
          unique_applicants: 0,
          jobs_with_applications: 0,
          total_jobs: 0,
          avg_applications_per_job: 0
        }
      };
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Job Application Report', 20, 20);
    
    // Add date range
    doc.setFontSize(12);
    const dateRange = startDate && endDate ? 
      `${startDate} to ${endDate}` : 
      startDate ? `From ${startDate}` : 
      endDate ? `Until ${endDate}` : 
      'All Time';
    doc.text(`Report Period: ${dateRange}`, 20, 30);
    
    // Add generation date
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
    
    let yPosition = 45;

    if (reportType === 'detailed') {
      // Detailed report table
      const tableData = reportData.applications.map(app => [
        app.applicant_name,
        app.applicant_email,
        app.job_title,
        app.company_name,
        app.job_category,
        new Date(app.application_date).toLocaleDateString()
      ]);

      doc.autoTable({
        head: [['Applicant Name', 'Email', 'Job Title', 'Company', 'Category', 'Application Date']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [45, 86, 73] }
      });
    } else {
      // Statistics report
      const stats = reportData.overallStats;
      
      // Overall statistics
      doc.setFontSize(14);
      doc.text('Overall Statistics', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Applications: ${stats.total_applications}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Unique Applicants: ${stats.unique_applicants}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Jobs with Applications: ${stats.jobs_with_applications}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Average Applications per Job: ${stats.avg_applications_per_job}`, 20, yPosition);
      yPosition += 15;

      // Trends table
      if (reportData.trends.length > 0) {
        doc.setFontSize(14);
        doc.text('Application Trends', 20, yPosition);
        yPosition += 10;

        const trendsData = reportData.trends.map(trend => [
          trend.period,
          trend.application_count,
          trend.unique_jobs,
          trend.unique_applicants
        ]);

        doc.autoTable({
          head: [['Period', 'Applications', 'Unique Jobs', 'Unique Applicants']],
          body: trendsData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [45, 86, 73] }
        });
      }
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="job-report-${Date.now()}.pdf"`);
    
    // Send PDF
    res.send(doc.output('arraybuffer'));

  } catch (error) {
    console.error('Error generating PDF:', error);
    return next(new ErrorHandler("Failed to generate PDF report", 500));
  } finally {
    client.release();
  }
});

// Export report as Excel
export const exportReportExcel = catchAsyncErrors(async (req, res, next) => {
  const { startDate, endDate, jobId, companyId, category, reportType = 'detailed' } = req.query;
  
  const client = await pool.connect();
  try {
    let reportData;
    
    if (reportType === 'detailed') {
      // Get detailed report data directly
      let whereConditions = ['1=1'];
      let params = [];
      let paramCount = 0;

      // Add date filter
      if (startDate) {
        paramCount++;
        whereConditions.push(`a.created_at >= $${paramCount}`);
        params.push(startDate);
      }
      if (endDate) {
        paramCount++;
        whereConditions.push(`a.created_at <= $${paramCount}`);
        params.push(endDate);
      }

      // Add job filter
      if (jobId) {
        paramCount++;
        whereConditions.push(`a.job_id = $${paramCount}`);
        params.push(jobId);
      }

      // Add company filter
      if (companyId) {
        paramCount++;
        whereConditions.push(`j.company_id = $${paramCount}`);
        params.push(companyId);
      }

      // Add category filter
      if (category) {
        paramCount++;
        whereConditions.push(`j.category = $${paramCount}`);
        params.push(category);
      }

      const detailedQuery = `
        SELECT 
          a.id as application_id,
          a.name as applicant_name,
          a.email as applicant_email,
          a.phone as applicant_phone,
          a.created_at as application_date,
          j.title as job_title,
          j.category as job_category,
          c.company_name,
          j.country,
          j.city,
          j.fixed_salary,
          j.salary_from,
          j.salary_to,
          u.name as user_name,
          u.email as user_email
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN users u ON a.applicant_id = u.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY a.created_at DESC
      `;

      const result = await client.query(detailedQuery, params);
      reportData = {
        applications: result.rows,
        total: result.rows.length
      };
    } else {
      // Get statistics report data directly
      let dateFilter = '';
      let groupByClause = '';
      let dateFormat = '';
      
      // Set date format based on period
      const period = req.query.period || 'daily';
      if (period === 'daily') {
        dateFormat = 'YYYY-MM-DD';
        groupByClause = 'DATE(a.created_at)';
      } else if (period === 'weekly') {
        dateFormat = 'YYYY-"W"WW';
        groupByClause = 'DATE_TRUNC(\'week\', a.created_at)';
      } else if (period === 'monthly') {
        dateFormat = 'YYYY-MM';
        groupByClause = 'DATE_TRUNC(\'month\', a.created_at)';
      }

      // Build date filter
      if (startDate && endDate) {
        dateFilter = `AND a.created_at >= '${startDate} 00:00:00' AND a.created_at <= '${endDate} 23:59:59'`;
      } else if (startDate) {
        dateFilter = `AND a.created_at >= '${startDate} 00:00:00'`;
      } else if (endDate) {
        dateFilter = `AND a.created_at <= '${endDate} 23:59:59'`;
      }

      // Get application trends
      const trendsQuery = `
        SELECT 
          TO_CHAR(${groupByClause}, '${dateFormat}') as period,
          COUNT(*) as application_count,
          COUNT(DISTINCT a.job_id) as unique_jobs,
          COUNT(DISTINCT a.applicant_id) as unique_applicants
        FROM applications a
        WHERE 1=1 ${dateFilter}
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause}
      `;

      // Get overall statistics
      const overallStatsQuery = `
        SELECT 
          COUNT(DISTINCT a.id) as total_applications,
          COUNT(DISTINCT a.applicant_id) as unique_applicants,
          COUNT(DISTINCT a.job_id) as jobs_with_applications,
          COUNT(DISTINCT j.id) as total_jobs,
          ROUND(AVG(application_counts.app_count), 2) as avg_applications_per_job
        FROM applications a
        CROSS JOIN jobs j
        LEFT JOIN (
          SELECT job_id, COUNT(*) as app_count
          FROM applications
          WHERE 1=1 ${dateFilter.replace(/a\./g, '')}
          GROUP BY job_id
        ) application_counts ON j.id = application_counts.job_id
        WHERE 1=1 ${dateFilter}
      `;

      const [trendsResult, overallStatsResult] = await Promise.all([
        client.query(trendsQuery),
        client.query(overallStatsQuery)
      ]);

      reportData = {
        trends: trendsResult.rows,
        overallStats: overallStatsResult.rows[0] || {
          total_applications: 0,
          unique_applicants: 0,
          jobs_with_applications: 0,
          total_jobs: 0,
          avg_applications_per_job: 0
        }
      };
    }

    const workbook = XLSX.utils.book_new();

    if (reportType === 'detailed') {
      // Detailed report sheet
      const detailedData = reportData.applications.map(app => ({
        'Applicant Name': app.applicant_name,
        'Email': app.applicant_email,
        'Phone': app.applicant_phone,
        'Job Title': app.job_title,
        'Company': app.company_name,
        'Category': app.job_category,
        'Country': app.country,
        'City': app.city,
        'Salary': app.fixed_salary || `${app.salary_from} - ${app.salary_to}`,
        'Application Date': new Date(app.application_date).toLocaleDateString()
      }));

      const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Applications');
    } else {
      // Statistics sheets
      const stats = reportData.overallStats;
      
      // Overall statistics sheet
      const overallData = [
        { Metric: 'Total Applications', Value: stats.total_applications },
        { Metric: 'Unique Applicants', Value: stats.unique_applicants },
        { Metric: 'Jobs with Applications', Value: stats.jobs_with_applications },
        { Metric: 'Total Jobs', Value: stats.total_jobs },
        { Metric: 'Average Applications per Job', Value: stats.avg_applications_per_job }
      ];
      
      const overallSheet = XLSX.utils.json_to_sheet(overallData);
      XLSX.utils.book_append_sheet(workbook, overallSheet, 'Overall Statistics');

      // Trends sheet
      if (reportData.trends.length > 0) {
        const trendsSheet = XLSX.utils.json_to_sheet(reportData.trends);
        XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Application Trends');
      }

      // Job statistics sheet
      if (reportData.jobStats.length > 0) {
        const jobStatsSheet = XLSX.utils.json_to_sheet(reportData.jobStats);
        XLSX.utils.book_append_sheet(workbook, jobStatsSheet, 'Job Statistics');
      }

      // Category statistics sheet
      if (reportData.categoryStats.length > 0) {
        const categoryStatsSheet = XLSX.utils.json_to_sheet(reportData.categoryStats);
        XLSX.utils.book_append_sheet(workbook, categoryStatsSheet, 'Category Statistics');
      }

      // Company statistics sheet
      if (reportData.companyStats.length > 0) {
        const companyStatsSheet = XLSX.utils.json_to_sheet(reportData.companyStats);
        XLSX.utils.book_append_sheet(workbook, companyStatsSheet, 'Company Statistics');
      }
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="job-report-${Date.now()}.xlsx"`);
    
    // Send Excel file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error generating Excel:', error);
    return next(new ErrorHandler("Failed to generate Excel report", 500));
  } finally {
    client.release();
  }
});
