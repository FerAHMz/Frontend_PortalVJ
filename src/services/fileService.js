import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class FileService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/teacher`,
      timeout: 30000, // 30 seconds for file uploads
    })

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  /**
   * Upload a file to a planification
   * @param {number} courseId - Course ID
   * @param {number} planId - Planification ID
   * @param {FormData} formData - Form data containing the file
   * @returns {Promise} API response
   */
  async uploadPlanificationFile(courseId, planId, formData) {
    try {
      const response = await this.api.post(
        `/planning/${planId}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            // You can emit this progress if needed
            console.log(`Upload Progress: ${percentCompleted}%`)
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Get all files for a planification
   * @param {number} courseId - Course ID
   * @param {number} planId - Planification ID
   * @returns {Promise} List of files
   */
  async getPlanificationFiles(courseId, planId) {
    try {
      const response = await this.api.get(`/planning/${planId}/files`)
      return response.data
    } catch (error) {
      console.error('Error fetching planification files:', error)
      throw error
    }
  }

  /**
   * Download a file
   * @param {number} fileId - File ID
   * @returns {Promise} File blob
   */
  async downloadPlanificationFile(fileId) {
    try {
      const response = await this.api.get(`/planning/files/${fileId}/download`, {
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = 'download'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return response.data
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  /**
   * Delete a file
   * @param {number} fileId - File ID
   * @returns {Promise} API response
   */
  async deletePlanificationFile(fileId) {
    try {
      const response = await this.api.delete(`/planning/files/${fileId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * Get file metadata
   * @param {number} fileId - File ID
   * @returns {Promise} File metadata
   */
  async getFileMetadata(fileId) {
    try {
      const response = await this.api.get(`/planning/files/${fileId}`)
      return response.data
    } catch (error) {
      console.error('Error getting file metadata:', error)
      throw error
    }
  }
}

export default new FileService()
