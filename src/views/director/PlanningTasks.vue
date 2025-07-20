<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <h1 class="page-title">Tareas Planificadas</h1>
      <div v-if="planificacion" class="course-subtitle">
        {{ planificacion?.mes }} | Ciclo: {{ planificacion?.ciclo_escolar }} |
        <div class="estado-section">
          Estado: <span class="badge" :class="formatEstadoClass(planificacion.estado)">{{ planificacion.estado }}</span>
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
                  <td>{{ index + 1 }}</td>
                  <td>{{ tarea.tema_tarea }}</td>
                  <td>{{ tarea.puntos_tarea }}</td>
                </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="no-tasks">No hay tareas planificadas.</div>

      <!-- Observaciones del director (activas) -->
        <div class="observations-box">
            <h2>Agregar observación</h2>

            <!-- Formulario para crear o editar observación -->
            <form @submit.prevent="handleObservationSubmit" class="observation-form">
                <textarea v-model="nuevaObservacion" class="form-input" rows="3" placeholder="Escribe tu observación..." required />
                <button class="action-btn create" type="submit">
                {{ editingObservationId ? 'Actualizar' : 'Agregar' }}
                </button>
                <button v-if="editingObservationId" class="action-btn cancel" type="button" @click="cancelEditObservation">Cancelar</button>
            </form>

            <!-- Observaciones del director -->
            <div class="observations-section">
              <h2 class="observations-title"> Observaciones</h2>

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
                      </button>
                      <button @click="cancelEditObservation" class="action-btn cancel">
                        <X class="action-icon" />
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <p class="obs-text"> <strong>{{ obs.observaciones }}</strong></p>
                    <p class="obs-meta"> <em>{{ formatDate(obs.fecha) }}</em></p>
                    <!-- Botones de acciones -->
                    <div class="observation-actions">
                      <button @click="startEditObservation(obs)" class="action-btn edit">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="confirmDeleteObservation(obs.id)" class="action-btn delete">
                        <Trash class="action-icon" />
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
// Variables separadas para el estado de edición
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

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.no-tasks {
  text-align: center;
  color: #777;
  font-style: italic;
  margin: 2rem 0;
}

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
.observations-box {
  background-color: #f1f1f1;
  padding: 1.5rem;
  border-radius: 8px;
}
.observations-box h2 {
  margin-bottom: 1rem;
  color: #333;
}
.obs-text {
  margin: 0;
  color: #444;
}
.observations-title {
  padding-bottom: 1rem;
}
.obs-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.task-table th,
.task-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
.task-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}
.btn.small {
  font-size: 0.8rem;
  padding: 4px 8px;
  margin-right: 4px;
}
.observations-section {
  margin-top: 2rem;
  background: #fdfdfd;
  padding: 1.3rem 1rem;
  border-left: 5px solid #fdfdfd;
  border-radius: 6px;
}
.observation-card {
  margin-bottom: 1rem;
  padding: 1rem 1rem;
  background-color: #eef6fc;
  border-left: 4px solid #2c82c9;
  border-radius: 4px;
}
.no-observations {
  font-style: italic;
  color: #777;
  padding: 0.75rem;
}
.obs-text {
  font-size: 1rem;
  margin: 0;
  padding-block: 0.3rem;
}
.obs-meta {
  font-size: 0.85rem;
  color: #555;
  padding-block: 0.3rem;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}
.action-icon {
  width: 18px;
  height: 18px;
}
.observation-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.action-btn.edit {
  background-color: #fd7e14;
  color: white;
  border: none;
}
.action-btn.edit:hover {
  background-color: #e96b00;
}
.action-btn.delete {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
  border: none;
}
.action-btn.delete:hover {
  background-color: #bb2d3b;
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
}

.form-input:focus {
  border-color: #4a90e2;
  outline: none;
  background-color: #f9fcff;
}

.observations-box {
  margin-top: 3rem; 
  background-color: #f1f1f1;
  padding: 1.5rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .planning-tasks-container {
    padding: 1rem;
    margin-left: 0;
  }

  .data-table th, .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .estado-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .estado-buttons {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

.estado-section {
  margin-top: 1rem; 
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.estado-buttons {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

/* Estilos para badges de estado */
.badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
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

/* Inline editing styles for observations */
.inline-edit-container {
  padding: 1rem;
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
}

.inline-actions .action-btn {
  padding: 0.5rem !important;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
  padding: 0.75rem 1.5rem;
}

.action-btn.create:hover {
  background-color: #158a50;
}

.action-btn.edit {
  background-color: #f0ad4e;
  color: white;
  padding: 0.5rem;
}

.action-btn.edit:hover {
  background-color: #ec971f;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
  padding: 0.5rem;
}

.action-btn.delete:hover {
  background-color: #c9302c;
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
}
</style>