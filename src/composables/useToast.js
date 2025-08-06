import { ref } from 'vue'

export function useToast() {
  const toast = ref({
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 5000
  })

  const showToast = (message, type = 'info', duration = 5000) => {
    toast.value = {
      show: true,
      message,
      type,
      duration
    }

    // Auto-hide después del tiempo especificado
    setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  const hideToast = () => {
    toast.value.show = false
  }

  return {
    toast,
    showToast,
    hideToast
  }
}
