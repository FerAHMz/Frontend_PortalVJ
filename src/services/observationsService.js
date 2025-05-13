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

export const observationsService = {
  async createObservations(carnetEstudiante, courseId, obsData) {
    try {

      const fullData = {
        ...obsData,
        carnet_estudiante: carnetEstudiante,
        id_curso: courseId
      }
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/observations`, 
        fullData,
        getAuthHeaders()
      )
      console.log('URL:', `${API_URL}/courses/${courseId}/observations`);
      return response.data
    } catch (error) {
      console.error('Error creating an observation:', error)
      throw error
    }
  }
}

export default observationsService