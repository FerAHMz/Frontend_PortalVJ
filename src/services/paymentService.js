export const uploadPaymentFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    
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
      
      const data = await response.json()
      
      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          throw new Error(data.errors.join('\n'))
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          throw new Error('Error al procesar el archivo')
        }
      }
  
      return data
    } catch (error) {
      console.error('Upload error:', error)
      if (error.name === 'TypeError') {
        throw new Error('Error de conexión con el servidor')
      }
      throw error
    }
}