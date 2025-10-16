// Plugin global para funciones de descarga de PDF
export default {
  install(app) {
    // Función global para descargar instructivo
    app.config.globalProperties.$downloadInstructivo = () => {
      try {
        const link = document.createElement('a')
        link.href = '/instructivo-docentes.pdf'
        link.download = 'Instructivo-Docentes-PortalVJ.pdf'
        link.target = '_blank'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        console.log('Descarga del instructivo iniciada')
      } catch (error) {
        console.error('Error al descargar el instructivo:', error)
        alert('No se pudo descargar el instructivo. Por favor, intente nuevamente.')
      }
    }

    // Función global genérica para cualquier PDF
    app.config.globalProperties.$downloadPDF = (pdfPath, downloadName) => {
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
  }
}