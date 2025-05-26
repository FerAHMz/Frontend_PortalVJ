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
  console.log(token);
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
  },

  async fetchObservations(courseId, carnetEstudiante) {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/observations/${carnetEstudiante}`,
        getAuthHeaders()
      )
      return response.data.observations || []
    } catch (error) {
      console.error('Error fetching observations:', error)
      throw error
    }
  },

  async updateObservation(observationId, updatedData) {
    try {
      const response = await axios.put(
        `${API_URL}/observations/${observationId}`,
        updatedData,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error updating observation:', error)
      throw error
    }
  },

  async deleteObservation(observationId) {
    try {
      const response = await axios.delete(
        `${API_URL}/observations/${observationId}`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error deleting observation:', error)
      throw error
    }
  }
}

export default observationsService