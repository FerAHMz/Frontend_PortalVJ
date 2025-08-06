import { ref } from 'vue'

export function useConfirmation() {
  const showConfirmation = ref(false)
  const confirmationTitle = ref('')
  const confirmationMessage = ref('')
  const confirmationConfirmText = ref('Confirmar')
  const confirmationCancelText = ref('Cancelar')
  const confirmationType = ref('default') // 'default', 'danger', 'warning', 'success'
  
  let confirmCallback = null
  let cancelCallback = null

  const showConfirmationDialog = (options) => {
    confirmationTitle.value = options.title || 'Confirmación'
    confirmationMessage.value = options.message || '¿Estás seguro?'
    confirmationConfirmText.value = options.confirmText || 'Confirmar'
    confirmationCancelText.value = options.cancelText || 'Cancelar'
    confirmationType.value = options.type || 'default'
    
    confirmCallback = options.onConfirm || null
    cancelCallback = options.onCancel || null
    
    showConfirmation.value = true
  }

  const handleConfirmation = async () => {
    if (confirmCallback) {
      try {
        await confirmCallback()
      } catch (error) {
        console.error('Error en callback de confirmación:', error)
      }
    }
    closeConfirmation()
  }

  const closeConfirmation = () => {
    if (cancelCallback) {
      try {
        cancelCallback()
      } catch (error) {
        console.error('Error en callback de cancelación:', error)
      }
    }
    
    showConfirmation.value = false
    confirmCallback = null
    cancelCallback = null
  }

  return {
    showConfirmation,
    confirmationTitle,
    confirmationMessage,
    confirmationConfirmText,
    confirmationCancelText,
    confirmationType,
    showConfirmationDialog,
    handleConfirmation,
    closeConfirmation
  }
}
