import { isAuthenticated, canAccessRoute, getHomeRouteForRole, getCurrentUser } from '@/utils/auth.js'

/**
 * Middleware de autenticación para Vue Router
 */
export const authMiddleware = (to, from, next) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/forgot-password', '/reset-password']

  if (publicRoutes.includes(to.path)) {
    // Si el usuario ya está autenticado y trata de ir al login, redirigir a su dashboard
    // EXCEPTO si viene desde las páginas de reset password
    if (to.path === '/login' && isAuthenticated()) {
      const comesFromResetPages = from.path === '/forgot-password' || from.path === '/reset-password'
      if (!comesFromResetPages) {
        const user = getCurrentUser()
        if (user) {
          next(getHomeRouteForRole(user.role))
          return
        }
      }
    }
    next()
    return
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    console.warn('Usuario no autenticado, redirigiendo al login')
    next('/login')
    return
  }

  // Verificar acceso a la ruta específica
  if (!canAccessRoute(to.path)) {
    console.warn(`Acceso denegado a la ruta: ${to.path}`)
    const user = getCurrentUser()
    if (user) {
      // Redirigir al dashboard correspondiente a su rol
      next(getHomeRouteForRole(user.role))
    } else {
      next('/login')
    }
    return
  }

  // Verificar roles específicos si están definidos en la ruta
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const user = getCurrentUser()
    if (!user || !to.meta.roles.includes(user.role)) {
      console.warn(`Rol insuficiente para acceder a: ${to.path}`)
      next(getHomeRouteForRole(user.role))
      return
    }
  }

  // Permitir navegación
  next()
}

/**
 * Guard específico para verificar roles
 */
export const roleGuard = (allowedRoles) => {
  return (to, from, next) => {
    if (!isAuthenticated()) {
      next('/login')
      return
    }

    const user = getCurrentUser()
    if (!user || !allowedRoles.includes(user.role)) {
      console.warn(`Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}`)
      next(getHomeRouteForRole(user.role))
      return
    }

    next()
  }
}
