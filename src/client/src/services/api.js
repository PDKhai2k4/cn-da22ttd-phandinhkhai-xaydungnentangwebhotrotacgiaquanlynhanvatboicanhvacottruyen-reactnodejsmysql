import axios from 'axios';

// API URL configuration - sử dụng nhất quán
// Trong browser, gọi trực tiếp localhost:5000
export const API_URL = typeof window !== 'undefined' 
    ? 'http://localhost:5000' 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
