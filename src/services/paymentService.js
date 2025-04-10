export const uploadPaymentFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
  
    try {
      const response = await fetch('http://localhost:3000/api/payments/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Error al procesar el archivo')
      }
  
      return await response.json()
    } catch (error) {
      throw new Error('Error al subir el archivo: ' + error.message)
    }
  }