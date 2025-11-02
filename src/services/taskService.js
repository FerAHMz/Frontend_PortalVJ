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
  },

  async getTaskGrades(courseId, taskId) {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/tasks/${taskId}/grades`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error fetching task grades:', error)
      throw error
    }
  },

  async getAllHomework(teacherId) {
    try {
      const response = await axios.get(
        `${API_URL}/${teacherId}/homework`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error fetching all homework:', error)
      throw error
    }
  }
}

export default taskService