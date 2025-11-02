import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No está autenticado');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export default {
  async getGradosDelDirector() {
    try {
      const response = await axios.get(`${API_URL}/director/grados`, getAuthHeaders());
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener grados');
      }
      return response.data.grados;
    } catch (error) {
      console.error('Error en getGradosDelDirector:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener grados del director'
      );
    }
  },

  async getCursosPorGrado(gradoId) {
    try {
      const response = await axios.get(`${API_URL}/director/grados/${gradoId}/cursos`, getAuthHeaders());
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener cursos del grado');
      }
      return response.data.cursos;
    } catch (error) {
      console.error('Error en getCursosPorGrado:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Error al obtener cursos'
      );
    }
  }
};