import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No está autenticado')
  return { headers: { Authorization: `Bearer ${token}` } }
}

export default {
  async fetchAttendance(courseId, date) {
    try {
      console.log(`Obteniendo asistencia curso ${courseId} para fecha ${date}`)
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/attendance`,
        { params: { date }, ...getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('Error en fetchAttendance:', {
        config:   error.config,
        response: error.response?.data
      })
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Error al obtener asistencia'
      )
    }
  },

  async saveAttendance(courseId, date, attendance) {
    try {
      console.log(`Guardando asistencia curso ${courseId} fecha ${date}`, attendance)
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/attendance`,
        { date, attendance },
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error en saveAttendance:', {
        config:   error.config,
        response: error.response?.data
      })
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Error al guardar asistencia'
      )
    }
  }
}
