import { ref } from 'vue'
import { parentService } from '@/services/parentService.js'

export function useSolvencyCheck() {
  const solvencyData = ref(null)
  const isCheckingSolvency = ref(false)
  const solvencyError = ref(null)

  const checkSolvency = async (studentId) => {
    if (!studentId) return false

    isCheckingSolvency.value = true
    solvencyError.value = null

    try {
      const response = await parentService.checkPaymentSolvency(studentId)
      
      if (response.success) {
        solvencyData.value = response.solvency
        return response.solvency.isSolvent
      } else {
        solvencyError.value = response.error || 'Error verificando solvencia'
        // En caso de error, permitir acceso por defecto
        solvencyData.value = { isSolvent: true }
        return true
      }
    } catch (error) {
      console.error('Error checking solvency:', error)
      solvencyError.value = 'Error de conexión verificando solvencia'
      // En caso de error, permitir acceso por defecto
      solvencyData.value = { isSolvent: true }
      return true
    } finally {
      isCheckingSolvency.value = false
    }
  }

  const resetSolvency = () => {
    solvencyData.value = null
    solvencyError.value = null
    isCheckingSolvency.value = false
  }

  const getSolvencyPercentage = () => {
    return solvencyData.value?.solvencyPercentage || 0
  }

  const getPendingMonths = () => {
    return solvencyData.value?.pendingMonthsList || []
  }

  const getSolvencyMessage = () => {
    if (!solvencyData.value) return ''
    
    if (solvencyData.value.isSolvent) {
      return 'Estudiante al día con los pagos'
    } else {
      const pendingCount = solvencyData.value.pendingMonths || 0
      return `${pendingCount} mes${pendingCount !== 1 ? 'es' : ''} pendiente${pendingCount !== 1 ? 's' : ''} de pago`
    }
  }

  return {
    solvencyData,
    isCheckingSolvency,
    solvencyError,
    checkSolvency,
    resetSolvency,
    getSolvencyPercentage,
    getPendingMonths,
    getSolvencyMessage
  }
}
