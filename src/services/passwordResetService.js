// Servicio para manejo de reset de contraseña
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const passwordResetService = {
  /**
   * Solicitar reset de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async requestReset(email) {
    try {
      const response = await fetch(`${API_URL}/api/password/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud')
      }

      return data
    } catch (error) {
      console.error('Error requesting password reset:', error)
      throw error
    }
  },

  /**
   * Validar token de reset
   * @param {string} token - Token a validar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async validateToken(token) {
    try {
      const response = await fetch(`${API_URL}/api/password/validate-token/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Token inválido')
      }

      return data
    } catch (error) {
      console.error('Error validating token:', error)
      throw error
    }
  },

  /**
   * Resetear contraseña
   * @param {string} token - Token de reset
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_URL}/api/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña')
      }

      return data
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }
}
