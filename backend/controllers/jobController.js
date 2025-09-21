import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { pool, jobQueries } from "../database/postgresSchemas.js";
import ErrorHandler from "../middlewares/error.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const client = await pool.connect();
  try {
    const result = await client.query(jobQueries.findAll);
    res.status(200).json({
      success: true,
      jobs: result.rows,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return next(new ErrorHandler("Failed to fetch jobs", 500));
  } finally {
    client.release();
  }
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
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
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide full job details.", 400));
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
    const result = await client.query(jobQueries.insert, [
      title, description, category, country, city, location, 
      fixedSalary, salaryFrom, salaryTo, postedBy
    ]);
    
    res.status(200).json({
      success: true,
      message: "Job Posted Successfully!",
      job: result.rows[0],
    });
  } catch (error) {
    console.error('Error posting job:', error);
    return next(new ErrorHandler("Failed to post job", 500));
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
      myJobs: result.rows,
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
      job: result.rows[0]
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
      job: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  } finally {
    client.release();
  }
});
