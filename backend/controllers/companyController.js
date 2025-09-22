// controllers/companyController.js
import { pool, companyQueries, userQueries } from '../database/postgresSchemas.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Merr të gjitha kompanitë
export const getCompanies = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.findAll);
    res.status(200).json({
      success: true,
      companies: result.rows
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// Krijo një kompani të re
export const createCompany = catchAsyncErrors(async (req, res, next) => {
  const { CompanyID, CompanyName, Address, Description } = req.body;

  if (!CompanyID || !CompanyName || !Address || !Description) {
    return next(new ErrorHandler("Please provide all company details", 400));
  }

  let companyImageFilename = null;
  let companyImageUrl = null;

  // Handle image upload if provided
  if (req.files && req.files.companyImage) {
    const file = req.files.companyImage;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return next(new ErrorHandler("Only JPEG, PNG, and GIF images are allowed", 400));
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return next(new ErrorHandler("Image size should not exceed 5MB", 400));
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `company_${Date.now()}_${Math.round(Math.random() * 1E9)}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'companies');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Move file to uploads directory
    const filePath = path.join(uploadsDir, uniqueFilename);
    await file.mv(filePath);

    companyImageFilename = uniqueFilename;
    companyImageUrl = `uploads/companies/${uniqueFilename}`;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.insert, [
      CompanyID, CompanyName, Address, Description, companyImageFilename, companyImageUrl
    ]);
    
    res.status(201).json({
      success: true,
      message: "Company created successfully!",
      company: result.rows[0]
    });
  } catch (error) {
    // If there was an error and we uploaded a file, delete it
    if (companyImageFilename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'companies', companyImageFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Error creating company:', error);
    return next(new ErrorHandler("Failed to create company", 500));
  } finally {
    client.release();
  }
});

// Fshi një kompani
export const deleteCompany = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.delete, [req.params.id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// Edito një kompani
export const updateCompany = catchAsyncErrors(async (req, res, next) => {
  const { CompanyID, CompanyName, Address, Description } = req.body;
  const companyId = req.params.id;

  if (!CompanyID || !CompanyName || !Address || !Description) {
    return next(new ErrorHandler("Please provide all company details", 400));
  }

  // Get current company data to check for existing image
  const client = await pool.connect();
  let currentCompany = null;
  try {
    const currentResult = await client.query(companyQueries.findById, [companyId]);
    if (currentResult.rows.length === 0) {
      return next(new ErrorHandler("Company not found", 404));
    }
    currentCompany = currentResult.rows[0];
  } catch (error) {
    console.error('Error fetching current company:', error);
    return next(new ErrorHandler("Failed to fetch company", 500));
  } finally {
    client.release();
  }

  let companyImageFilename = currentCompany.company_image_filename;
  let companyImageUrl = currentCompany.company_image_url;

  // Handle image upload if provided
  if (req.files && req.files.companyImage) {
    const file = req.files.companyImage;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return next(new ErrorHandler("Only JPEG, PNG, and GIF images are allowed", 400));
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return next(new ErrorHandler("Image size should not exceed 5MB", 400));
    }

    // Delete old image if it exists
    if (currentCompany.company_image_filename) {
      const oldFilePath = path.join(__dirname, '..', 'uploads', 'companies', currentCompany.company_image_filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `company_${Date.now()}_${Math.round(Math.random() * 1E9)}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'companies');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Move file to uploads directory
    const filePath = path.join(uploadsDir, uniqueFilename);
    await file.mv(filePath);

    companyImageFilename = uniqueFilename;
    companyImageUrl = `uploads/companies/${uniqueFilename}`;
  }

  try {
    const result = await client.query(companyQueries.update, [
      CompanyID, CompanyName, Address, Description, companyImageFilename, companyImageUrl, companyId
    ]);
    
    res.status(200).json({
      success: true,
      message: "Company updated successfully!",
      company: result.rows[0]
    });
  } catch (error) {
    // If there was an error and we uploaded a new file, delete it
    if (req.files && req.files.companyImage && companyImageFilename !== currentCompany.company_image_filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'companies', companyImageFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Error updating company:', error);
    return next(new ErrorHandler("Failed to update company", 500));
  } finally {
    client.release();
  }
});

// Get company by ID
export const getCompanyById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.findById, [id]);
    if (result.rows.length === 0) {
      return next(new ErrorHandler("Company not found!", 404));
    }
    res.status(200).json({
      success: true,
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return next(new ErrorHandler("Failed to fetch company", 500));
  } finally {
    client.release();
  }
});

// Assign company to user (employer)
export const assignCompanyToUser = async (req, res) => {
  const { userId, companyId } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(userQueries.assignCompany, [companyId, userId]);
    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error assigning company to user:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};
