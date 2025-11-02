import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants.js'
import { setAuthData, logout, getAuthToken } from '@/utils/auth.js'

const authService = {
  /**
   * Realiza el login del usuario
   */
  async login(email, password) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('🔍 DEBUG - VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('🔍 DEBUG - Final API URL:', apiUrl);
      console.log('🔍 DEBUG - Login URL:', `${apiUrl}/login`);
      
      const response = await axios.post(`${apiUrl}/login`, {
        email,
        password
      })

      if (response.data.success) {
        const { token, user } = response.data
        
        // Almacenar datos de autenticación
        setAuthData(token, user.id, user.rol)
        
        return {
          success: true,
          user: user,
          token: token
        }
      } else {
        return {
          success: false,
          error: 'Credenciales incorrectas'
        }
      }
    } catch (error) {
      console.error('Error en login:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error de conexión con el servidor'
      }
    }
  },

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    logout()
    // Redirigir al login
    window.location.href = '/login'
  },

  /**
   * Verifica si el token sigue siendo válido
   */
  async verifyToken() {
    try {
      const token = getAuthToken()
      if (!token) return false

      // Hacer una petición de verificación al backend
      const response = await axios.get(`${API_BASE_URL}/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return response.data.valid || false
    } catch (error) {
      console.error('Error verificando token:', error)
      logout() // Limpiar datos si el token no es válido
      return false
    }
  },

  /**
   * Refresca el token de autenticación
   */
  async refreshToken() {
    try {
      const token = getAuthToken()
      if (!token) return false

      const response = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setAuthData(response.data.token, response.data.user.id, response.data.user.rol)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error refrescando token:', error)
      logout()
      return false
    }
  }
}

export default authService