import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { pool, applicationQueries, jobQueries } from "../database/postgresSchemas.js";
import cloudinary from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }
  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = req.user.id;
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  
  const client = await pool.connect();
  try {
    const jobResult = await client.query(jobQueries.findById, [jobId]);
    if (jobResult.rows.length === 0) {
      return next(new ErrorHandler("Job not found!", 404));
    }
    
    const jobDetails = jobResult.rows[0];
    const employerID = jobDetails.posted_by;
    if (
      !name ||
      !email ||
      !coverLetter ||
      !phone ||
      !address ||
      !applicantID ||
      !employerID
    ) {
      return next(new ErrorHandler("Please fill all fields.", 400));
    }
    
    const result = await client.query(applicationQueries.insert, [
      name, email, coverLetter, phone, address, 
      cloudinaryResponse.public_id, cloudinaryResponse.secure_url,
      applicantID, employerID, jobId
    ]);
    
    res.status(200).json({
      success: true,
      message: "Application Submitted!",
      application: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return next(new ErrorHandler("Failed to submit application", 500));
  } finally {
    client.release();
  }
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(applicationQueries.findByEmployerId, [req.user.id]);
      res.status(200).json({
        success: true,
        applications: result.rows,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      return next(new ErrorHandler("Failed to fetch applications", 500));
    } finally {
      client.release();
    }
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(applicationQueries.findByApplicantId, [req.user.id]);
      res.status(200).json({
        success: true,
        applications: result.rows,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      return next(new ErrorHandler("Failed to fetch applications", 500));
    } finally {
      client.release();
    }
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    
    const { id } = req.params;
    const client = await pool.connect();
    try {
      // Check if application exists
      const existingApp = await client.query(applicationQueries.findById, [id]);
      if (existingApp.rows.length === 0) {
        return next(new ErrorHandler("Application not found!", 404));
      }
      
      await client.query(applicationQueries.delete, [id]);
      res.status(200).json({
        success: true,
        message: "Application Deleted!",
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      return next(new ErrorHandler("Failed to delete application", 500));
    } finally {
      client.release();
    }
  }
);
