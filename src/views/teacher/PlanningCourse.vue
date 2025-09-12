<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <div class="page-header">
        <ArrowBack 
          :to="`/teacher/courses/${route.params.courseId}`"
          :show-text="true" 
          text="Volver al Curso"
          @before-back="saveViewState"
        />
        <div class="header-content">
          <h1 class="page-title" style="opacity: 1; transform: none;">
            Planificación del Curso
          </h1>
          <div class="course-subtitle" style="opacity: 1; transform: none;">
            <span class="course-info">{{ courseData?.materia || 'Materia' }}</span>
            <span class="divider">|</span>
            <span class="course-info">Grado: {{ courseData?.grado || '-' }}</span>
            <span class="divider">|</span>
            <span class="course-info">Sección: {{ courseData?.seccion || '-' }}</span>
          </div>
        </div>
      </div>
      <div class="separator" style="opacity: 1; transform: none;"></div>

      <!-- Formulario para crear planificación -->
      <div class="crud-actions">
        <div class="form-container">
          <form @submit.prevent="submitPlanning" class="planning-form">
            <div class="form-row">
              <div class="form-group">
                <label for="trimestre">Trimestre</label>
                <select v-model="trimestre" class="form-input" required>
                  <option disabled value="">Selecciona un trimestre</option>
                  <option v-for="t in trimestres" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="ciclo">Ciclo escolar</label>
                <input v-model="ciclo" type="text" class="form-input" required placeholder="Ej. 2025" />
              </div>
            </div>

            <!-- File Upload Section for New Planification -->
            <div class="form-group full-width">
              <label>Archivos de Planificación (Opcional)</label>
              <div 
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                @click="triggerFileInput"
                class="upload-area"
                :class="{ 'dragover': isDragOver, 'uploading': isUploading }"
                @dragenter="isDragOver = true"
                @dragleave="isDragOver = false"
              >
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  multiple
                  @change="handleFileSelect"
                  style="display: none"
                />
                
                <div class="upload-content">
                  <FileText class="upload-icon" />
                  <div class="upload-text">
                    <p class="primary-text">
                      Arrastra archivos aquí o <span class="link-text">haz clic para seleccionar</span>
                    </p>
                    <p class="secondary-text">Archivos permitidos: PDF, DOC, DOCX (máx. 10MB)</p>
                  </div>
                </div>
              </div>

              <!-- Selected Files Preview -->
              <div v-if="selectedFiles.length > 0" class="selected-files">
                <h4>Archivos seleccionados:</h4>
                <div class="files-preview">
                  <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview">
                    <div class="file-info">
                      <FileText class="file-icon" />
                      <div class="file-details">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                    </div>
                    <button @click="removeSelectedFile(index)" class="remove-file-btn" type="button">
                      <Trash class="remove-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="action-btn create" type="submit" :disabled="isUploading">
                <Plus v-if="!isUploading" class="action-icon" />
                <div v-else class="spinner-small"></div>
                <span class="btn-text">
                  {{ isUploading ? 'Creando planificación...' : 'Crear planificación' }}
                </span>
              </button>
              <div v-if="isUploading && uploadProgress > 0" class="form-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Mensaje cuando no hay planificaciones -->
      <div v-if="planificaciones.length === 0 && !planificacionesLoading" class="no-planning">
        <div class="no-planning-content">
          <FileText class="no-planning-icon" />
          <p>No hay planificaciones registradas para este curso.</p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="planificacionesLoading" class="loading-state">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando planificaciones...</p>
        </div>
      </div>

      <!-- Tabla responsive -->
      <div v-else-if="!planificacionesLoading" class="table-section">
        <!-- Vista de tabla para desktop -->
        <div class="table-container desktop-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Trimestre</th>
                <th>Ciclo Escolar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in planificaciones" :key="plan.id">
                <td>{{ plan.id }}</td>
                <td>{{ formatTrimestre(plan.mes) }}</td>
                <td>{{ plan.ciclo_escolar }}</td>
                <td>
                  <span class="badge" :class="formatEstadoClass(plan.estado)">{{ plan.estado }}</span>
                </td>
                <td class="actions">
                  <div class="action-group">
                    <button class="action-btn view" @click="goToTasks(plan.id)" title="Ver tareas">
                      <BookOpen class="action-icon" />
                    </button>
                    <button @click="deletePlanning(plan.id)" class="action-btn delete" title="Eliminar">
                      <Trash class="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista de tarjetas para móvil -->
        <div class="mobile-cards">
          <div v-for="plan in planificaciones" :key="plan.id" class="planning-card">
            <div class="card-header">
              <div class="card-id">ID: {{ plan.id }}</div>
              <span class="badge" :class="formatEstadoClass(plan.estado)">{{ plan.estado }}</span>
            </div>
            
            <div class="card-content">
              <div class="card-info">
                <div class="info-item">
                  <span class="info-label">Trimestre:</span>
                  <span class="info-value">{{ formatTrimestre(plan.mes) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Ciclo Escolar:</span>
                  <span class="info-value">{{ plan.ciclo_escolar }}</span>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="action-btn view" @click="goToTasks(plan.id)">
                  <BookOpen class="action-icon" />
                  <span>Ver tareas</span>
                </button>
                <button @click="deletePlanning(plan.id)" class="action-btn delete">
                  <Trash class="action-icon" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <NotificationDialog />
    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import ArrowBack from '@/components/common/ArrowBack.vue'
import planningService from '@/services/planningService'
import fileService from '@/services/fileService'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare, Plus, Trash, Upload } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const confirmDialog = ref(null)

// Pre-cargar datos síncronamente antes del mount
const getCourseData = () => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    try {
      return JSON.parse(savedCourse)
    } catch (error) {
      console.error('Error parsing course data:', error)
    }
  }
  // Fallback más descriptivo para mobile
  return { 
    materia: 'Curso', 
    grado: 'N/A', 
    seccion: 'N/A' 
  }
}

// Asegurar que siempre tengamos datos válidos para evitar flasheo
const courseData = ref(getCourseData())

// Función para guardar el estado de la vista
const saveViewState = () => {
  localStorage.setItem('planningViewState', JSON.stringify({
    trimestre: trimestre.value,
    ciclo: ciclo.value,
    scrollPosition: window.scrollY
  }))
}

// Garantizar que nunca hay valores undefined que causen flasheo
if (!courseData.value.materia) {
  courseData.value.materia = 'Curso'
}
if (!courseData.value.grado) {
  courseData.value.grado = 'N/A'
}
if (!courseData.value.seccion) {
  courseData.value.seccion = 'N/A'
}
const planificaciones = ref([])
const planificacionesLoading = ref(true) // Estado de loading
const trimestre = ref('')
const ciclo = ref('')

// File upload variables
const selectedFiles = ref([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const isDragOver = ref(false)
const fileInput = ref(null)

const trimestres = [
  { value: 'enero', label: 'I Trimestre (Enero - Abril)' },
  { value: 'mayo', label: 'II Trimestre (Mayo - Agosto)' },
  { value: 'septiembre', label: 'III Trimestre (Septiembre - Diciembre)' }
]

const courseId = route.params.courseId

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const formatEstadoClass = (estado) => {
  return estado.toLowerCase().replace(/\s/g, '-');
}

const formatTrimestre = (mes) => {
  const trimestreMap = {
    'enero': 'I Trimestre',
    'mayo': 'II Trimestre', 
    'septiembre': 'III Trimestre'
  }
  return trimestreMap[mes] || mes
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const fetchPlanning = async () => {
  planificacionesLoading.value = true
  try {
    const data = await planningService.fetchByCourse(courseId)
    planificaciones.value = data
  } catch (error) {
    showNotification('error', 'Error', 'No se pudieron cargar las planificaciones')
    console.error(error)
  } finally {
    planificacionesLoading.value = false
  }
}

const submitPlanning = async () => {
  try {
    isUploading.value = true
    uploadProgress.value = 0
    
    // First create the planification
    const newPlan = await planningService.create(courseId, { 
      mes: trimestre.value,
      ciclo_escolar: ciclo.value
    })
    
    // If there are files to upload, upload them
    if (selectedFiles.value.length > 0) {
      uploadProgress.value = 10 // Planning created
      
      for (let i = 0; i < selectedFiles.value.length; i++) {
        const file = selectedFiles.value[i]
        const formData = new FormData()
        formData.append('file', file)
        
        await fileService.uploadPlanificationFile(courseId, newPlan.id, formData)
        
        // Update progress (10% for planning creation + 90% for files)
        uploadProgress.value = 10 + Math.round(((i + 1) / selectedFiles.value.length) * 90)
      }
    }
    
    showNotification('success', 'Éxito', 'Planificación creada correctamente' + (selectedFiles.value.length > 0 ? ` con ${selectedFiles.value.length} archivo(s)` : ''))
    
    // Reset form
    trimestre.value = ''
    ciclo.value = ''
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
    
    await fetchPlanning()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo crear la planificación')
    console.error(error)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const goToTasks = (planId) => {
  router.push({
      name: 'CoursePlanningTasks',
      params: { 
      courseId: route.params.courseId,
      planId: planId
      },
      state: { courseData: courseData.value }
    })
}

const deletePlanning = async (planId) => {
  const plan = planificaciones.value.find(p => p.id === planId)
  const confirmed = await confirmDialog.value.show({
    title: 'Eliminar planificación',
    message: `¿Estás seguro de que deseas eliminar la planificación "${plan?.mes || ''}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar'
  })
  
  if (!confirmed) return
  
  try {
    await planningService.delete(courseId, planId)
    planificaciones.value = planificaciones.value.filter(p => p.id !== planId)
    showNotification('success', 'Éxito', 'Planificación eliminada correctamente')
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la planificación')
    console.error(error)
  }
}

// File upload methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  // Validate files
  const validFiles = files.filter(file => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      showNotification('error', 'Error', `Archivo ${file.name} no es válido. Solo se permiten PDF, DOC y DOCX.`)
      return false
    }
    
    if (file.size > maxSize) {
      showNotification('error', 'Error', `Archivo ${file.name} es muy grande. Máximo 10MB.`)
      return false
    }
    
    // Check if file already selected
    if (selectedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
      showNotification('warning', 'Advertencia', `El archivo ${file.name} ya está seleccionado.`)
      return false
    }
    
    return true
  })
  
  if (validFiles.length > 0) {
    selectedFiles.value.push(...validFiles)
    showNotification('success', 'Éxito', `${validFiles.length} archivo(s) agregado(s)`)
  }
}

const removeSelectedFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(async () => {
  // Verificar que tenemos datos del curso, si no redirigir
  if (!courseData.value || !courseData.value.materia || courseData.value.materia === 'Curso') {
    router.push('/teacher/courses')
    return
  }
  
  // Cargar planificaciones después
  await fetchPlanning()
})
</script>

<style scoped>
/* Estilos base */
.layout {
  display: flex;
  min-height: 100vh;
}

.planning-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  max-width: 100%;
  box-sizing: border-box;
}

/* Header section */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
}

.course-subtitle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  color: #6b7280;
  font-size: 1rem;
}

.course-info {
  font-weight: 500;
}

.divider {
  color: #d1d5db;
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

.planning-form {
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

/* Botones */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  font-size: 0.9rem;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
}

.action-btn.create:hover {
  background-color: #158a50;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 300px;
}

/* Selected Files Preview */
.selected-files {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.selected-files h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.files-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.file-icon {
  width: 20px;
  height: 20px;
  color: #1b9963;
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.file-size {
  font-size: 0.8rem;
  color: #666;
}

.remove-file-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.remove-file-btn:hover {
  background: #c82333;
}

.remove-icon {
  width: 14px;
  height: 14px;
}

.action-btn.view {
  background-color: #1b9963;
  color: white;
  padding: 0.5rem;
}

.action-btn.view:hover {
  background-color: #158a50;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
  padding: 0.5rem;
}

.action-btn.delete:hover {
  background-color: #c9302c;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Mensaje sin planificaciones */
.no-planning {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-planning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-planning-icon {
  width: 48px;
  height: 48px;
  color: #ccc;
}

.no-planning p {
  color: #777;
  font-style: italic;
  margin: 0;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #777;
  margin: 0;
}

/* Tabla desktop */
.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.desktop-table {
  display: block;
}

.table-container {
  overflow-x: auto;
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

/* Vista de tarjetas móvil */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
  flex-direction: column;
}

.planning-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
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

.card-id {
  font-weight: 600;
  color: #333;
}

.card-content {
  padding: 1rem;
}

.card-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  color: #333;
  text-align: right;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.card-actions .action-btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
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

/* Responsive Design */
@media screen and (max-width: 768px) {
  .planning-container {
    padding: 1rem;
    margin-left: 0;
  }

  .page-title {
    font-size: 1.5rem;
    margin-top: 5.25rem;
    /* Anti-flasheo mobile */
    min-height: 2rem;
    text-align: left;
  }

  .course-subtitle {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    /* Estabilizar layout mobile */
    min-height: 4rem;
  }

  .divider {
    display: none;
  }
  
  .course-info {
    /* Estabilizar tamaño en mobile */
    min-height: 1.2rem;
    padding: 0.2rem 0;
    width: 100%;
    word-break: break-word;
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
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .table-section {
    box-shadow: none;
    background: transparent;
  }
}

@media screen and (max-width: 480px) {
  .planning-container {
    padding: 0.75rem;
  }

  .form-container {
    padding: 0.75rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .action-btn {
    width: 100%;
    justify-content: center;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-value {
    text-align: left;
  }
}

/* Mejoras adicionales para tablet */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .planning-container {
    padding: 1.5rem;
  }

  .form-row {
    gap: 1rem;
  }

  .data-table th, .data-table td {
    padding: 0.75rem;
  }
}

/* File Upload Styles */
.file-upload-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.upload-header {
  margin-bottom: 1.5rem;
}

.upload-header h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.upload-header p {
  margin: 0;
  color: #666;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #1b9963;
  background: #f0fdf4;
}

.upload-area.dragover {
  border-color: #1b9963;
  background: #f0fdf4;
  transform: scale(1.02);
}

.upload-area.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #1b9963;
}

.upload-text .primary-text {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.upload-text .secondary-text {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.link-text {
  color: #1b9963;
  font-weight: 500;
}

.upload-progress {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1b9963;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

/* Uploaded Files */
.uploaded-files {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.uploaded-files h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.file-icon {
  width: 24px;
  height: 24px;
  color: #1b9963;
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-size, .file-date {
  font-size: 0.85rem;
  color: #666;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn.upload {
  background: #1b9963;
  color: white;
}

.action-btn.upload:hover {
  background: #157347;
}

.action-btn.download {
  background: #0d6efd;
  color: white;
}

.action-btn.download:hover {
  background: #0b5ed7;
}

/* Mobile file upload styles */
@media screen and (max-width: 768px) {
  .file-upload-section {
    padding: 1rem;
  }

  .upload-area {
    padding: 2rem 1rem;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .upload-text .primary-text {
    font-size: 1rem;
  }
}
</style>