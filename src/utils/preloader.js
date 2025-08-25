// Preloader para componentes críticos
export function preloadCriticalComponents() {
  // Precargar componentes que se usan frecuentemente
  const criticalComponents = [
    () => import('@/components/Sidebar.vue'),
    () => import('@/components/dialogs/NotificationDialog.vue'),
    () => import('@/views/teacher/TeacherCourses.vue')
  ]

  // Precargar después de que la página principal termine de cargar
  if (document.readyState === 'complete') {
    criticalComponents.forEach(loader => {
      requestIdleCallback(() => {
        loader().catch(() => {
          // Ignorar errores de precarga
        })
      })
    })
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        criticalComponents.forEach(loader => {
          requestIdleCallback(() => {
            loader().catch(() => {
              // Ignorar errores de precarga
            })
          })
        })
      }, 1000)
    })
  }
}

// Función para detectar conexiones lentas
export function isSlowConnection() {
  if ('connection' in navigator) {
    const connection = navigator.connection
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData === true
  }
  return false
}
