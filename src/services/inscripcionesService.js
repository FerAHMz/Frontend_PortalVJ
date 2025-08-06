import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants.js'
import { getAuthToken } from '@/utils/auth.js'

// Configurar interceptor para incluir token en todas las peticiones
const createAuthenticatedRequest = () => {
  const token = getAuthToken()
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

export const inscripcionesService = {
  // Obtener todas las inscripciones
  async getInscripciones() {
    try {
      const response = await axios.get(`${API_BASE_URL}/superuser/inscripciones`, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al obtener inscripciones:', error)
      throw error
    }
  },

  // Obtener una inscripción por ID
  async getInscripcionById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/superuser/inscripciones/${id}`, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al obtener inscripción:', error)
      throw error
    }
  },

  // Crear nueva inscripción
  async createInscripcion(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/superuser/inscripciones`, data, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al crear inscripción:', error)
      throw error
    }
  },

  // Actualizar inscripción existente
  async updateInscripcion(id, data) {
    try {
      const response = await axios.put(`${API_BASE_URL}/superuser/inscripciones/${id}`, data, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al actualizar inscripción:', error)
      throw error
    }
  },

  // Eliminar inscripción (soft delete)
  async deleteInscripcion(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/superuser/inscripciones/${id}`, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al eliminar inscripción:', error)
      throw error
    }
  },

  // Convertir inscripción a estudiante activo
  async convertirAEstudiante(id) {
    try {
      const response = await axios.post(`${API_BASE_URL}/superuser/inscripciones/${id}/convertir-estudiante`, {}, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al convertir estudiante:', error)
      throw error
    }
  },

  // Obtener grados y secciones disponibles
  async getGradosYSecciones() {
    try {
      const response = await axios.get(`${API_BASE_URL}/superuser/grados-secciones`, createAuthenticatedRequest())
      return response.data
    } catch (error) {
      console.error('Error al obtener grados y secciones:', error)
      throw error
    }
  },

  // Subir archivo Excel para carga masiva
  async uploadExcel(formData) {
    try {
      const token = getAuthToken()
      const response = await axios.post(`${API_BASE_URL}/superuser/inscripciones/upload-excel`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        // Configurar timeout más largo para archivos grandes
        timeout: 120000 // 2 minutos
      })
      return response.data
    } catch (error) {
      console.error('Error al subir archivo Excel:', error)
      throw error
    }
  },

  // Obtener estadísticas de inscripciones
  async getEstadisticas() {
    try {
      const inscripciones = await this.getInscripciones()
      
      const stats = {
        total: inscripciones.data.length,
        inscritos: inscripciones.data.filter(i => i.estado_inscripcion === 'inscrito').length,
        activos: inscripciones.data.filter(i => i.estado_inscripcion === 'estudiante_activo').length,
        eliminados: inscripciones.data.filter(i => i.estado_inscripcion === 'eliminado').length
      }

      // Estadísticas por grado
      const porGrado = {}
      inscripciones.data.forEach(inscripcion => {
        const grado = inscripcion.grado_seccion_display || 'Sin asignar'
        if (!porGrado[grado]) {
          porGrado[grado] = { total: 0, inscritos: 0, activos: 0 }
        }
        porGrado[grado].total++
        if (inscripcion.estado_inscripcion === 'inscrito') {
          porGrado[grado].inscritos++
        } else if (inscripcion.estado_inscripcion === 'estudiante_activo') {
          porGrado[grado].activos++
        }
      })

      return {
        success: true,
        data: {
          general: stats,
          porGrado
        }
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  },

  // Buscar inscripciones con filtros
  async buscarInscripciones(filtros = {}) {
    try {
      let url = '/superuser/inscripciones'
      const params = new URLSearchParams()

      if (filtros.busqueda) {
        params.append('busqueda', filtros.busqueda)
      }
      if (filtros.estado) {
        params.append('estado', filtros.estado)
      }
      if (filtros.grado) {
        params.append('grado', filtros.grado)
      }
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde)
      }
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error al buscar inscripciones:', error)
      throw error
    }
  },

  // Exportar inscripciones a CSV
  async exportarCSV(filtros = {}) {
    try {
      const inscripciones = await this.buscarInscripciones(filtros)
      
      // Preparar datos para CSV
      const csvData = inscripciones.data.map(inscripcion => ({
        'ID': inscripcion.id_inscripcion,
        'Carnet': inscripcion.carnet,
        'Nombres': inscripcion.nombres,
        'Apellidos': inscripcion.apellidos,
        'Fecha Nacimiento': inscripcion.fecha_nacimiento,
        'Grado - Sección': inscripcion.grado_seccion_display || '',
        'SIRE': inscripcion.sire || '',
        'Correo Padres': inscripcion.correo_padres || '',
        'Estado': this.getStatusText(inscripcion.estado_inscripcion),
        'Fecha Inscripción': new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-ES'),
        'Última Actualización': new Date(inscripcion.fecha_actualizacion).toLocaleDateString('es-ES')
      }))

      // Convertir a CSV
      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escapar valores que contengan comas o comillas
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value
          }).join(',')
        )
      ].join('\n')

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `inscripciones_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return {
        success: true,
        message: 'Archivo CSV descargado exitosamente',
        registros: csvData.length
      }
    } catch (error) {
      console.error('Error al exportar CSV:', error)
      throw error
    }
  },

  // Obtener resumen de un grado específico
  async getResumenGrado(idGradoSeccion) {
    try {
      const inscripciones = await this.getInscripciones()
      
      const inscripcionesGrado = inscripciones.data.filter(
        i => i.id_grado_seccion === idGradoSeccion
      )

      const resumen = {
        total: inscripcionesGrado.length,
        inscritos: inscripcionesGrado.filter(i => i.estado_inscripcion === 'inscrito').length,
        activos: inscripcionesGrado.filter(i => i.estado_inscripcion === 'estudiante_activo').length,
        conSire: inscripcionesGrado.filter(i => i.sire).length,
        conCorreoPadres: inscripcionesGrado.filter(i => i.correo_padres).length
      }

      return {
        success: true,
        data: resumen
      }
    } catch (error) {
      console.error('Error al obtener resumen de grado:', error)
      throw error
    }
  },

  // Activar múltiples estudiantes
  async activarMultiplesEstudiantes(inscripcionIds) {
    try {
      const resultados = {
        exitosos: [],
        errores: []
      }

      // Procesar cada inscripción individualmente
      for (const id of inscripcionIds) {
        try {
          await this.convertirAEstudiante(id)
          resultados.exitosos.push(id)
        } catch (error) {
          resultados.errores.push({
            id,
            error: error.response?.data?.message || 'Error desconocido'
          })
        }
      }

      return {
        success: true,
        data: resultados
      }
    } catch (error) {
      console.error('Error al activar múltiples estudiantes:', error)
      throw error
    }
  },

  // Validar datos antes de crear inscripción
  validateInscripcionData(data) {
    const errors = {}

    // Validar carnet
    if (!data.carnet || data.carnet.trim().length < 3) {
      errors.carnet = 'El carnet debe tener al menos 3 caracteres'
    }

    // Validar nombres
    if (!data.nombres || data.nombres.trim().length < 2) {
      errors.nombres = 'Los nombres deben tener al menos 2 caracteres'
    }

    // Validar apellidos
    if (!data.apellidos || data.apellidos.trim().length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }

    // Validar fecha de nacimiento
    if (!data.fecha_nacimiento) {
      errors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
    } else {
      const birthDate = new Date(data.fecha_nacimiento)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      if (age < 5 || age > 25) {
        errors.fecha_nacimiento = 'La edad debe estar entre 5 y 25 años'
      }
    }

    // Validar grado y sección
    if (!data.id_grado_seccion) {
      errors.id_grado_seccion = 'Debe seleccionar un grado y sección'
    }

    // Validar correo (si se proporciona)
    if (data.correo_padres && data.correo_padres.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.correo_padres)) {
        errors.correo_padres = 'El formato del correo no es válido'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Utility function para obtener texto de estado
  getStatusText(status) {
    const statusMap = {
      'inscrito': 'Inscrito',
      'estudiante_activo': 'Estudiante Activo',
      'eliminado': 'Eliminado'
    }
    return statusMap[status] || status
  }
}

export default inscripcionesService
