import axios from 'axios'

const API_URL = 'http://localhost:3000/api/teacher';
const API_URL_D = 'http://localhost:3000/api/director';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No está autenticado')
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
}

const planningService = {
  // 📌 Obtener todas las planificaciones de un curso
  async fetchByCourse(courseId) {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/planning/`,
      getAuthHeaders()
    )
    return response.data
  },

  // 📌 Obtener una planificación específica por ID
  async fetchById(courseId, planId) {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/planning/${planId}`,
      getAuthHeaders()
    )
    return response.data
  },

  // ✅ Crear una planificación
  async create(courseId, { mes, ciclo_escolar }) {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/planning/`,
      { mes, ciclo_escolar },
      getAuthHeaders()
    )
    return response.data
  },

  // 🗑️ Eliminar una planificación
  async delete(courseId, planId) {
    const response = await axios.delete(
      `${API_URL}/courses/${courseId}/planning/${planId}`,
      getAuthHeaders()
    )
    return response.data
  },

  // ✏️ Actualizar una planificación
  async update(courseId, id, { mes, ciclo_escolar }) {
    const response = await axios.put(`${API_URL}/courses/${courseId}/planning/${id}`, {
      mes,
      ciclo_escolar
    }, getAuthHeaders())
    return response.data
  },

  // ✅ TAREAS

  // 🔎 Obtener tareas de una planificación
  async fetchTasks(courseId, planId) {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/planning/${planId}/tasks`,
      getAuthHeaders()
    )
    return response.data
  },

  // ➕ Crear tarea
  async createTask(courseId, planId, { tema_tarea, puntos_tarea }) {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/planning/${planId}/tasks`,
      { tema_tarea, puntos_tarea },
      getAuthHeaders()
    )
    return response.data
  },

  // ✏️ Actualizar tarea
  async updateTask(courseId, planId, taskId, { tema_tarea, puntos_tarea }) {
    const response = await axios.put(
      `${API_URL}/courses/${courseId}/planning/${planId}/tasks/${taskId}`,
      { tema_tarea, puntos_tarea },
      getAuthHeaders()
    )
    return response.data
  },

  // 🗑️ Eliminar tarea
  async deleteTask(courseId, planId, taskId) {
    const response = await axios.delete(
      `${API_URL}/courses/${courseId}/planning/${planId}/tasks/${taskId}`,
      getAuthHeaders()
    )
    return response.data
  },

  // ✅ OBSERVACIONES

  // 🔎 Obtener observaciones de una planificación
  async fetchObservations(courseId, planId) {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/planning/${planId}/observations`,
      getAuthHeaders()
    )
    return response.data
  },

  // ➕ Crear observación
  async createObservation(courseId, planId, { id_director, observaciones }) {
    const response = await axios.post(
      `${API_URL_D}/courses/${courseId}/planning/${planId}/observations`,
      { id_director, observaciones },
      getAuthHeaders()
    )
    return response.data
  },

  // ✏️ Actualizar observación
  async updateObservation(courseId, planId, obsId, { observaciones }) {
    const response = await axios.put(
      `${API_URL_D}/courses/${courseId}/planning/${planId}/observations/${obsId}`,
      { observaciones },
      getAuthHeaders()
    )
    return response.data
  },

  // 🗑️ Eliminar observación
  async deleteObservation(courseId, planId, obsId) {
    const response = await axios.delete(
      `${API_URL_D}/courses/${courseId}/planning/${planId}/observations/${obsId}`,
      getAuthHeaders()
    )
    return response.data
  },

  async updateEstado(courseId, planId, data) {
    const response = await axios.put(
      `${API_URL_D}/courses/${courseId}/planning/${planId}/estado`,
      data,
      getAuthHeaders()
    )
    return response.data
  }
}

export default planningService
