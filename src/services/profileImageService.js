import axios from 'axios'
import { getAuthHeaders } from '@/utils/auth.js'

const API_URL = 'http://localhost:3000/api'

export const profileImageService = {
  /**
   * Sube una imagen de perfil y actualiza el perfil del usuario
   * @param {File} file - El archivo de imagen
   * @returns {Promise} Response con la URL de la imagen
   */
  async uploadProfileImage(file) {
    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await axios.post(
        `${API_URL}/profile/upload-image`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            console.log(`Upload Progress: ${percentCompleted}%`)
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw error
    }
  },

  /**
   * Actualiza la URL de la imagen de perfil del usuario
   * @param {string} imageUrl - URL de la imagen en Cloudflare
   * @returns {Promise} Response de la actualización
   */
  async updateProfileImageUrl(imageUrl) {
    try {
      const response = await axios.put(
        `${API_URL}/profile/image`,
        { profileImageUrl: imageUrl },
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error updating profile image URL:', error)
      throw error
    }
  },

  /**
   * Elimina la imagen de perfil actual
   * @returns {Promise} Response de la eliminación
   */
  async deleteProfileImage() {
    try {
      const response = await axios.delete(
        `${API_URL}/profile/image`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error deleting profile image:', error)
      throw error
    }
  },

  /**
   * Obtiene el perfil del usuario con imagen
   * @returns {Promise} Response con el perfil incluyendo imagen
   */
  async getProfileWithImage() {
    try {
      const response = await axios.get(
        `${API_URL}/profile/with-image`,
        getAuthHeaders()
      )
      return response.data
    } catch (error) {
      console.error('Error getting profile with image:', error)
      throw error
    }
  }
}
