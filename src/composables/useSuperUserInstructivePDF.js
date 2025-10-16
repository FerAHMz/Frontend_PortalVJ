/**
 * Composable para manejar la descarga del instructivo PDF para Super Usuarios
 * Reutilizable en todas las vistas de superuser
 */

/**
 * Función para descargar el PDF del instructivo para Super Usuarios
 * Exportación directa para facilitar la importación
 */
export const downloadSuperUserInstructivePDF = () => {
  try {
    // Crear el enlace para descargar el PDF
    const link = document.createElement('a')
    link.href = '/instructivo-superuser.pdf' // Ruta del PDF en la carpeta public
    link.download = 'Instructivo-SuperUser-PortalVJ.pdf'
    link.target = '_blank'
    
    // Agregar el enlace al DOM temporalmente y hacer clic
    document.body.appendChild(link)
    link.click()
    
    // Remover el enlace del DOM
    document.body.removeChild(link)
    
    console.log('Descarga del instructivo SuperUser iniciada')
  } catch (error) {
    console.error('Error al descargar el instructivo SuperUser:', error)
    alert('No se pudo descargar el instructivo. Por favor, intente nuevamente.')
  }
}

/**
 * Composable que retorna la función de descarga
 * Para uso con Composition API si se prefiere el patrón de composable
 */
export function useSuperUserInstructivePDF() {
  return {
    downloadSuperUserInstructivePDF
  }
}