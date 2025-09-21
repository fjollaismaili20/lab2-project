import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  coverImage: {
    filename: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    }
  }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema); // Krijo modelin

export default Blog; // Eksporto modelin