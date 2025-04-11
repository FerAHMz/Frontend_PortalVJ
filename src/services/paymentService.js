export const uploadPaymentFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    console.log('Token:', token) // Debug log
    
    if (!token) {
        throw new Error('No está autenticado')
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/payments/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })
      
      console.log('Response status:', response.status) // Debug log
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.errors?.join('\n') || data.error || 'Error al procesar el archivo')
      }
  
      return data
    } catch (error) {
      console.error('Upload error:', error) // Debug log
      if (error.name === 'TypeError') {
        throw new Error('Error de conexión con el servidor')
      }
      throw error
    }
}