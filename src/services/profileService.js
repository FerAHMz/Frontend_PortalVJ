import axios from 'axios'
import { getAuthHeaders } from '@/utils/auth.js'

const API_URL = 'http://localhost:3000/api'

export const profileService = {
  /**
   * Obtiene la información del usuario autenticado
   */
  async getCurrentUserProfile() {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, getAuthHeaders())
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  /**
   * Actualiza la información del perfil del usuario
   */
  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${API_URL}/user/profile`, profileData, getAuthHeaders())
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }
}
