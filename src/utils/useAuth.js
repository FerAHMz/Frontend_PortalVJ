import { useRouter } from 'vue-router'
import { logout as authLogout } from '@/utils/auth.js'
import { useNotifications } from '@/utils/useNotifications.js'

export const useAuth = () => {
  const router = useRouter()
  const { showSuccess } = useNotifications()

  const logout = async () => {
    try {
      // Clear authentication data
      authLogout()
      
      // Show success message
      showSuccess('Sesión cerrada', 'Has cerrado sesión exitosamente', {
        autoCloseDelay: 1500
      })
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 1000)
      
    } catch (error) {
      console.error('Error during logout:', error)
      // Force redirect to login even if there's an error
      router.push('/login')
    }
  }

  return {
    logout
  }
}
