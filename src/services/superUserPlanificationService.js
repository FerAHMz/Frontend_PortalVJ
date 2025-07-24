import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const superUserPlanificationService = {
  /**
   * Get all planifications grouped by grade
   */
  async getAllPlanificationsByGrade() {
    try {
      const response = await axiosInstance.get('/api/superuser/planifications/by-grade');
      return response.data;
    } catch (error) {
      console.error('Error fetching planifications by grade:', error);
      throw error;
    }
  },

  /**
   * Get planifications statistics
   */
  async getPlanificationsStatistics() {
    try {
      const response = await axiosInstance.get('/api/superuser/planifications/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching planifications statistics:', error);
      throw error;
    }
  },

  /**
   * Get planifications by specific grade
   * @param {number} gradeId - The ID of the grade
   */
  async getPlanificationsByGrade(gradeId) {
    try {
      const response = await axiosInstance.get(`/api/superuser/planifications/grade/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching planifications by specific grade:', error);
      throw error;
    }
  },

  /**
   * Get detailed planification by ID
   * @param {number} planificationId - The ID of the planification
   */
  async getPlanificationDetail(planificationId) {
    try {
      const response = await axiosInstance.get(`/api/superuser/planifications/${planificationId}/detail`);
      return response.data;
    } catch (error) {
      console.error('Error fetching planification detail:', error);
      throw error;
    }
  }
};

export default superUserPlanificationService;
