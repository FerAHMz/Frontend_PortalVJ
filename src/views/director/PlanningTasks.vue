<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <ArrowBack 
        :to="`/director/planning/${$route.params.courseId}`" 
        :show-text="true" 
        text="Volver a Planificación"
      />
      <h1 class="page-title">Archivos de Planificación</h1>
      <div v-if="planificacion" class="course-subtitle">
        <div class="course-info">
          {{ planificacion?.mes }} | Ciclo: {{ planificacion?.ciclo_escolar }}
        </div>
        <div class="estado-section">
          <div class="estado-info">
            Estado: <span class="badge" :class="formatEstadoClass(planificacion.estado)">{{ planificacion.estado }}</span>
          </div>
          <div class="estado-buttons">
            <!-- Mostrar botones según el estado actual -->
            <template v-if="planificacion.estado === 'en revision'">
              <button 
                @click="actualizarEstado('aceptada')" 
                class="action-btn success">
                Aceptar
              </button>
              <button 
                @click="actualizarEstado('rechazada')" 
                class="action-btn delete">
                Rechazar
              </button>
            </template>
            <template v-else>
              <button 
                @click="actualizarEstado('en revision')" 
                class="action-btn warning">
                Poner en Revisión
              </button>
            </template>
          </div>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Files Section -->
      <div class="files-container">
        <div class="files-header">
          <h2>Archivos de la Planificación</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando archivos...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="fetchFiles" class="retry-btn">Reintentar</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="files.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>No hay archivos disponibles</h3>
          <p>No se han subido archivos para esta planificación.</p>
        </div>

        <!-- Files Display -->
        <div v-else class="files-content">
          <!-- Desktop Table View -->
          <div class="table-container desktop-view">
            <table class="files-table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Descripción</th>
                  <th>Subido por</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in files" :key="file.id" class="file-row">
                  <td class="file-name">
                    <div class="file-icon">📄</div>
                    <span>{{ file.original_name }}</span>
                  </td>
                  <td class="file-description">
                    {{ file.description || 'Sin descripción' }}
                  </td>
                  <td class="file-uploader">
                    {{ file.uploaded_by_name || file.uploaded_by_email || 'Desconocido' }}
                  </td>
                  <td class="file-date">
                    {{ formatDate(file.uploaded_at) }}
                  </td>
                  <td class="file-actions">
                    <button @click="downloadFile(file)" class="download-btn" title="Descargar archivo">
                      <Download class="icon" />
                      Descargar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="cards-container mobile-view">
            <div v-for="file in files" :key="file.id" class="file-card">
              <div class="card-header">
                <div class="file-info">
                  <div class="file-icon">📄</div>
                  <div class="file-details">
                    <h4>{{ file.original_name }}</h4>
                    <p class="file-description">{{ file.description || 'Sin descripción' }}</p>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="file-meta">
                  <span><strong>Subido por:</strong> {{ file.uploaded_by_name || file.uploaded_by_email || 'Desconocido' }}</span>
                  <span><strong>Fecha:</strong> {{ formatDate(file.uploaded_at) }}</span>
                </div>
              </div>
              <div class="card-actions">
                <button @click="downloadFile(file)" class="download-btn mobile">
                  <Download class="icon" />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Observations Section -->
      <div class="observations-container">
        <div class="observations-header">
          <h2>Retroalimentación</h2>
        </div>

        <!-- Add new observation -->
        <div class="add-observation">
          <h3>Agregar Retroalimentación</h3>
          <div class="observation-form">
            <textarea
              v-model="nuevaObservacion"
              placeholder="Escribe tu retroalimentación aquí..."
              class="observation-input"
              rows="3"
            ></textarea>
            <button @click="agregarObservacion" class="action-btn primary">
              <Check class="action-icon" />
              <span class="btn-text">Agregar</span>
            </button>
          </div>
        </div>

        <!-- Observations List -->
        <div class="observations-list">
          <div v-if="observaciones.length > 0">
            <div v-for="obs in observaciones" :key="obs.id" class="observation-item">
              <div v-if="inlineEditingObservationId === obs.id" class="editing-observation">
                <textarea 
                  v-model="inlineObservationText" 
                  class="observation-input"
                  rows="3"
                ></textarea>
                <div class="edit-actions">
                  <button @click="saveEditObservation(obs.id)" class="action-btn success">
                    <Check class="action-icon" />
                    <span class="btn-text">Guardar</span>
                  </button>
                  <button @click="cancelEditObservation" class="action-btn cancel">
                    <X class="action-icon" />
                    <span class="btn-text">Cancelar</span>
                  </button>
                </div>
              </div>
              <div v-else>
                <p class="obs-text"><strong>{{ obs.observaciones }}</strong></p>
                <p class="obs-meta"><em>{{ formatDate(obs.fecha) }}</em></p>
                <!-- Botones de acciones -->
                <div class="observation-actions">
                  <button @click="startEditObservation(obs)" class="action-btn edit">
                    <Edit class="action-icon" />
                    <span class="btn-text">Editar</span>
                  </button>
                  <button @click="confirmDeleteObservation(obs.id)" class="action-btn delete">
                    <Trash class="action-icon" />
                    <span class="btn-text">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-observations">
            No hay retroalimentación registrada para esta planificación
          </div>
        </div>
      </div>
    </main>
    <NotificationDialog />
    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import ArrowBack from '@/components/common/ArrowBack.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import planningService from '@/services/planningService'
import directorFileService from '@/services/directorFileService'
import { useNotifications } from '@/utils/useNotifications.js'
import { User, BookOpen, BarChart3, Users, Download, Edit, Trash, Check, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const confirmDialog = ref(null)

// Data
const files = ref([])
const observaciones = ref([])
const planificacion = ref(null)
const loading = ref(true)
const error = ref(null)
const courseId = route.params.courseId
const planId = route.params.planId
const nuevaObservacion = ref('')

// Variables separadas para edición inline
const inlineObservationText = ref('')
const inlineEditingObservationId = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/director' },
  { label: 'Gestión Académica', icon: BookOpen, path: '/director/academic' },
  { label: 'Reportes', icon: BarChart3, path: '/director/reports' },
  { label: 'Personal', icon: Users, path: '/director/staff' }
]

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const formatEstadoClass = (estado) => {
  return estado.toLowerCase().replace(/\s/g, '-');
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const actualizarEstado = async (nuevoEstado) => {
  if (!nuevoEstado || nuevoEstado === planificacion.value.estado) return
  
  try {
    await planningService.updateEstado(courseId, planId, {
      estado: nuevoEstado
    })
    showNotification('success', 'Estado actualizado correctamente')
    await fetchPlanningData() // recarga el estado actualizado
  } catch (e) {
    showNotification('error', 'Error', 'No se pudo actualizar el estado')
    console.error(e)
  }
}

const fetchFiles = async () => {
  try {
    loading.value = true
    error.value = null
    const filesData = await directorFileService.getPlanificationFiles(planId)
    files.value = filesData.files || []
  } catch (err) {
    console.error('Error fetching files:', err)
    error.value = 'Error al cargar los archivos'
    files.value = []
  } finally {
    loading.value = false
  }
}

const downloadFile = async (file) => {
  try {
    await directorFileService.downloadFile(file)
    showNotification('success', 'Archivo descargado correctamente')
  } catch (error) {
    console.error('Error downloading file:', error)
    showNotification('error', 'Error al descargar el archivo: ' + (error.message || 'Error desconocido'))
  }
}

const fetchPlanningData = async () => {
  try {
    planificacion.value = await planningService.fetchById(courseId, planId)
    observaciones.value = await planningService.fetchObservations(courseId, planId)
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo cargar la planificación')
    console.error(error)
  }
}

const agregarObservacion = async () => {
  if (!nuevaObservacion.value.trim()) {
    showNotification('warning', 'Advertencia', 'Escribe una observación válida')
    return
  }

  try {
    await planningService.createObservation(courseId, planId, {
      observaciones: nuevaObservacion.value
    })
    showNotification('success', 'Observación agregada correctamente')
    nuevaObservacion.value = ''
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo agregar la observación')
    console.error(error)
  }
}

const startEditObservation = (obs) => {
  inlineEditingObservationId.value = obs.id
  inlineObservationText.value = obs.observaciones
}

const saveEditObservation = async (observationId) => {
  if (!inlineObservationText.value.trim()) {
    showNotification('warning', 'Advertencia', 'Escribe una observación válida')
    return
  }

  try {
    await planningService.updateObservation(courseId, planId, observationId, {
      observaciones: inlineObservationText.value
    })
    showNotification('success', 'Observación actualizada correctamente')
    inlineEditingObservationId.value = null
    inlineObservationText.value = ''
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo actualizar la observación')
    console.error(error)
  }
}

const cancelEditObservation = () => {
  inlineEditingObservationId.value = null
  inlineObservationText.value = ''
}

const confirmDeleteObservation = async (observationId) => {
  const confirmed = await confirmDialog.value.show(
    'Eliminar Observación',
    '¿Estás seguro de que quieres eliminar esta observación?'
  )

  if (confirmed) {
    try {
      await planningService.deleteObservation(courseId, planId, observationId)
      showNotification('success', 'Observación eliminada correctamente')
      await fetchPlanningData()
    } catch (error) {
      showNotification('error', 'Error', 'No se pudo eliminar la observación')
      console.error(error)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    fetchPlanningData(),
    fetchFiles()
  ])
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.planning-tasks-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.course-subtitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.course-info {
  font-size: 1.1rem;
  color: #4a5568;
}

.estado-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.estado-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge.en-revision {
  background: #fed7aa;
  color: #c2410c;
}

.badge.aceptada {
  background: #bbf7d0;
  color: #15803d;
}

.badge.rechazada {
  background: #fecaca;
  color: #dc2626;
}

.estado-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn.success {
  background: #16a34a;
  color: white;
}

.action-btn.success:hover {
  background: #15803d;
}

.action-btn.delete {
  background: #dc2626;
  color: white;
}

.action-btn.delete:hover {
  background: #b91c1c;
}

.action-btn.warning {
  background: #f59e0b;
  color: white;
}

.action-btn.warning:hover {
  background: #d97706;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.edit {
  background: #f59e0b;
  color: white;
}

.action-btn.edit:hover {
  background: #d97706;
}

.action-btn.cancel {
  background: #6b7280;
  color: white;
}

.action-btn.cancel:hover {
  background: #4b5563;
}

.separator {
  height: 1px;
  background: #e2e8f0;
  margin: 2rem 0;
}

/* Files Section */
.files-container, .observations-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.files-header, .observations-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.files-header h2, .observations-header h2 {
  margin: 0;
  padding-bottom: 1rem;
  font-size: 1.5rem;
  color: #2d3748;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #dc2626;
}

.error-message {
  margin-bottom: 1rem;
  font-weight: 500;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

/* Desktop Table View */
.files-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.files-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.files-table th,
.files-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.files-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.file-row:hover {
  background: #f8fafc;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  font-size: 1.5rem;
}

.file-description {
  max-width: 200px;
  word-break: break-word;
}

.download-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.download-btn .icon {
  width: 16px;
  height: 16px;
}

/* Mobile Card View */
.file-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.file-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.file-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.file-details h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 1rem;
  word-break: break-word;
}

.file-description {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.card-body {
  padding: 1rem;
}

.file-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.card-actions {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.download-btn.mobile {
  width: 100%;
  justify-content: center;
}

/* Observations Section */
.add-observation {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.add-observation h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.observation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.observation-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
}

.observation-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.observations-list {
  padding: 1.5rem;
}

.observation-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid #3b82f6;
}

.obs-text {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  line-height: 1.5;
}

.obs-meta {
  margin: 0 0 0.75rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.observation-actions, .edit-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.editing-observation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-observations {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.btn-text {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .planning-tasks-container {
    padding: 1rem;
  }

  .course-subtitle {
    flex-direction: column;
    align-items: flex-start;
  }

  .estado-section {
    width: 100%;
    justify-content: space-between;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .observation-actions, .edit-actions {
    justify-content: flex-start;
  }

  .action-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .btn-text {
    display: none;
  }
}
</style>
