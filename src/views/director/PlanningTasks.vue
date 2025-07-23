<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <h1 class="page-title">Tareas Planificadas</h1>
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

      <!-- Tabla de tareas -->
      <div v-if="tareas.length" class="table-container">
        <div class="table-header">
          <h2>Lista de Tareas</h2>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tema</th>
                <th>Puntaje</th>  
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tarea, index) in tareas" :key="tarea.id">
                <td data-label="#">{{ index + 1 }}</td>
                <td data-label="Tema">{{ tarea.tema_tarea }}</td>
                <td data-label="Puntaje">{{ tarea.puntos_tarea }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="no-tasks">No hay tareas planificadas.</div>

      <!-- Observaciones del director -->
      <div class="observations-box">
        <h2>Agregar observación</h2>

        <!-- Formulario para crear o editar observación -->
        <form @submit.prevent="handleObservationSubmit" class="observation-form">
          <textarea 
            v-model="nuevaObservacion" 
            class="form-input" 
            rows="3" 
            placeholder="Escribe tu observación..." 
            required 
          />
          <div class="form-actions">
            <button class="action-btn create" type="submit">
              {{ editingObservationId ? 'Actualizar' : 'Agregar' }}
            </button>
            <button 
              v-if="editingObservationId" 
              class="action-btn cancel" 
              type="button" 
              @click="cancelEditObservation">
              Cancelar
            </button>
          </div>
        </form>

        <!-- Observaciones del director -->
        <div class="observations-section">
          <h2 class="observations-title">Observaciones</h2>

          <div v-if="observaciones.length">
            <div
              v-for="obs in observaciones"
              :key="obs.id"
              class="observation-card"
            >
              <div v-if="inlineEditingObservationId === obs.id" class="inline-edit-container">
                <textarea 
                  v-model="inlineObservationText" 
                  class="inline-edit-textarea" 
                  rows="3"
                  @keyup.enter.ctrl="handleInlineObservationSubmit"
                  @keyup.escape="cancelEditObservation"
                />
                <div class="inline-actions">
                  <button @click="handleInlineObservationSubmit" class="action-btn create">
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
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import planningService from '@/services/planningService'
import { useNotifications } from '@/utils/useNotifications.js'
import { User, BookOpen, BarChart3, Users } from 'lucide-vue-next'
import { Edit, Trash, Check, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const confirmDialog = ref(null)
const tareas = ref([])
const observaciones = ref([])
const planificacion = ref(null)
const courseId = route.params.courseId
const planId = route.params.planId
const nuevaObservacion = ref('')
const editingObservationId = ref(null)

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

const fetchPlanningData = async () => {
  try {
    planificacion.value = await planningService.fetchById(courseId, planId)
    tareas.value = await planningService.fetchTasks(courseId, planId)
    observaciones.value = await planningService.fetchObservations(courseId, planId)
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo cargar la planificación')
    console.error(error)
  }
}

const handleObservationSubmit = async () => {
  try {
    if (editingObservationId.value) {
      await planningService.updateObservation(courseId, planId, editingObservationId.value, {
        observaciones: nuevaObservacion.value
      })
      showNotification('success', 'Observación actualizada')
    } else {
      await planningService.createObservation(courseId, planId, {
        id_director: localStorage.getItem('userId'),
        observaciones: nuevaObservacion.value
      })
      showNotification('success', 'Observación agregada')
    }
    nuevaObservacion.value = ''
    editingObservationId.value = null
    await fetchPlanningData()
  } catch (e) {
    showNotification('error', 'Error', 'No se pudo guardar la observación')
  }
}

const deleteObservation = async (id) => {
  if (!confirm('¿Eliminar esta observación?')) return
  try {
    await planningService.deleteObservation(courseId, id, planId)
    showNotification('success', 'Observación eliminada')
    await fetchPlanningData()
  } catch (e) {
    showNotification('error', 'Error', 'No se pudo eliminar la observación')
  }
}

const startEditObservation = (obs) => {
  // SOLO llenar el campo inline, NO el formulario general
  inlineObservationText.value = obs.observaciones
  inlineEditingObservationId.value = obs.id
}

const confirmDeleteObservation = async (id) => {
  const confirmed = await confirmDialog.value.show({
    title: 'Eliminar observación',
    message: '¿Estás seguro de que deseas eliminar esta observación? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar'
  })
  
  if (!confirmed) return
  
  try {
    await planningService.deleteObservation(courseId, planId, id)
    showNotification('success', 'Éxito', 'Observación eliminada correctamente')
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la observación')
    console.error(error)
  }
}

// Nueva función para manejar la edición inline
const handleInlineObservationSubmit = async () => {
  if (!inlineObservationText.value.trim()) return
  
  try {
    await planningService.updateObservation(courseId, planId, inlineEditingObservationId.value, {
      observaciones: inlineObservationText.value
    })
    showNotification('success', 'Éxito', 'Observación actualizada correctamente')
    // Limpiar edición inline
    inlineEditingObservationId.value = null
    inlineObservationText.value = ''
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo actualizar la observación')
    console.error(error)
  }
}

const cancelEditObservation = () => {
  // Limpiar SOLO la edición inline, NO el formulario general
  inlineEditingObservationId.value = null
  inlineObservationText.value = ''
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
.planning-tasks-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
}

.course-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

.course-info {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Contenedor de tabla responsive */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.table-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.table-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px; /* Ancho mínimo para evitar compresión excesiva */
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.no-tasks {
  text-align: center;
  color: #777;
  font-style: italic;
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

/* Estilos de botones */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  white-space: nowrap;
}

.action-btn.success {
  background-color: #1b9963;
  color: white;
}

.action-btn.success:hover {
  background-color: #158a50;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
}

.action-btn.delete:hover {
  background-color: #c9302c;
}

.action-btn.warning {
  background-color: #ffc107;
  color: #856404;
}

.action-btn.warning:hover {
  background-color: #e0a800;
}

.action-btn.edit {
  background-color: #fd7e14;
  color: white;
}

.action-btn.edit:hover {
  background-color: #e96b00;
}

.action-btn.cancel {
  background-color: #6c757d;
  color: white;
}

.action-btn.cancel:hover {
  background-color: #545b62;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
}

.action-btn.create:hover {
  background-color: #158a50;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Sección de observaciones */
.observations-box {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.observations-box h2 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
}

.observation-form {
  margin-bottom: 2rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
  background-color: #fff;
  color: #333;
  transition: border-color 0.2s ease;
  margin-bottom: 0.8rem;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4a90e2;
  outline: none;
  background-color: #f9fcff;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.observations-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.observations-title {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.observation-card {
  margin-bottom: 1rem;
  padding: 1.2rem;
  background-color: #eef6fc;
  border-left: 4px solid #2c82c9;
  border-radius: 4px;
}

.obs-text {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.obs-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.observation-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.no-observations {
  font-style: italic;
  color: #777;
  padding: 1.5rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 4px;
}

/* Inline editing styles */
.inline-edit-container {
  padding: 0.5rem 0;
}

.inline-edit-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #1b9963;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #f8fff8;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  box-sizing: border-box;
}

.inline-edit-textarea:focus {
  outline: none;
  border-color: #158a50;
  background-color: #fff;
}

.inline-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Estado section */
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

.estado-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Badges de estado */
.badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
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
@media (max-width: 768px) {
  .planning-tasks-container {
    padding: 1rem;
    margin-left: 0;
    margin-top: 5.25rem; /* Espacio para el botón hamburguesa */
  }

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 0.8rem;
  }

  .course-info {
    font-size: 0.9rem;
  }

  /* Tabla responsive en móvil */
  .data-table {
    min-width: unset;
  }

  .data-table thead {
    display: none;
  }

  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
  }

  .data-table tr {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 1rem;
    padding: 1rem;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .data-table td {
    border: none;
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-table td:before {
    content: attr(data-label) ": ";
    font-weight: 600;
    color: #333;
  }

  /* Estado section responsive */
  .estado-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .estado-info {
    flex-wrap: wrap;
  }

  .estado-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  /* Botones responsive */
  .action-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .btn-text {
    display: none;
  }

  .action-btn .action-icon {
    margin: 0;
  }

  /* Observaciones responsive */
  .observations-box {
    padding: 1rem;
  }

  .observation-card {
    padding: 1rem;
  }

  .observation-actions {
    justify-content: center;
    margin-top: 1rem;
  }

  .inline-actions {
    justify-content: center;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions .action-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .planning-tasks-container {
    padding: 0.5rem;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .observations-box {
    padding: 0.8rem;
  }

  .action-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  .badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* Scroll suave para navegación */
html {
  scroll-behavior: smooth;
}

/* Mejor contraste para texto */
.obs-meta {
  color: #555;
}

.no-tasks,
.no-observations {
  color: #666;
}
</style>