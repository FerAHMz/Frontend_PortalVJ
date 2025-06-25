import { USER_ROLES } from './constants.js'

/**
 * Obtiene el token de autenticación del localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('token')
}

/**
 * Obtiene la información del usuario autenticado
 */
export const getCurrentUser = () => {
  const token = getAuthToken()
  const userId = localStorage.getItem('userId')
  const userRole = localStorage.getItem('userRole')

  if (!token) return null

  try {
    // Decodificar el JWT para obtener información del usuario
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: userId || payload.userId || payload.id,
      role: userRole || payload.rol || payload.role,
      email: payload.email,
      exp: payload.exp
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    // Si hay error decodificando pero tenemos datos en localStorage, usarlos
    if (userId && userRole) {
      return {
        id: userId,
        role: userRole,
        email: null,
        exp: null
      }
    }
    return null
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = getAuthToken()
  if (!token) return false

  const user = getCurrentUser()
  if (!user) return false

  // Si tenemos exp, verificar si el token ha expirado
  if (user.exp) {
    const now = Math.floor(Date.now() / 1000)
    if (user.exp < now) {
      logout()
      return false
    }
  }

  // Si no tenemos exp pero tenemos usuario y token, asumir que está autenticado
  return true
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser()
  return user && user.role === requiredRole
}

/**
 * Verifica si el usuario puede acceder a una ruta específica
 */
export const canAccessRoute = (routePath) => {
  if (!isAuthenticated()) return false

  const user = getCurrentUser()
  if (!user) return false

  // Rutas públicas
  if (routePath === '/' || routePath === '/login') return true

  // Verificar acceso por rol
  switch (user.role) {
    case USER_ROLES.SUPER_USER:
      return routePath.startsWith('/superuser')
    case USER_ROLES.DIRECTOR:
      return routePath.startsWith('/director')
    case USER_ROLES.ADMIN:
      return routePath.startsWith('/admin')
    case USER_ROLES.TEACHER:
      return routePath.startsWith('/teacher')
    case USER_ROLES.PARENT:
      return routePath.startsWith('/parent')
    default:
      return false
  }
}

/**
 * Obtiene la ruta principal según el rol del usuario
 */
export const getHomeRouteForRole = (role) => {
  switch (role) {
    case USER_ROLES.SUPER_USER:
      return '/superuser'
    case USER_ROLES.DIRECTOR:
      return '/director'
    case USER_ROLES.ADMIN:
      return '/admin'
    case USER_ROLES.TEACHER:
      return '/teacher'
    case USER_ROLES.PARENT:
      return '/parent'
    default:
      return '/login'
  }
}

/**
 * Cierra la sesión del usuario
 */
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('userRole')
  sessionStorage.clear()
}

/**
 * Almacena la información de autenticación
 */
export const setAuthData = (token, userId, userRole) => {
  localStorage.setItem('token', token)
  localStorage.setItem('userId', userId)
  localStorage.setItem('userRole', userRole)
}

/**
 * Obtiene headers de autenticación para requests HTTP
 */
export const getAuthHeaders = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No está autenticado')
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}
