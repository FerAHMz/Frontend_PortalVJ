<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="tasks-container">
      <!-- Header responsive -->
      <div class="header-section">
        <h1 class="page-title">Archivos de Planificación</h1>
        <div class="course-subtitle" v-if="planificationData">
          <span class="course-info">{{ planificationData.trimestre }}</span>
          <span class="course-divider">|</span>
          <span class="course-info">Ciclo: {{ planificationData.ciclo_escolar }}</span>
          <span class="course-divider">|</span>
          <span class="course-info">Estado: {{ planificationData.estado }}</span>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Lista de archivos -->
      <div class="files-section">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Cargando archivos...</p>
        </div>
        <div v-else-if="files.length === 0" class="no-files">
          <div class="no-files-icon">📁</div>
          <h3>No hay archivos adjuntos</h3>
          <p>Esta planificación no tiene archivos adjuntos.</p>
        </div>
        <div v-else>
          <h2 class="section-title">Archivos Adjuntos</h2>
          
          <!-- Vista de tabla para desktop -->
          <div class="table-container desktop-view">
            <table class="files-table">
              <thead>
                <tr>
                  <th>Nombre del Archivo</th>
                  <th>Tipo</th>
                  <th>Tamaño</th>
                  <th>Subido el</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in files" :key="file.id">
                  <td>
                    <div class="file-info">
                      <div class="file-icon">{{ getFileIcon(file.mime_type) }}</div>
                      <div class="file-details">
                        <div class="file-name">{{ file.file_name }}</div>
                        <div class="file-original-name">{{ file.original_name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="file-type" :class="getFileType(file.mime_type).toLowerCase()">
                      {{ getFileType(file.mime_type) }}
                    </div>
                  </td>
                  <td>
                    <div class="file-size">{{ formatFileSize(file.file_size) }}</div>
                  </td>
                  <td>
                    <div class="file-date">{{ formatDate(file.uploaded_at) }}</div>
                  </td>
                  <td>
                    <button @click="downloadFile(file)" class="download-btn">
                      <span>⬇️</span>
                      Descargar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista de tarjetas para móvil -->
          <div class="cards-container mobile-view">
            <div v-for="file in files" :key="file.id" class="file-card">
              <div class="card-header">
                <div class="card-file-icon">{{ getFileIcon(file.mime_type) }}</div>
                <div class="card-file-info">
                  <h3 class="card-file-name">{{ file.file_name }}</h3>
                  <p class="card-original-name">{{ file.original_name }}</p>
                </div>
              </div>
              <div class="card-body">
                <div class="card-field">
                  <label>Tipo:</label>
                  <p>
                    <span class="file-type" :class="getFileType(file.mime_type).toLowerCase()">
                      {{ getFileType(file.mime_type) }}
                    </span>
                  </p>
                </div>
                <div class="card-info-row">
                  <div class="card-field">
                    <label>Tamaño:</label>
                    <p>{{ formatFileSize(file.file_size) }}</p>
                  </div>
                  <div class="card-field">
                    <label>Subido el:</label>
                    <p>{{ formatDate(file.uploaded_at) }}</p>
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <button @click="downloadFile(file)" class="download-btn mobile-btn">
                  <span>⬇️</span>
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
            <p>No hay tareas planificadas.</p>
          </div>
        </div>

        <!-- Vista desktop: Tabla -->
        <div v-else class="table-container desktop-view">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tema</th>
                <th>Puntaje</th>
                <th v-if="planificacion.estado === 'en revision'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tarea, index) in tareas" :key="tarea.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <input 
                    v-if="taskBeingEdited?.id === tarea.id" 
                    v-model="inlineEditTema" 
                    class="inline-edit-input" 
                    @keyup.enter="handleSubmit"
                    @keyup.escape="cancelEdit"
                  />
                  <span v-else>{{ tarea.tema_tarea }}</span>
                </td>
                <td>
                  <input 
                    v-if="taskBeingEdited?.id === tarea.id" 
                    v-model.number="inlineEditPuntos" 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    class="inline-edit-input" 
                    @keyup.enter="handleSubmit"
                    @keyup.escape="cancelEdit"
                  />
                  <span v-else>{{ tarea.puntos_tarea }}</span>
                </td>
                <td v-if="planificacion.estado === 'en revision'" class="actions">
                  <div v-if="taskBeingEdited?.id === tarea.id" class="inline-actions">
                    <button @click="handleSubmit" class="action-btn create">
                      <Check class="action-icon" />
                    </button>
                    <button @click="cancelEdit" class="action-btn cancel">
                      <X class="action-icon" />
                    </button>
                  </div>
                  <div v-else class="normal-actions">
                    <button @click="editTask(tarea)" class="action-btn edit" title="Editar">
                      <Edit class="action-icon" />
                    </button>
                    <button @click="deleteTask(tarea.id)" class="action-btn delete" title="Eliminar">
                      <Trash class="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista móvil: Tarjetas -->
        <div v-if="tareas.length" class="mobile-view">
          <div v-for="(tarea, index) in tareas" :key="tarea.id" class="task-card">
            <div class="card-header">
              <div class="task-number">#{{ index + 1 }}</div>
              <div v-if="planificacion.estado === 'en revision'" class="card-actions-header">
                <div v-if="taskBeingEdited?.id === tarea.id" class="inline-actions">
                  <button @click="handleSubmit" class="action-btn create" title="Guardar">
                    <Check class="action-icon" />
                  </button>
                  <button @click="cancelEdit" class="action-btn cancel" title="Cancelar">
                    <X class="action-icon" />
                  </button>
                </div>
                <div v-else class="normal-actions">
                  <button @click="editTask(tarea)" class="action-btn edit" title="Editar">
                    <Edit class="action-icon" />
                  </button>
                  <button @click="deleteTask(tarea.id)" class="action-btn delete" title="Eliminar">
                    <Trash class="action-icon" />
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card-content">
              <div class="field-group">
                <label class="field-label">Tema:</label>
                <div class="field-value">
                  <input 
                    v-if="taskBeingEdited?.id === tarea.id" 
                    v-model="inlineEditTema" 
                    class="inline-edit-input mobile" 
                    @keyup.enter="handleSubmit"
                    @keyup.escape="cancelEdit"
                  />
                  <span v-else>{{ tarea.tema_tarea }}</span>
                </div>
              </div>
              
              <div class="field-group">
                <label class="field-label">Puntaje:</label>
                <div class="field-value">
                  <input 
                    v-if="taskBeingEdited?.id === tarea.id" 
                    v-model.number="inlineEditPuntos" 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    class="inline-edit-input mobile" 
                    @keyup.enter="handleSubmit"
                    @keyup.escape="cancelEdit"
                  />
                  <span v-else>{{ tarea.puntos_tarea }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Observaciones del director -->
      <div class="observations-section">
        <h2 class="observations-title">
          <MessageSquare class="observations-icon" />
          Observaciones del director
        </h2>

        <div v-if="observaciones.length" class="observations-container">
          <div
            v-for="obs in observaciones"
            :key="obs.id"
            class="observation-card"
          >
            <div class="obs-content">
              <p class="obs-text">{{ obs.observaciones }}</p>
              <p class="obs-meta">
                <CalendarDays class="obs-date-icon" />
                {{ formatDate(obs.fecha) }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="no-observations">

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import {
  User,
  ClipboardList,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const planificationData = ref(null)
const files = ref([])
const loading = ref(true)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('video')) return '🎥'
  if (mimeType.includes('audio')) return '🎵'
  return '📎'
}

const getFileType = (mimeType) => {
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word'
  if (mimeType.includes('image')) return 'Imagen'
  if (mimeType.includes('video')) return 'Video'
  if (mimeType.includes('audio')) return 'Audio'
  return 'Archivo'
}

const fetchPlanificationFiles = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    const planificationId = route.params.planId
    const response = await fetch(`http://localhost:3000/api/teacher/planning/${planificationId}/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      files.value = data.files || []
    } else {
      throw new Error(data.message || 'Error al cargar archivos')
    }
  } catch (error) {
    console.error('Error fetching planification files:', error)
    files.value = []
  } finally {
    loading.value = false
  }
}

const fetchPlanificationData = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const planificationId = route.params.planId
    const courseId = route.params.courseId
    
    const response = await fetch(`http://localhost:3000/api/teacher/courses/${courseId}/planning/${planificationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      planificationData.value = data
    }
  } catch (error) {
    console.error('Error fetching planification data:', error)
  }
}

const downloadFile = async (file) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('No se encontró token de autenticación')
      return
    }

    const response = await fetch(`http://localhost:3000/api/teacher/planning/files/${file.id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al descargar el archivo')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = file.original_name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading file:', error)
    alert('Error al descargar el archivo: ' + error.message)
  }
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

onMounted(() => {
  fetchPlanificationData()
  fetchPlanificationFiles()
})
</script>
const planId = route.params.planId
const isEditing = ref(false)
const taskBeingEdited = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const fetchPlanningData = async () => {
  try {
    planificacion.value = await planningService.fetchById(courseId, planId)
    tareas.value = await planningService.fetchTasks(courseId, planId)
    observaciones.value = await planningService.fetchObservations(courseId, planId)
    console.log('Observaciones:', observaciones.value) 
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo cargar la planificación')
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    if (isEditing.value && taskBeingEdited.value) {
      // EDITAR usando variables inline
      if (!inlineEditTema.value || inlineEditPuntos.value === null) return
      await planningService.updateTask(courseId, planId, taskBeingEdited.value.id, {
        tema_tarea: inlineEditTema.value,
        puntos_tarea: inlineEditPuntos.value
      })
      showNotification('success', 'Éxito', 'Tarea actualizada correctamente')
      // Reset inline edit
      isEditing.value = false
      taskBeingEdited.value = null
      inlineEditTema.value = ''
      inlineEditPuntos.value = null
    } else {
      // CREAR NUEVA usando variables del formulario
      if (!tema.value || puntos.value === null) return
      await planningService.createTask(courseId, planId, {
        tema_tarea: tema.value,
        puntos_tarea: puntos.value
      })
      showNotification('success', 'Éxito', 'Tarea agregada correctamente')
      // Reset form
      tema.value = ''
      puntos.value = null
    }
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo guardar la tarea')
    console.error(error)
  }
}

const deleteTask = async (taskId) => {
  const confirmed = await confirmDialog.value.show({
    title: 'Eliminar tarea',
    message: '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar'
  })
  
  if (!confirmed) return
  
  try {
    await planningService.deleteTask(courseId, planId, taskId)
    showNotification('success', 'Éxito', 'Tarea eliminada correctamente')
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la tarea')
    console.error(error)
  }
}

// Variables separadas para edición inline
const inlineEditTema = ref('')
const inlineEditPuntos = ref(null)

const editTask = (tarea) => {
  // SOLO preparar para edición inline, NO llenar el formulario superior
  taskBeingEdited.value = tarea
  isEditing.value = true
  // Llenar los valores temporales para la edición inline (NO afecta el formulario)
  inlineEditTema.value = tarea.tema_tarea
  inlineEditPuntos.value = tarea.puntos_tarea
}

const cancelEdit = () => {
  isEditing.value = false
  taskBeingEdited.value = null
  // Limpiar solo las variables de edición inline
  inlineEditTema.value = ''
  inlineEditPuntos.value = null
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
  fetchPlanningData()
  console.log('Curso:', courseId)
  console.log('Planificación:', planId)
})
</script>

<style scoped>
/* Layout base */
.layout {
  display: flex;
  min-height: 100vh;
}

.planning-tasks-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  max-width: 100%;
  box-sizing: border-box;
}

/* Header section */
.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.course-subtitle {
  margin-bottom: 1.5rem;
}

.subtitle-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.subtitle-item {
  white-space: nowrap;
}

.divider {
  color: #ccc;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Formulario */
.crud-actions {
  margin-bottom: 2rem;
}

.form-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1b9963;
  box-shadow: 0 0 0 2px rgba(27, 153, 99, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

/* Sección de tareas */
.tasks-section {
  margin-bottom: 2rem;
}

/* Mensaje sin tareas */
.no-tasks {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-tasks-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-tasks-icon {
  width: 48px;
  height: 48px;
  color: #ccc;
}

.no-tasks p {
  color: #777;
  font-style: italic;
  margin: 0;
}

/* Vista desktop - Tabla */
.desktop-view {
  display: block;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  white-space: nowrap;
}

/* Vista móvil - Tarjetas */
.mobile-view {
  display: none;
  gap: 1rem;
  flex-direction: column;
}

.task-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.task-number {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.card-actions-header {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  padding: 1rem;
}

.field-group {
  margin-bottom: 1rem;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.field-value {
  color: #333;
  font-size: 1rem;
}

/* Botones de acción */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  text-decoration: none;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
  padding: 0.75rem 1.5rem;
}

.action-btn.create:hover {
  background-color: #158a50;
  transform: translateY(-1px);
}

.action-btn.edit {
  background-color: #fd7e14;
  color: white;
  padding: 0.5rem;
}

.action-btn.edit:hover {
  background-color: #e96b00;
}

.action-btn.delete {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem;
}

.action-btn.delete:hover {
  background-color: #bb2d3b;
}

.action-btn.cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.action-btn.cancel:hover {
  background-color: #e6e6e6;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Acciones inline y normales */
.inline-actions {
  display: flex;
  gap: 0.25rem;
}

.normal-actions {
  display: flex;
  gap: 0.25rem;
}

/* Edición inline */
.inline-edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #1b9963;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #f8fff8;
  transition: all 0.3s ease;
}

.inline-edit-input:focus {
  outline: none;
  border-color: #158a50;
  background-color: #fff;
}

.inline-edit-input.mobile {
  font-size: 1rem;
  padding: 0.75rem;
}

/* Badges */
.badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  line-height: 1;
  font-family: inherit;
}

.badge.en-revision {
  background-color: #ffc107;
  color: #856404;
}

.badge.aceptada {
  background-color: #1b9963;
  color: white;
}

.badge.rechazada {
  background-color: #d9534f;
  color: white;
}

/* Sección de observaciones */
.observations-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.observations-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0f0f0;
}

.observations-icon {
  width: 24px;
  height: 24px;
  color: #1b9963;
}

.observations-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.observation-card {
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid #1b9963;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.observation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.obs-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.obs-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin: 0;
  font-weight: 500;
}

.obs-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.obs-date-icon {
  width: 14px;
  height: 14px;
}

.no-observations {
  text-align: center;
  padding: 2rem;
  color: #777;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-obs-icon {
  width: 40px;
  height: 40px;
  color: #ccc;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .planning-tasks-container {
    padding: 1rem;
    margin-left: 0;
  }

  .page-title {
    font-size: 1.5rem;
    margin-top: 5.25rem;
  }

  .subtitle-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .divider {
    display: none;
  }

  .form-container {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    min-width: auto;
  }

  .action-btn.create .btn-text {
    display: none;
  }

  .action-btn.create {
    padding: 0.75rem;
    justify-content: center;
  }

  /* Ocultar tabla desktop y mostrar tarjetas móvil */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: flex;
  }

  .observations-title {
    font-size: 1.25rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .observations-section {
    padding: 1rem;
  }
}

@media screen and (max-width: 480px) {
  .planning-tasks-container {
    padding: 0.75rem;
  }

  .form-container {
    padding: 0.75rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .card-actions-header {
    align-self: flex-end;
  }

  .field-group {
    margin-bottom: 1.25rem;
  }

  .field-label {
    font-size: 0.85rem;
  }

  .observation-card {
    padding: 1rem;
  }

  .obs-text {
    font-size: 0.95rem;
  }
}

/* Mejoras para tablet */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .planning-tasks-container {
    padding: 1.5rem;
  }

  .form-row {
    gap: 1rem;
  }

  .data-table th, .data-table td {
    padding: 0.75rem;
  }
}
</style>