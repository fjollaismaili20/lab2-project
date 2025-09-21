import Blog from "../models/blogSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funksioni për të marrë të gjitha blogjet
export const getBlogs = catchAsyncErrors(async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return next(new ErrorHandler("Failed to fetch blogs", 500));
  }
});

// Funksioni për të krijuar një blog të ri (vetëm për Employers)
export const createBlog = catchAsyncErrors(async (req, res, next) => {
  const { role, name, id } = req.user;
  
  // Kontrollo nëse përdoruesi është Employer
  if (role !== "Employer") {
    return next(
      new ErrorHandler("Only Employers are allowed to create blogs.", 403)
    );
  }

  const { title, content } = req.body;
  
  if (!title || !content) {
    return next(new ErrorHandler("Please provide both title and content.", 400));
  }

  let coverImageData = null;
  let additionalImagesData = [];

  // Handle cover image upload if provided
  if (req.files && req.files.coverImage) {
    const { coverImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    
    if (!allowedFormats.includes(coverImage.mimetype)) {
      return next(
        new ErrorHandler("Invalid image type. Please upload PNG, JPEG, JPG, or WEBP files.", 400)
      );
    }

    // Generate unique filename for cover image
    const timestamp = Date.now();
    const originalExtension = path.extname(coverImage.name);
    const filename = `blog_cover_${timestamp}_${Math.random().toString(36).substring(2, 15)}${originalExtension}`;
    
    // Create uploads/blog-images directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'blog-images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Define file path
    const filePath = path.join(uploadsDir, filename);
    
    try {
      // Move file from temp location to uploads directory
      await coverImage.mv(filePath);
      coverImageData = {
        filename: filename,
        url: `uploads/blog-images/${filename}`
      };
    } catch (error) {
      console.error("Cover image upload error:", error);
      return next(new ErrorHandler("Failed to upload cover image", 500));
    }
  }

  // Handle additional images upload if provided
  if (req.files && req.files.additionalImages) {
    const additionalImages = Array.isArray(req.files.additionalImages) 
      ? req.files.additionalImages 
      : [req.files.additionalImages];
    
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'blog-images');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (let i = 0; i < additionalImages.length; i++) {
      const image = additionalImages[i];
      
      if (!allowedFormats.includes(image.mimetype)) {
        return next(
          new ErrorHandler(`Invalid image type for image ${i + 1}. Please upload PNG, JPEG, JPG, or WEBP files.`, 400)
        );
      }

      // Generate unique filename for each additional image
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const originalExtension = path.extname(image.name);
      const filename = `blog_additional_${timestamp}_${i}_${randomString}${originalExtension}`;
      
      const filePath = path.join(uploadsDir, filename);
      
      try {
        await image.mv(filePath);
        additionalImagesData.push({
          filename: filename,
          url: `uploads/blog-images/${filename}`
        });
      } catch (error) {
        console.error(`Additional image ${i + 1} upload error:`, error);
        return next(new ErrorHandler(`Failed to upload additional image ${i + 1}`, 500));
      }
    }
  }

  try {
    const blogData = {
      title,
      content,
      author: name,
      authorId: id,
    };

    // Add cover image data if available
    if (coverImageData) {
      blogData.coverImage = coverImageData;
    }

    // Add additional images data if available
    if (additionalImagesData.length > 0) {
      blogData.additionalImages = additionalImagesData;
    }

    const newBlog = new Blog(blogData);
    const savedBlog = await newBlog.save();
    
    res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      blog: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return next(new ErrorHandler("Failed to create blog", 500));
  }
});

// Funksioni për të përditësuar një blog (vetëm nga autori)
export const updateBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  // Kontrollo nëse përdoruesi është Employer
  if (role !== "Employer") {
    return next(
      new ErrorHandler("Only Employers are allowed to update blogs.", 403)
    );
  }

  try {
    // Gjej blogun për të kontrolluar autorin
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return next(new ErrorHandler("Blog not found!", 404));
    }

    // Kontrollo nëse përdoruesi është autori i blogut
    if (existingBlog.authorId !== userId.toString()) {
      return next(
        new ErrorHandler("You can only update your own blogs.", 403)
      );
    }

    let updateData = { ...req.body };

    // Handle cover image upload if provided
    if (req.files && req.files.coverImage) {
      const { coverImage } = req.files;
      const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      
      if (!allowedFormats.includes(coverImage.mimetype)) {
        return next(
          new ErrorHandler("Invalid image type. Please upload PNG, JPEG, JPG, or WEBP files.", 400)
        );
      }

      // Delete old cover image if exists
      if (existingBlog.coverImage && existingBlog.coverImage.filename) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', 'blog-images', existingBlog.coverImage.filename);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            console.error("Error deleting old cover image:", error);
          }
        }
      }

      // Generate unique filename for new cover image
      const timestamp = Date.now();
      const originalExtension = path.extname(coverImage.name);
      const filename = `blog_cover_${timestamp}_${Math.random().toString(36).substring(2, 15)}${originalExtension}`;
      
      // Create uploads/blog-images directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'blog-images');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Define file path
      const filePath = path.join(uploadsDir, filename);
      
      try {
        // Move file from temp location to uploads directory
        await coverImage.mv(filePath);
        updateData.coverImage = {
          filename: filename,
          url: `uploads/blog-images/${filename}`
        };
      } catch (error) {
        console.error("Cover image upload error:", error);
        return next(new ErrorHandler("Failed to upload cover image", 500));
      }
    }

    // Handle additional images upload if provided
    if (req.files && req.files.additionalImages) {
      const additionalImages = Array.isArray(req.files.additionalImages) 
        ? req.files.additionalImages 
        : [req.files.additionalImages];
      
      const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'blog-images');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Delete old additional images if they exist
      if (existingBlog.additionalImages && existingBlog.additionalImages.length > 0) {
        existingBlog.additionalImages.forEach(image => {
          const oldImagePath = path.join(__dirname, '..', 'uploads', 'blog-images', image.filename);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (error) {
              console.error("Error deleting old additional image:", error);
            }
          }
        });
      }

      const additionalImagesData = [];
      for (let i = 0; i < additionalImages.length; i++) {
        const image = additionalImages[i];
        
        if (!allowedFormats.includes(image.mimetype)) {
          return next(
            new ErrorHandler(`Invalid image type for image ${i + 1}. Please upload PNG, JPEG, JPG, or WEBP files.`, 400)
          );
        }

        // Generate unique filename for each additional image
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const originalExtension = path.extname(image.name);
        const filename = `blog_additional_${timestamp}_${i}_${randomString}${originalExtension}`;
        
        const filePath = path.join(uploadsDir, filename);
        
        try {
          await image.mv(filePath);
          additionalImagesData.push({
            filename: filename,
            url: `uploads/blog-images/${filename}`
          });
        } catch (error) {
          console.error(`Additional image ${i + 1} upload error:`, error);
          return next(new ErrorHandler(`Failed to upload additional image ${i + 1}`, 500));
        }
      }

      updateData.additionalImages = additionalImagesData;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return next(new ErrorHandler("Failed to update blog", 500));
  }
});

// Funksioni për të fshirë një blog (vetëm nga autori)
export const deleteBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  // Kontrollo nëse përdoruesi është Employer
  if (role !== "Employer") {
    return next(
      new ErrorHandler("Only Employers are allowed to delete blogs.", 403)
    );
  }

  try {
    // Gjej blogun për të kontrolluar autorin
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return next(new ErrorHandler("Blog not found!", 404));
    }

    // Kontrollo nëse përdoruesi është autori i blogut
    if (existingBlog.authorId !== userId.toString()) {
      return next(
        new ErrorHandler("You can only delete your own blogs.", 403)
      );
    }

    // Delete cover image if exists
    if (existingBlog.coverImage && existingBlog.coverImage.filename) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'blog-images', existingBlog.coverImage.filename);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error("Error deleting cover image:", error);
        }
      }
    }

    // Delete additional images if they exist
    if (existingBlog.additionalImages && existingBlog.additionalImages.length > 0) {
      existingBlog.additionalImages.forEach(image => {
        const imagePath = path.join(__dirname, '..', 'uploads', 'blog-images', image.filename);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (error) {
            console.error("Error deleting additional image:", error);
          }
        }
      });
    }

    await Blog.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return next(new ErrorHandler("Failed to delete blog", 500));
  }
});

// Funksioni për të marrë një blog sipas ID
export const getBlogById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new ErrorHandler("Blog not found!", 404));
    }
    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return next(new ErrorHandler("Failed to fetch blog", 500));
  }
});
