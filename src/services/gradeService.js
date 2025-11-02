import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

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

export default {
  async getCourseGrades(courseId) {
    try {
      console.log(`Obteniendo calificaciones para curso ${courseId}`);
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/grades`,
        getAuthHeaders()
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al obtener calificaciones');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en getCourseGrades:', {
        config: error.config,
        response: error.response?.data
      });
      
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Error del servidor al obtener calificaciones';
      
      throw new Error(errorMessage);
    }
  },

  async getTaskGrades(courseId, taskId) {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/tasks/${taskId}/grades`,
        getAuthHeaders()
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al obtener calificaciones de tarea');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en getTaskGrades:', error);
      throw error;
    }
  },

  async updateGrade(courseId, taskId, studentId, gradeData) {
    try {
      const response = await axios.put(
        `${API_URL}/courses/${courseId}/tasks/${taskId}/grades/${studentId}`,
        gradeData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error en updateGrade:', error);
      throw error;
    }
  }
};