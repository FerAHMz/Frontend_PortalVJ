/**
 * Utilitario para manejar descargas de archivos PDF
 */

/**
 * Descarga el PDF del instructivo para docentes
 */
export const downloadInstructivePDF = () => {
  try {
    // Crear el enlace para descargar el PDF
    const link = document.createElement('a')
    link.href = '/instructivo-docentes.pdf' // Ruta del PDF en la carpeta public
    link.download = 'Instructivo-Docentes-PortalVJ.pdf'
    link.target = '_blank'
    
    // Agregar el enlace al DOM temporalmente y hacer clic
    document.body.appendChild(link)
    link.click()
    
    // Remover el enlace del DOM
    document.body.removeChild(link)
    
    console.log('Descarga del instructivo iniciada')
  } catch (error) {
    console.error('Error al descargar el instructivo:', error)
    alert('No se pudo descargar el instructivo. Por favor, intente nuevamente.')
  }
}

/**
 * Función genérica para descargar cualquier PDF
 * @param {string} pdfPath - Ruta del PDF
 * @param {string} downloadName - Nombre para la descarga
 */
export const downloadPDF = (pdfPath, downloadName) => {
  try {
    const link = document.createElement('a')
    link.href = pdfPath
    link.download = downloadName
    link.target = '_blank'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log(`Descarga iniciada: ${downloadName}`)
  } catch (error) {
    console.error('Error al descargar el archivo:', error)
    alert('No se pudo descargar el archivo. Por favor, intente nuevamente.')
  }
}