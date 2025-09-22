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

    if (blog.authorId !== user.id.toString()) {
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
    <div className="blogDetailContainer">
      <div className="blogDetailContent">
        {/* Back to Blogs Button */}
        <div className="blogDetailHeader">
          <Link to="/blogs" className="backToBlogsButton">
            ← Back to Blogs
          </Link>
        </div>

        {/* Cover Image */}
        {blog.coverImage && blog.coverImage.url && (
          <div className="blogDetailCoverImage">
            <img 
              src={`http://localhost:4000/${blog.coverImage.url}`} 
              alt={blog.title}
              className="coverImage"
            />
          </div>
        )}

        {/* Blog Header */}
        <div className="blogDetailHeaderContent">
          <h1 className="blogDetailTitle">{blog.title}</h1>
          <div className="blogDetailMeta">
            <span className="blogDetailAuthor">By: {blog.author}</span>
            <span className="blogDetailDate">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Blog Content */}
        <div className="blogDetailContentText">
          <p className="blogContent">{blog.content}</p>
        </div>

        {/* Additional Images Gallery */}
        {blog.additionalImages && blog.additionalImages.length > 0 && (
          <div className="blogDetailAdditionalImages">
            <h3>Gallery</h3>
            <div className="imageGallery">
              {blog.additionalImages.map((image, index) => (
                <div key={index} className="galleryImage">
                  <img 
                    src={`http://localhost:4000/${image.url}`} 
                    alt={`Blog image ${index + 1}`}
                    className="additionalImage"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Only for blog author */}
        {user?.role === "Employer" && blog.authorId === user.id.toString() && (
          <div className="blogDetailActions">
            <button 
              className="editButton" 
              onClick={() => navigateTo(`/blogs/edit/${blog._id}`)}
            >
              Edit Blog
            </button>
            <button 
              className="deleteButton" 
              onClick={deleteBlog}
            >
              Delete Blog
            </button>
          </div>
        )}

        {/* Author Info */}
        <div className="blogDetailAuthorInfo">
          <h3>About the Author</h3>
          <p>This blog was written by <strong>{blog.author}</strong> on {new Date(blog.createdAt).toLocaleDateString()}.</p>
          {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
            <p className="lastUpdated">
              Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
