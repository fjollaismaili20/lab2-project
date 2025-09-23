import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '../../main';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './BlogDetail.css';

const BlogDetail = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/v1/blogs/${id}`);
        setBlog(response.data.blog);
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to fetch blog details");
        navigateTo('/blogs');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, navigateTo]);

  // Redirect if not authorized
  if (!isAuthorized) {
    navigateTo("/login");
  }

  const deleteBlog = async () => {
    if (user?.role !== "Employer") {
      toast.error("Only Employers can delete blogs");
      return;
    }

    if (blog.authorId !== user.id.toString() && blog.authorId !== user.id) {
      toast.error("You can only delete your own blogs");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:4000/api/v1/blogs/${id}`,
        { withCredentials: true }
      );
      toast.success("Blog deleted successfully!");
      navigateTo('/blogs');
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };

  if (loading) {
    return (
      <div className="blogDetailContainer">
        <div className="loadingSpinner">
          <div className="spinner"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blogDetailContainer">
        <div className="errorMessage">
          <h2>Blog not found</h2>
          <p>The blog you're looking for doesn't exist or has been removed.</p>
          <Link to="/blogs" className="backToBlogsButton">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-blog-detail-container">
      {/* Back Navigation */}
      <div className="blog-detail-nav">
        <Link to="/blogs" className="back-to-blogs-btn">
          ← Back to Blogs
        </Link>
      </div>

      {/* Main Blog Card */}
      <article className="modern-blog-detail-card">
        {/* Cover Image with Overlay */}
        {blog.coverImage && blog.coverImage.url && (
          <div className="blog-detail-image">
            <img 
              src={`http://localhost:4000/${blog.coverImage.url}`} 
              alt={blog.title}
              className="blog-detail-cover-image"
            />
            <div className="blog-detail-overlay">
              <div className="blog-detail-meta-overlay">
                <div className="author-info">
                  <div className="author-avatar">👤</div>
                  <span className="author-name">{blog.author}</span>
                </div>
                <div className="blog-date">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Top Right */}
            {user?.role === "Employer" && (blog.authorId === user.id.toString() || blog.authorId === user.id) && (
              <div className="blog-detail-actions-top">
                <button 
                  className="blog-detail-edit-btn"
                  onClick={() => navigateTo(`/blogs?edit=${blog._id}`)}
                  title="Edit Blog"
                >
                  ✏️
                </button>
                <button 
                  className="blog-detail-delete-btn"
                  onClick={deleteBlog}
                  title="Delete Blog"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        )}

        {/* Blog Content */}
        <div className="blog-detail-content">
          <h1 className="blog-detail-title">{blog.title}</h1>
          
          <div className="blog-detail-body">
            <p className="blog-detail-text">{blog.content}</p>
          </div>

          {/* Additional Images Gallery */}
          {blog.additionalImages && blog.additionalImages.length > 0 && (
            <div className="blog-detail-gallery">
              <h3 className="gallery-title">Gallery</h3>
              <div className="gallery-grid">
                {blog.additionalImages.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={`http://localhost:4000/${image.url}`} 
                      alt={`Blog image ${index + 1}`}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blog Footer */}
          <div className="blog-detail-footer">
            <div className="read-info">
              <span className="read-time">5 min read</span>
              <span className="blog-category">Company News</span>
            </div>
            
            {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
              <div className="last-updated">
                Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
