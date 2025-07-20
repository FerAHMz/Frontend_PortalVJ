import { ref, reactive } from 'vue'

const notifications = ref([])

export const useNotifications = () => {
  const showNotification = (type, title, message, options = {}) => {
    const notification = reactive({
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      show: true,
      autoClose: options.autoClose !== false, // default true
      autoCloseDelay: options.autoCloseDelay || 3000,
      ...options
    })

    console.log('Adding notification:', notification)
    notifications.value.push(notification)
    console.log('Total notifications:', notifications.value.length)

    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.autoCloseDelay)
    }

    return notification.id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value[index].show = false
      setTimeout(() => {
        notifications.value.splice(index, 1)
      }, 300) // Allow time for exit animation
    }
  }

  const clearAllNotifications = () => {
    notifications.value.forEach(n => n.show = false)
    setTimeout(() => {
      notifications.value.splice(0)
    }, 300)
  }

  // Convenience methods
  const showSuccess = (title, message, options = {}) => {
    return showNotification('success', title, message, options)
  }

  const showError = (title, message, options = {}) => {
    return showNotification('error', title, message, { autoClose: false, ...options })
  }

  const showWarning = (title, message, options = {}) => {
    return showNotification('warning', title, message, options)
  }

  const showInfo = (title, message, options = {}) => {
    return showNotification('info', title, message, options)
  }

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
