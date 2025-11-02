import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/teacher`

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

const studentService = {
  async getStudentsByCourse(courseId) {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/students`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  }
}

export default studentService