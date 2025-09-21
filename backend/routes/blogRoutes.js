import express from 'express';
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Këtu regjistrojmë rrugët
router.route('/').post(isAuthenticated, createBlog).get(getBlogs); // POST requires authentication, GET is public
router.route('/:id').get(getBlogById).put(isAuthenticated, updateBlog).delete(isAuthenticated, deleteBlog); // GET is public, PUT and DELETE require authentication

// Eksportoje router-in si default
export default router;
