import Blog from "../models/blogSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

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

  try {
    const newBlog = new Blog({
      title,
      content,
      author: name,
      authorId: id,
    });

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

    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
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
