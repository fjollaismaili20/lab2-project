import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '../../main';
import { useNavigate } from 'react-router-dom';
import './Blog.css'; 

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false); 
  const [editBlogId, setEditBlogId] = useState(null);
  
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate(); 

  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/blogs");
        setBlogs(response.data.blogs || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to fetch blogs");
      }
    };

    fetchBlogs();
  }, []);

  // Redirect if not authorized
  if (!isAuthorized) {
    navigateTo("/login");
  }

 
  const saveBlog = async () => {
    if (user?.role !== "Employer") {
      toast.error("Only Employers can create blogs");
      return;
    }

    try {
      if (isEditing) {
        const response = await axios.put(
          `http://localhost:4000/api/v1/blogs/${editBlogId}`, 
          newBlog,
          { withCredentials: true }
        );
        setBlogs(blogs.map((blog) => (blog._id === editBlogId ? response.data.blog : blog)));
        setIsEditing(false); 
        setEditBlogId(null);
        toast.success("Blog updated successfully!");
      } else {
        const response = await axios.post(
          "http://localhost:4000/api/v1/blogs", 
          newBlog,
          { withCredentials: true }
        );
        setBlogs([response.data.blog, ...blogs]); 
        toast.success("Blog created successfully!");
      }
      setNewBlog({ title: '', content: '' }); 
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

  
  const startEdit = (blog) => {
    if (user?.role !== "Employer") {
      toast.error("Only Employers can edit blogs");
      return;
    }
    
    // Check if user is the author of the blog
    if (blog.authorId !== user.id.toString()) {
      toast.error("You can only edit your own blogs");
      return;
    }
    
    setIsEditing(true); 
    setEditBlogId(blog._id); 
    setNewBlog({ title: blog.title, content: blog.content }); 
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditBlogId(null);
    setNewBlog({ title: '', content: '' });
  };

  return (
    <div className="blogContainer">
      <h1>Company Blogs</h1>
      
      {/* Blog List */}
      <div className="blogList">
        {blogs.length === 0 ? (
          <div className="noBlogsMessage">
            <h3>No blogs available yet.</h3>
            {user?.role === "Employer" && (
              <p>Be the first to share your thoughts!</p>
            )}
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="blogItem">
              <div className="blogHeader">
                <h2 className="blogTitle">{blog.title}</h2>
                <div className="blogMeta">
                  <span className="blogAuthor">By: {blog.author}</span>
                  <span className="blogDate">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="blogContent">{blog.content}</p>
              
              {/* Show edit/delete buttons only to Employers who own the blog */}
              {user?.role === "Employer" && blog.authorId === user.id.toString() && (
                <div className="blogActions">
                  <button className="editButton" onClick={() => startEdit(blog)}>
                    Edit
                  </button>
                  <button className="deleteButton" onClick={() => deleteBlog(blog._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Blog Creation Form - Only for Employers */}
      {user?.role === "Employer" && (
        <div className="blogFormSection">
          <h2>{isEditing ? "Edit Blog" : "Create New Blog"}</h2>
          <div className="addBlogForm">
            <input
              type="text"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
              placeholder="Blog Title"
              className="blogTitleInput"
            />
            <textarea
              value={newBlog.content}
              onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
              placeholder="Write your blog content here..."
              className="blogContentInput"
              rows="6"
            ></textarea>
            <div className="formButtons">
              <button className="addButton" onClick={saveBlog}>
                {isEditing ? "Update Blog" : "Publish Blog"} 
              </button>
              {isEditing && (
                <button className="cancelButton" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Message for Job Seekers */}
      {user?.role === "Job Seeker" && (
        <div className="jobSeekerMessage">
          <p>📖 Welcome! Here you can read blogs shared by companies and employers.</p>
        </div>
      )}
    </div>
  );
};

export default Blog;
