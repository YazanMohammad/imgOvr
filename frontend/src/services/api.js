import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getImages = () => api.get('/images');
export const getImage = (id) => api.get(`/images/${id}`);
export const uploadImage = (formData) => api.post('/images', formData);
export const updateImage = (id, data) => api.put(`/images/${id}`, data);
export const deleteImage = (id) => api.delete(`/images/${id}`);
export const generateOverlay = (id, text) => api.post(`/images/${id}/overlay`, { text });

export const fileUrl = (name) => `http://localhost:5000/uploads/${name}`;
