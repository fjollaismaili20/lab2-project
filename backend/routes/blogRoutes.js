import express from 'express';
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from '../controllers/blogController.js';

const router = express.Router();

// Këtu regjistrojmë rrugët
router.route('/').post(createBlog).get(getBlogs); // Kjo rregullon POST dhe GET për /api/v1/blogs
router.route('/:id').get(getBlogById).put(updateBlog).delete(deleteBlog); // Kjo rregullon GET, PUT dhe DELETE për /api/v1/blogs/:id

// Eksportoje router-in si default
export default router;
