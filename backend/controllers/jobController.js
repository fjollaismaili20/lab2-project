import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { pool, jobQueries } from "../database/postgresSchemas.js";
import ErrorHandler from "../middlewares/error.js";

const mapJobRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  country: row.country,
  city: row.city,
  location: row.location,
  fixedSalary: row.fixed_salary,
  salaryFrom: row.salary_from,
  salaryTo: row.salary_to,
  expired: row.expired,
  jobPostedOn: row.job_posted_on,
  postedBy: row.posted_by,
  company: row.company_id ? {
    id: row.company_id,
    companyName: row.company_name,
    address: row.company_address,
    imageUrl: row.company_image_url,
    imageFilename: row.company_image_filename,
  } : null,
});

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const result = await client.query(jobQueries.findAll);
    res.status(200).json({
      success: true,
      jobs: result.rows.map(mapJobRow),
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return next(new ErrorHandler("Failed to fetch jobs", 500));
  } finally {
    client.release();
  }
});

export const searchJobs = catchAsyncErrors(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { 
      search, 
      category, 
      company, 
      country, 
      salaryMin, 
      salaryMax,
      salaryType 
    } = req.query;

    let query = jobQueries.findAll;
    const conditions = [];
    const values = [];
    let paramCount = 0;

    // Add search term (searches in title, description, and company name)
    if (search) {
      paramCount++;
      conditions.push(`(
        j.title ILIKE $${paramCount} OR 
        j.description ILIKE $${paramCount} OR 
        c.company_name ILIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
    }

    // Add category filter
    if (category) {
      paramCount++;
      conditions.push(`j.category = $${paramCount}`);
      values.push(category);
    }

    // Add company filter
    if (company) {
      paramCount++;
      conditions.push(`c.company_name ILIKE $${paramCount}`);
      values.push(`%${company}%`);
    }

    // Add country filter
    if (country) {
      paramCount++;
      conditions.push(`j.country ILIKE $${paramCount}`);
      values.push(`%${country}%`);
    }

    // Add salary range filter
    if (salaryMin || salaryMax) {
      if (salaryType === 'fixed') {
        if (salaryMin) {
          paramCount++;
          conditions.push(`j.fixed_salary >= $${paramCount}`);
          values.push(parseInt(salaryMin));
        }
        if (salaryMax) {
          paramCount++;
          conditions.push(`j.fixed_salary <= $${paramCount}`);
          values.push(parseInt(salaryMax));
        }
      } else {
        // For ranged salary, check if the range overlaps with the filter range
        if (salaryMin) {
          paramCount++;
          conditions.push(`(j.salary_from >= $${paramCount} OR j.salary_to >= $${paramCount})`);
          values.push(parseInt(salaryMin));
        }
        if (salaryMax) {
          paramCount++;
          conditions.push(`(j.salary_from <= $${paramCount} OR j.salary_to <= $${paramCount})`);
          values.push(parseInt(salaryMax));
        }
      }
    }

    // Build the final query
    if (conditions.length > 0) {
      query = query.replace('WHERE j.expired = FALSE', `WHERE j.expired = FALSE AND ${conditions.join(' AND ')}`);
    }

    console.log('Search query:', query);
    console.log('Search values:', values);

    const result = await client.query(query, values);
    
    res.status(200).json({
      success: true,
      jobs: result.rows.map(mapJobRow),
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return next(new ErrorHandler("Failed to search jobs", 500));
  } finally {
    client.release();
  }
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  console.log('Job posting request received:', {
    user: req.user ? { id: req.user.id, role: req.user.role } : 'No user',
    body: req.body,
    headers: req.headers
  });
  
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  
  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    companyId,
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if (!companyId) {
    return next(new ErrorHandler("Please select a company for this job.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler(
        "Please either provide fixed salary or ranged salary.",
        400
      )
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot Enter Fixed and Ranged Salary together.", 400)
    );
  }
  
  const postedBy = req.user.id;
  const client = await pool.connect();
  try {
    console.log('Attempting to insert job with data:', {
      title, description, category, country, city, location, 
      fixedSalary, salaryFrom, salaryTo, companyId, postedBy
    });

    const result = await client.query(jobQueries.insert, [
      title, description, category, country, city, location, 
      fixedSalary, salaryFrom, salaryTo, companyId, postedBy
    ]);
    
    console.log('Job inserted successfully:', result.rows[0]);
    
    // Fetch the complete job data with company information
    const jobId = result.rows[0].id;
    console.log('Fetching complete job data for ID:', jobId);
    
    const completeJobResult = await client.query(jobQueries.findById, [jobId]);
    console.log('Complete job data:', completeJobResult.rows[0]);
    
    res.status(200).json({
      success: true,
      message: "Job Posted Successfully!",
      job: mapJobRow(completeJobResult.rows[0]),
    });
  } catch (error) {
    console.error('Error posting job:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return next(new ErrorHandler(`Failed to post job: ${error.message}`, 500));
  } finally {
    client.release();
  }
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(jobQueries.findByUserId, [req.user.id]);
    res.status(200).json({
      success: true,
      myJobs: result.rows.map(mapJobRow),
    });
  } catch (error) {
    console.error('Error fetching my jobs:', error);
    return next(new ErrorHandler("Failed to fetch jobs", 500));
  } finally {
    client.release();
  }
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  
  const { id } = req.params;
  const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo, expired } = req.body;
  
  const client = await pool.connect();
  try {
    // Check if job exists
    const existingJob = await client.query(jobQueries.findById, [id]);
    if (existingJob.rows.length === 0) {
      return next(new ErrorHandler("OOPS! Job not found.", 404));
    }
    
    const result = await client.query(jobQueries.update, [
      title, description, category, country, city, location, 
      fixedSalary, salaryFrom, salaryTo, expired, id
    ]);
    
    res.status(200).json({
      success: true,
      message: "Job Updated!",
      job: mapJobRow(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return next(new ErrorHandler("Failed to update job", 500));
  } finally {
    client.release();
  }
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // Check if job exists
    const existingJob = await client.query(jobQueries.findById, [id]);
    if (existingJob.rows.length === 0) {
      return next(new ErrorHandler("OOPS! Job not found.", 404));
    }
    
    await client.query(jobQueries.delete, [id]);
    res.status(200).json({
      success: true,
      message: "Job Deleted!",
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return next(new ErrorHandler("Failed to delete job", 500));
  } finally {
    client.release();
  }
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(jobQueries.findById, [id]);
    if (result.rows.length === 0) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job: mapJobRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  } finally {
    client.release();
  }
});
