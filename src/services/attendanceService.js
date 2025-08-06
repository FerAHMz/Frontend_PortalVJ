import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No está autenticado')
  return { headers: { Authorization: `Bearer ${token}` } }
}

export default {
  // Funciones para maestros
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
        config: error.config,
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
        config: error.config,
        response: error.response?.data
      })
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Error al guardar asistencia'
      )
    }
  },

  async getAttendanceReport(courseId, startDate, endDate) {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/attendance/report`,
        {
          params: { startDate, endDate },
          ...getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error en getAttendanceReport:', error);
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Error al obtener el reporte de asistencia'
      );
    }
  },


  // Funciones para padres
  async getStudentAttendance(studentCarnet, startDate, endDate, subjectId = null) {
    try {
      console.log(`Obteniendo asistencia del estudiante ${studentCarnet} desde ${startDate} hasta ${endDate}`)
      
      const params = { startDate, endDate }
      if (subjectId) {
        params.subjectId = subjectId
      }

      const response = await axios.get(
        `${API_URL}/students/${studentCarnet}/attendance`,
        { params, ...getAuthHeaders() }
      )
      
      if (response.data && response.data.success) {
        return {
          success: true,
          attendance: response.data.attendance || [],
          recent: response.data.recent || [],
          subjects: response.data.subjects || []
        }
      }
      
      return {
        success: false,
        message: response.data?.message || 'No se pudo obtener la información'
      }
    } catch (error) {
      console.error('Error en getStudentAttendance:', {
        config: error.config,
        response: error.response?.data
      })
      return {
        success: false,
        message: error.response?.data?.error || 
                error.message || 
                'Error al obtener la información de asistencia del estudiante'
      }
    }
  },

  async getStudentAttendanceSummary(studentCarnet, period = 'month') {
    try {
      console.log(`Obteniendo resumen de asistencia del estudiante ${studentCarnet} para periodo ${period}`)
      
      const response = await axios.get(
        `${API_URL}/students/${studentCarnet}/attendance/summary`,
        { params: { period }, ...getAuthHeaders() }
      )
      
      return response.data
    } catch (error) {
      console.error('Error en getStudentAttendanceSummary:', {
        config: error.config,
        response: error.response?.data
      })
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Error al obtener el resumen de asistencia'
      )
    }
  }
}