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

export const familyService = {
  /**
   * Get all families with their relationships
   */
  async getAllFamilies() {
    try {
      const response = await axiosInstance.get('/api/superuser/families');
      return response.data;
    } catch (error) {
      console.error('Error fetching families:', error);
      throw error;
    }
  },

  /**
   * Get all available parents
   */
  async getAvailableParents() {
    try {
      const response = await axiosInstance.get('/api/superuser/families/parents/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available parents:', error);
      throw error;
    }
  },

  /**
   * Get all available students (without parent assigned)
   */
  async getAvailableStudents() {
    try {
      const response = await axiosInstance.get('/api/superuser/families/students/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available students:', error);
      throw error;
    }
  },

  /**
   * Get students by parent ID
   * @param {number} parentId - The ID of the parent
   */
  async getStudentsByParent(parentId) {
    try {
      const response = await axiosInstance.get(`/api/superuser/families/parent/${parentId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students by parent:', error);
      throw error;
    }
  },

  /**
   * Create a new family relationship
   * @param {Object} familyData - The family relationship data
   * @param {number} familyData.id_padre - The parent ID
   * @param {number} familyData.carnet_estudiante - The student carnet
   */
  async createFamily(familyData) {
    try {
      const response = await axiosInstance.post('/api/superuser/families', familyData);
      return response.data;
    } catch (error) {
      console.error('Error creating family relationship:', error);
      throw error;
    }
  },

  /**
   * Update a family relationship
   * @param {number} familyId - The family relationship ID
   * @param {Object} familyData - The updated family data
   * @param {number} familyData.id_padre - The new parent ID
   */
  async updateFamily(familyId, familyData) {
    try {
      const response = await axiosInstance.put(`/api/superuser/families/${familyId}`, familyData);
      return response.data;
    } catch (error) {
      console.error('Error updating family relationship:', error);
      throw error;
    }
  },

  /**
   * Delete a family relationship
   * @param {number} familyId - The family relationship ID
   */
  async deleteFamily(familyId) {
    try {
      const response = await axiosInstance.delete(`/api/superuser/families/${familyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting family relationship:', error);
      throw error;
    }
  },

  /**
   * Get family statistics
   */
  async getFamilyStatistics() {
    try {
      const response = await axiosInstance.get('/api/superuser/families/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching family statistics:', error);
      throw error;
    }
  }
};

export default familyService;
