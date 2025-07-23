<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="observations-view-container">
      <!-- Header responsive -->
      <div class="page-header">
        <h1 class="page-title">
          Observaciones de {{ studentData?.nombre }} {{ studentData?.apellido }}
        </h1>
        <div class="course-subtitle" v-if="courseData">
          <div class="course-info-grid">
            <span class="info-item">{{ courseData.materia }}</span>
            <span class="info-separator">|</span>
            <span class="info-item">Grado: {{ courseData.grado }}</span>
            <span class="info-separator">|</span>
            <span class="info-item">Sección: {{ courseData.seccion }}</span>
          </div>
        </div>
      </div>
      
      <div class="separator"></div>

      <!-- Mensaje cuando no hay observaciones -->
      <div v-if="observations.length === 0" class="no-observations">
        <div class="no-observations-icon">📝</div>
        <h3>No hay observaciones registradas</h3>
        <p>Aún no se han registrado observaciones para este estudiante.</p>
      </div>

      <!-- Vista de escritorio/tablet - Tabla -->
      <div v-else class="desktop-view">
        <table class="observations-table">
          <thead>
            <tr>
              <th class="obs-column">Observaciones</th>
              <th class="actions-column">Puntos de Acción</th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="obs in observations" :key="obs.id">
              <td class="obs-column">
                <textarea 
                  v-if="obs.editing" 
                  v-model="obs.observaciones_edit" 
                  class="form-input textarea-edit"
                  placeholder="Escriba las observaciones..."
                ></textarea>
                <div v-else class="observation-text">{{ obs.observaciones }}</div>
              </td>
              <td class="actions-column">
                <textarea 
                  v-if="obs.editing" 
                  v-model="obs.puntos_de_accion_edit" 
                  class="form-input textarea-edit"
                  placeholder="Escriba los puntos de acción..."
                ></textarea>
                <div v-else class="observation-text">{{ obs.puntos_de_accion }}</div>
              </td>
              <td class="actions-cell">
                <div class="button-group">
                  <template v-if="obs.editing">
                    <button @click="saveObservation(obs)" class="btn primary">
                      <span class="btn-text">Guardar</span>
                    </button>
                    <button @click="cancelEdit(obs)" class="btn secondary">
                      <span class="btn-text">Cancelar</span>
                    </button>
                  </template>
                  <template v-else>
                    <button @click="editObservation(obs)" class="btn primary">
                      <span class="btn-text">Editar</span>
                    </button>
                    <button @click="deleteObservation(obs.id)" class="btn danger">
                      <span class="btn-text">Eliminar</span>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista móvil - Cards -->
      <div v-if="observations.length > 0" class="mobile-view">
        <div v-for="obs in observations" :key="obs.id" class="observation-card">
          <div class="card-header">
            <h4>Observación #{{ obs.id }}</h4>
          </div>
          
          <div class="card-content">
            <div class="field-group">
              <label class="field-label">Observaciones:</label>
              <textarea 
                v-if="obs.editing" 
                v-model="obs.observaciones_edit" 
                class="form-input textarea-mobile"
                placeholder="Escriba las observaciones..."
              ></textarea>
              <div v-else class="field-content">{{ obs.observaciones }}</div>
            </div>

            <div class="field-group">
              <label class="field-label">Puntos de Acción:</label>
              <textarea 
                v-if="obs.editing" 
                v-model="obs.puntos_de_accion_edit" 
                class="form-input textarea-mobile"
                placeholder="Escriba los puntos de acción..."
              ></textarea>
              <div v-else class="field-content">{{ obs.puntos_de_accion }}</div>
            </div>
          </div>

          <div class="card-actions">
            <template v-if="obs.editing">
              <button @click="saveObservation(obs)" class="btn primary mobile-btn">
                Guardar
              </button>
              <button @click="cancelEdit(obs)" class="btn secondary mobile-btn">
                Cancelar
              </button>
            </template>
            <template v-else>
              <button @click="editObservation(obs)" class="btn primary mobile-btn">
                Editar
              </button>
              <button @click="deleteObservation(obs.id)" class="btn danger mobile-btn">
                Eliminar
              </button>
            </template>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Notificaciones -->
    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import observationsService from '@/services/observationsService'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'

const route = useRoute()
const router = useRouter()
const courseData = ref(null)
const studentData = ref(null)
const observations = ref([])
const { showNotification } = useNotifications()

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const fetchObservations = async () => {
  try {
    console.log('courseId:', route.params.courseId)
    console.log('carnet_estudiante:', route.params.carnet_estudiante)
    const observationsData = await observationsService.fetchObservations(
      route.params.courseId,
      route.params.carnet_estudiante
    )
    // Agregamos propiedades para el modo edición
    observations.value = observationsData.map(obs => ({
      id: obs.id,
      carnet_estudiante: obs.carnet_estudiante,
      id_curso: obs.id_curso,
      observaciones: obs.observaciones,
      puntos_de_accion: obs.puntos_de_accion,
      id_calificacion: obs.id_calificacion,
      editing: false,
      observaciones_edit: obs.observaciones,
      puntos_de_accion_edit: obs.puntos_de_accion
    }))

  } catch (error) {
    console.error('Error fetching observations:', {
      error: error.message,
      response: error.response?.data
    })
    observations.value = []
    showNotification('error', 'Error', 'Error al obtener las observaciones')
  }
}

const editObservation = (obs) => {
  obs.editing = true
  obs.observaciones_edit = obs.observaciones
  obs.puntos_de_accion_edit = obs.puntos_de_accion
}

const cancelEdit = (obs) => {
  obs.editing = false
}

const saveObservation = async (obs) => {
  try {
    await observationsService.updateObservation(obs.id, {
      observaciones: obs.observaciones_edit, 
      puntos_de_accion: obs.puntos_de_accion_edit,
      id_calificacion: obs.id_calificacion 
    })
    
    await fetchObservations();
    
    showNotification('success', 'Éxito', 'Observación actualizada correctamente')
  } catch (error) {
    showNotification('error', 'Error', 'Error al actualizar la observación')
    console.error(error)
  }
}

const deleteObservation = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta observación?')) return

  try {
    await observationsService.deleteObservation(id)
    observations.value = observations.value.filter(obs => obs.id !== id)
    showNotification('success', 'Éxito', 'Observación eliminada correctamente')
  } catch (error) {
    showNotification('error', 'Error', 'Error al eliminar observación')
    console.error(error)
  }
}

onMounted(async () => {
  const student = sessionStorage.getItem('studentData')
  if (student) {
    studentData.value = JSON.parse(student)
  }

  const course = sessionStorage.getItem('currentCourse')
  if (course) {
    courseData.value = JSON.parse(course)
  }

  await fetchObservations()
})
</script>

<style scoped>
/* Layout principal */
.layout {
  display: flex;
  min-height: 100vh;
}

.observations-view-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px; /* Espacio para sidebar en escritorio */
  max-width: 100%;
  overflow-x: hidden;
}

/* Header de la página */
.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.course-subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.course-info-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.info-item {
  white-space: nowrap;
}

.info-separator {
  color: #999;
  font-weight: normal;
}

.separator {
  height: 2px;
  background-color: #000;
  margin: 1.5rem 0;
}

/* Mensaje sin observaciones */
.no-observations {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.no-observations-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-observations h3 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.no-observations p {
  color: #6c757d;
  font-size: 1.1rem;
}

/* Vista de escritorio - Tabla */
.desktop-view {
  display: block;
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.observations-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.observations-table th,
.observations-table td {
  padding: 1.25rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
  vertical-align: top;
}

.observations-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 10;
}

.observations-table tr {
  transition: background-color 0.2s ease;
}

.observations-table tr:hover {
  background-color: #f8f9fa;
}

.obs-column {
  width: 35%;
  min-width: 250px;
}

.actions-column {
  width: 35%;
  min-width: 250px;
}

.actions-cell {
  width: 30%;
  min-width: 200px;
  white-space: nowrap;
}

.observation-text {
  line-height: 1.5;
  word-wrap: break-word;
  max-height: 150px;
  overflow-y: auto;
}

/* Vista móvil - Cards */
.mobile-view {
  display: none;
  gap: 1.5rem;
}

.observation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.card-header {
  background: #f8f9fa;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dee2e6;
}

.card-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-content {
  padding: 1.25rem;
}

.field-group {
  margin-bottom: 1.5rem;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.field-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.5;
  color: #495057;
  min-height: 60px;
  white-space: pre-wrap;
}

.card-actions {
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 0.75rem;
}

/* Inputs y textareas */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.5;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.textarea-edit {
  min-height: 100px;
  resize: vertical;
}

.textarea-mobile {
  min-height: 80px;
  resize: vertical;
}

/* Botones */
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.primary:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.btn.secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.btn.secondary:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.btn.danger {
  background-color: #dc3545;
  color: white;
}

.btn.danger:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.mobile-btn {
  flex: 1;
  padding: 0.75rem 1rem;
}

/* Responsive Design */

/* Tablets - 1024px y menos */
@media screen and (max-width: 1024px) {
  .observations-view-container {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .observations-table th,
  .observations-table td {
    padding: 1rem;
  }
}

/* Tablets pequeñas - 768px y menos */
@media screen and (max-width: 768px) {
  .observations-view-container {
    margin-left: 0; /* Remover margen del sidebar */
    padding: 1rem;
    padding-top: 80px; /* Espacio para el botón hamburguesa */
  }

  .page-title {
    font-size: 1.5rem;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .course-subtitle {
    font-size: 1rem;
  }

  .course-info-grid {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-separator {
    display: none;
  }

  .info-item {
    display: block;
    padding: 0.125rem 0;
  }

  /* Ocultar vista de escritorio, mostrar vista móvil */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: flex;
    flex-direction: column;
  }
}

/* Móviles - 480px y menos */
@media screen and (max-width: 480px) {
  .observations-view-container {
    padding: 0.75rem;
    padding-top: 70px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .course-subtitle {
    font-size: 0.95rem;
  }

  .no-observations {
    padding: 3rem 1.5rem;
  }

  .no-observations-icon {
    font-size: 2.5rem;
  }

  .no-observations h3 {
    font-size: 1.25rem;
  }

  .no-observations p {
    font-size: 1rem;
  }

  .mobile-view {
    gap: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-actions {
    padding: 1rem;
    flex-direction: column;
  }

  .mobile-btn {
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }

  .field-content {
    padding: 0.875rem;
    font-size: 0.95rem;
  }

  .form-input {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
}

/* Móviles muy pequeños - 360px y menos */
@media screen and (max-width: 360px) {
  .observations-view-container {
    padding: 0.5rem;
    padding-top: 65px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .no-observations {
    padding: 2rem 1rem;
  }

  .card-header,
  .card-content,
  .card-actions {
    padding: 0.875rem;
  }

  .mobile-btn {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}

/* Landscape móviles */
@media screen and (max-height: 500px) and (orientation: landscape) {
  .observations-view-container {
    padding-top: 60px;
  }

  .page-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .separator {
    margin: 1rem 0;
  }

  .mobile-view {
    gap: 1rem;
  }

  .textarea-mobile {
    min-height: 60px;
  }
}

/* Modo horizontal para tablets en landscape */
@media screen and (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .observations-table th,
  .observations-table td {
    padding: 0.875rem;
  }

  .obs-column,
  .actions-column {
    min-width: 200px;
  }

  .actions-cell {
    min-width: 180px;
  }
}
</style>