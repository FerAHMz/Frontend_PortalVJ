import axios from 'axios'

const API_URL = 'http://localhost:3000/api/courses';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No está autenticado');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const courseService = {
  getCourses() {
    return axios.get(`${API_URL}`, getAuthHeaders()); // /api/courses
  },

  getTeachers() {
    return axios.get(`${API_URL}/teachers`, getAuthHeaders()); // /api/courses/teachers
  },

  getSubjects() {
    return axios.get(`${API_URL}/subjects`, getAuthHeaders()); // /api/courses/subjects
  },

  getGrades() {
    return axios.get(`${API_URL}/grades`, getAuthHeaders()); // /api/courses/grades
  },

  getSections() {
    return axios.get(`${API_URL}/sections`, getAuthHeaders()); // /api/courses/sections
  },

  createCourse(courseData) {
    return axios.post(`${API_URL}`, courseData, getAuthHeaders()); // POST /api/courses
  },

  deleteCourse(id) {
    return axios.delete(`${API_URL}/${id}`, getAuthHeaders()); // DELETE /api/courses/:id
  },

  async createGradoSeccion(data) {
    try {
      const response = await axios.post(`${API_URL}/grado-seccion`, data, getAuthHeaders())
      return response
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('La ruta para crear grado-sección no está disponible en el servidor');
      }
      throw error;
    }
}
};
