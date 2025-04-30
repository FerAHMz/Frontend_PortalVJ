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

export const taskService = {
  async createTask(courseId, taskData) {
    try {
      const response = await axios.post(
        `${API_URL}/courses/${courseId}/tasks`, 
        taskData,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  async getCourseTasks(courseId) {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/tasks`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }
}

export default taskService