import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '../../main';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Blog.css'; 

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editBlogId, setEditBlogId] = useState(null);
  const [showActionsForBlog, setShowActionsForBlog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const blogsPerPage = 6;
  
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const [searchParams] = useSearchParams(); 

  
  useEffect(() => {
    fetchBlogs();
  }, [currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/v1/blogs?page=${currentPage}&limit=${blogsPerPage}`);
      setBlogs(response.data.blogs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  // Debug user data
  useEffect(() => {
    console.log("User data:", user);
    console.log("User role:", user?.role);
    console.log("User ID:", user?.id);
  }, [user]);

  // Define startEdit function first
  const startEdit = (blog) => {
    if (user?.role !== "Employer") {
      toast.error("Only Employers can edit blogs");
      return;
    }
    
    // Check if user is the author of the blog
    if (blog.authorId !== user.id.toString() && blog.authorId !== user.id) {
      toast.error("You can only edit your own blogs");
      return;
    }
    
    setIsEditing(true); 
    setEditBlogId(blog._id); 
    setNewBlog({ title: blog.title, content: blog.content });
    
    // Set existing cover image preview if available
    if (blog.coverImage && blog.coverImage.url) {
      setImagePreview(`http://localhost:4000/${blog.coverImage.url}`);
    } else {
      setImagePreview(null);
    }
    setCoverImage(null); // Reset file input
  };

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && blogs.length > 0) {
      const blogToEdit = blogs.find(blog => blog._id === editId);
      if (blogToEdit) {
        startEdit(blogToEdit);
        // Clear the URL parameter
        navigateTo('/blogs', { replace: true });
      }
    }
  }, [searchParams, blogs, navigateTo, user]);

  // Redirect if not authorized
  if (!isAuthorized) {
    navigateTo("/login");
  }

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (PNG, JPEG, JPG, WEBP)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setCoverImage(null);
    setImagePreview(null);
  };

  // Handle additional images selection
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const validFiles = [];
    const previews = [];

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${index + 1}: Please select a valid image file (PNG, JPEG, JPG, WEBP)`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`File ${index + 1}: Image size should be less than 5MB`);
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({
          file: file,
          preview: e.target.result,
          id: Math.random().toString(36).substring(2, 15)
        });
        
        // Update state when all previews are loaded
        if (previews.length === validFiles.length) {
          setAdditionalImages(validFiles);
          setAdditionalImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove individual additional image
  const removeAdditionalImage = (imageId) => {
    const updatedPreviews = additionalImagePreviews.filter(img => img.id !== imageId);
    const updatedFiles = updatedPreviews.map(img => img.file);
    
    setAdditionalImagePreviews(updatedPreviews);
    setAdditionalImages(updatedFiles);
  };

  // Clear all additional images
  const clearAdditionalImages = () => {
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
  };

 
  const saveBlog = async () => {
    if (user?.role !== "Employer") {
      toast.error("Only Employers can create blogs");
      return;
    }

    if (!newBlog.title || !newBlog.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newBlog.title);
      formData.append('content', newBlog.content);
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      // Add additional images
      if (additionalImages.length > 0) {
        additionalImages.forEach((image, index) => {
          formData.append('additionalImages', image);
        });
      }

      if (isEditing) {
        const response = await axios.put(
          `http://localhost:4000/api/v1/blogs/${editBlogId}`, 
          formData,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        setBlogs(blogs.map((blog) => (blog._id === editBlogId ? response.data.blog : blog)));
        setIsEditing(false); 
        setEditBlogId(null);
        toast.success("Blog updated successfully!");
      } else {
        const response = await axios.post(
          "http://localhost:4000/api/v1/blogs", 
          formData,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        setBlogs([response.data.blog, ...blogs]); 
        toast.success("Blog created successfully!");
      }
      
      // Reset form
      setNewBlog({ title: '', content: '' });
      setCoverImage(null);
      setImagePreview(null);
      setAdditionalImages([]);
      setAdditionalImagePreviews([]);
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error.response?.data?.message || "Failed to save blog");
    }
  };

  // Fshi blogun
  const deleteBlog = async (id) => {
    if (user?.role !== "Employer") {
      toast.error("Only Employers can delete blogs");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:4000/api/v1/blogs/${id}`,
        { withCredentials: true }
      );
      setBlogs(blogs.filter((blog) => blog._id !== id));
      toast.success("Blog deleted successfully!");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };


  const cancelEdit = () => {
    setIsEditing(false);
    setEditBlogId(null);
    setNewBlog({ title: '', content: '' });
    setCoverImage(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
  };

  // Handle blog card click to show/hide actions
  const handleBlogCardClick = (blogId, event) => {
    // Check if click was on action buttons or their container
    if (event.target.closest('.blog-card-actions-top')) {
      return; // Don't navigate if clicking on action buttons
    }
    
    if (showActionsForBlog === blogId) {
      setShowActionsForBlog(null); // Hide if already showing
    } else {
      setShowActionsForBlog(blogId); // Show for this blog
    }
  };

  // Handle double click to navigate to blog detail
  const handleBlogDoubleClick = (blogId) => {
    navigateTo(`/blog/${blogId}`);
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setShowActionsForBlog(null); // Hide any open action menus
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setShowActionsForBlog(null);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setShowActionsForBlog(null);
    }
  };

  return (
    <div className="modern-blog-container">
      {/* Header Section */}
      <div className="blog-header">
        <h1 className="blog-main-title">Company Blog</h1>
        <p className="blog-subtitle">Insights, updates, and stories from our team</p>
      </div>
      
      {/* Blog Grid */}
      <div className="blog-grid">
        {loading ? (
          <div className="blog-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading blogs...</p>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No blogs yet</h3>
            <p>Be the first to share your thoughts and insights!</p>
            {user?.role === "Employer" && (
              <button 
                className="create-first-blog-btn"
                onClick={() => {
                  const formSection = document.querySelector('.blog-form-section');
                  formSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Create First Blog
              </button>
            )}
          </div>
        ) : (
          blogs.map((blog) => (
            <article 
              key={blog._id} 
              className="blog-card" 
              onClick={(e) => handleBlogCardClick(blog._id, e)}
              onDoubleClick={() => handleBlogDoubleClick(blog._id)}
            >
              {/* Cover Image */}
              {blog.coverImage && blog.coverImage.url && (
                <div className="blog-card-image">
                  <img 
                    src={`http://localhost:4000/${blog.coverImage.url}`} 
                    alt={blog.title}
                    className="card-cover-image"
                  />
                  <div className="blog-card-overlay">
                    <span className="read-more">Double-click to read more →</span>
                  </div>
                  
                  {/* Edit and Delete Buttons - Top Right Corner */}
                  {user?.role === "Employer" && (blog.authorId === user.id.toString() || blog.authorId === user.id) && showActionsForBlog === blog._id && (
                    <div className="blog-card-actions-top" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="blog-edit-btn-small"
                        onClick={() => startEdit(blog)}
                        title="Edit Blog"
                      >
                        ✏️
                      </button>
                      <button 
                        className="blog-delete-btn-small"
                        onClick={() => deleteBlog(blog._id)}
                        title="Delete Blog"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-author">
                    <span className="author-avatar">👤</span>
                    {blog.author}
                  </span>
                  <span className="blog-date">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <h2 className="blog-card-title">{blog.title}</h2>
                <p className="blog-card-excerpt">
                  {blog.content.length > 150 
                    ? `${blog.content.substring(0, 150)}...` 
                    : blog.content
                  }
                </p>
                
                <div className="blog-card-footer">
                  <span className="read-time">5 min read</span>
                  <span className="blog-category">Company News</span>
                </div>
                
                {/* Debug info - remove this later */}
                <div style={{fontSize: '10px', color: '#666', margin: '5px 0'}}>
                  Debug: User role: {user?.role}, User ID: {user?.id}, Blog authorId: {blog.authorId}
                </div>
                
                {/* Instructions for user */}
                {user?.role === "Employer" && (blog.authorId === user.id.toString() || blog.authorId === user.id) && (
                  <div style={{fontSize: '12px', color: '#666', margin: '5px 0', fontStyle: 'italic'}}>
                    Click to show actions • Double-click to read
                  </div>
                )}
                
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="blog-pagination">
          <div className="pagination-info">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn prev-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn next-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
      
      {/* Blog Creation Form - Only for Employers */}
      {user?.role === "Employer" && (
        <div className="blog-form-section">
          <div className="form-header">
            <h2>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</h2>
            <p>Share your insights and updates with the team</p>
          </div>
          
          <form className="modern-blog-form" onSubmit={(e) => { e.preventDefault(); saveBlog(); }}>
            <div className="form-group">
              <label className="form-label">Blog Title</label>
              <input
                type="text"
                value={newBlog.title}
                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                placeholder="Enter an engaging title..."
                className="form-input"
                required
              />
            </div>
            
            {/* Cover Image Upload Section */}
            <div className="form-group">
              <label className="form-label">Cover Image (Optional)</label>
              
              {imagePreview ? (
                <div className="imagePreview">
                  <img src={imagePreview} alt="Cover preview" className="previewImage" />
                  <button 
                    type="button" 
                    className="removeImageButton"
                    onClick={removeImage}
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <div className="imageUploadArea">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="imageInput"
                    id="coverImageInput"
                  />
                  <label htmlFor="coverImageInput" className="imageUploadButton">
                    📷 Choose Cover Image
                  </label>
                  <p className="imageUploadHint">
                    Supported formats: PNG, JPEG, JPG, WEBP (Max: 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Additional Images Upload Section */}
            <div className="imageUploadSection">
              <label className="imageUploadLabel">
                Additional Images (Optional)
              </label>
              
              {additionalImagePreviews.length > 0 ? (
                <div className="additionalImagesPreview">
                  <div className="previewGrid">
                    {additionalImagePreviews.map((imageData) => (
                      <div key={imageData.id} className="previewImageContainer">
                        <img 
                          src={imageData.preview} 
                          alt="Additional preview" 
                          className="previewImage"
                        />
                        <button 
                          type="button" 
                          className="removeImageButton"
                          onClick={() => removeAdditionalImage(imageData.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="additionalImageActions">
                    <button 
                      type="button" 
                      className="clearAllButton"
                      onClick={clearAdditionalImages}
                    >
                      Clear All Images
                    </button>
                  </div>
                </div>
              ) : (
                <div className="imageUploadArea">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAdditionalImagesChange}
                    className="imageInput"
                    id="additionalImagesInput"
                    multiple
                  />
                  <label htmlFor="additionalImagesInput" className="imageUploadButton">
                    📷 Choose Additional Images
                  </label>
                  <p className="imageUploadHint">
                    You can select multiple images (PNG, JPEG, JPG, WEBP - Max: 5MB each)
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Blog Content</label>
              <textarea
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                placeholder="Share your thoughts, insights, and updates..."
                className="form-textarea"
                rows="8"
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isEditing ? "Update Blog Post" : "Publish Blog Post"} 
              </button>
              {isEditing && (
                <button type="button" className="btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      
      {/* Message for Job Seekers */}
      {user?.role === "Job Seeker" && (
        <div className="job-seeker-message">
          <div className="message-icon">📖</div>
          <h3>Welcome to our Blog!</h3>
          <p>Discover insights, updates, and stories from our team and company.</p>
        </div>
      )}
    </div>
  );
};

export default Blog;
