import { getToken } from './auth';
import axios from "axios";

// Base URL of your backend
const API = axios.create({
  baseURL: "http://localhost:5000",
});

// Attach auth token to requests when available
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== API FUNCTIONS =====

// Get all posts
export const getPosts = () => API.get("/posts");

// Get posts created by current user
export const getMyPosts = () => API.get('/posts/mine');

// Create a new post
export const createPost = (data) => API.post("/posts", data);

// Vote
export const votePost = (postId, value) => API.post(`/posts/${postId}/vote`, { value });

// Comments
export const addComment = (postId, content) => API.post(`/posts/${postId}/comments`, { content });
export const deleteComment = (postId, commentId) => API.delete(`/posts/${postId}/comments/${commentId}`);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const signup = (data) => API.post('/auth/signup', data);

// Get one post
export const getPostById = (id) => API.get(`/posts/${id}`);

// Update a post
export const updatePost = (id, data) => API.put(`/posts/${id}`, data);

// Delete a post
export const deletePost = (id) => API.delete(`/posts/${id}`);

export default API;
