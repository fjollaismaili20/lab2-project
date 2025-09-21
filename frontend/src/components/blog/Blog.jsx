import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Blog.css'; 
const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false); 
  const [editBlogId, setEditBlogId] = useState(null); 

  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/blogs");
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

 
  const saveBlog = async () => {
    try {
      if (isEditing) {
       
        const response = await axios.put(`http://localhost:4000/api/v1/blogs/${editBlogId}`, newBlog);
        setBlogs(blogs.map((blog) => (blog._id === editBlogId ? response.data : blog)));
        setIsEditing(false); 
        setEditBlogId(null); 
      } else {
        
        const response = await axios.post("http://localhost:4000/api/v1/blogs", newBlog);
        setBlogs([...blogs, response.data]); 
      }
      setNewBlog({ title: '', content: '' }); 
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  // Fshi blogun
  const deleteBlog = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/blogs/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id)); // Hiq blogun e fshirë nga lista
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  
  const startEdit = (blog) => {
    setIsEditing(true); 
    setEditBlogId(blog._id); 
    setNewBlog({ title: blog.title, content: blog.content }); 
  };

  return (
    <div className="blogContainer">
      <h1>Blog List</h1>
      <ul className="blogList">
        {blogs.map((blog) => (
          <li key={blog._id} className="blogItem">
            <h2 className="blogTitle">{blog.title}</h2>
            <p className="blogContent">{blog.content}</p>
            <button className="editButton" onClick={() => startEdit(blog)}>Edit</button>
            <button className="deleteButton" onClick={() => deleteBlog(blog._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>{isEditing ? "Edit Blog" : "Add New Blog"}</h2>
      <div className="addBlogForm">
        <input
          type="text"
          value={newBlog.title}
          onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          value={newBlog.content}
          onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
          placeholder="Content"
        ></textarea>
        <button className="addButton" onClick={saveBlog}>
          {isEditing ? "Update Blog" : "Add Blog"} 
        </button>
      </div>
    </div>
  );
};

export default Blog;
