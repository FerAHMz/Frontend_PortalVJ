import axios from 'axios'

const API_URL = 'http://localhost:3000/api/teacher'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No está autenticado')
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
}

export const reportCardService = {
  
  async fetchGradesTrimestre(gradeSectionId, carnetEstudiante, trimestre) {
    try {
      const response = await axios.get(
        `${API_URL}/report-card/${carnetEstudiante}`,
        {
          ...getAuthHeaders(),
          params: { gradeSectionId, trimestre }
        }
      );
      return response.data
    } catch (error) {
      console.error('Error fetching observations:', error)
      throw error
    }
  },

  async fetchStudentsGradeSection(gradeSectionId, trimestre, year) {
    try {
      const response = await axios.get(
        `${API_URL}/grade-sections/${gradeSectionId}/report-card`,
        {
          ...getAuthHeaders(),
          params: { year, trimestre }
        }
      );
      return response.data
    } catch (error) {
      console.error('Error fetching students grade section:', error)
      throw error
    }
  },

  async fetchGradeSections() {
    try {
      const response = await axios.get(
        `${API_URL}/grade-sections`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grade sections:', error);
      throw error;
    }
  },

  //Obtiene solo los grados asignados al maestro autenticado
  async fetchTeacherGradeSections() {
    try {
      const response = await axios.get(
        `${API_URL}/teacher-grade-sections`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher grade sections:', error);
      throw error;
    }
  },

  async fetchObservaciones(gradeSectionId, carnetEstudiante) {
    try {
      const response = await axios.get(
        `${API_URL}/report-card/grade-sections/${gradeSectionId}/${carnetEstudiante}/observaciones`,
        getAuthHeaders()
      );
      return response.data
    } catch (error) {
      console.error('Error fetching observaciones:', error)
      throw error
    }
  },
  async fetchGrado(gradeSectionId){
    try {
      const response = await axios.get(
        `${API_URL}/report-card/student-grade/${gradeSectionId}`,
        getAuthHeaders()
      );
      return response.data
    } catch (error) {
      console.error('Error al traer el grado del estudiante:', error)
      throw error
    }
  }
}

export default reportCardService