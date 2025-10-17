/**
 * Composable para manejar la descarga del instructivo PDF para Profesores
 * Reutilizable en todas las vistas de teacher
 */

/**
 * Función para descargar el PDF del instructivo para Profesores
 * Exportación directa para facilitar la importación
 */
export const downloadTeacherInstructivePDF = () => {
  try {
    // Crear el enlace para descargar el PDF
    const link = document.createElement('a')
    link.href = '/instructivo-teacher.pdf' // Ruta del PDF en la carpeta public
    link.download = 'Instructivo-Profesor-PortalVJ.pdf'
    link.target = '_blank'
    
    // Agregar el enlace al DOM temporalmente y hacer clic
    document.body.appendChild(link)
    link.click()
    
    // Remover el enlace del DOM
    document.body.removeChild(link)
    
    console.log('Descarga del instructivo Profesor iniciada')
  } catch (error) {
    console.error('Error al descargar el instructivo Profesor:', error)
    alert('No se pudo descargar el instructivo. Por favor, intente nuevamente.')
  }
}

/**
 * Composable que retorna la función de descarga
 * Para uso con Composition API si se prefiere el patrón de composable
 */
export function useTeacherInstructivePDF() {
  return {
    downloadTeacherInstructivePDF
  }
}