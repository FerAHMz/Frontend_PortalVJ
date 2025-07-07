<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <h1 class="page-title">Tareas Planificadas</h1>
      <div v-if="planificacion" class="course-subtitle">
        {{ planificacion?.mes }} | Ciclo: {{ planificacion?.ciclo_escolar }} |
        <div class="estado-section">
          Estado:
          <select v-model="nuevoEstado" @change="actualizarEstado" class="estado-dropdown">
            <option disabled value="">Selecciona estado</option>
            <option value="en revision">En revisión</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Tabla de tareas -->
        <table v-if="tareas.length" class="task-table">
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

        <div v-else class="no-tasks">No hay tareas planificadas.</div>

      <!-- Observaciones del director (activas) -->
        <div class="observations-box">
            <h2>Agregar observación</h2>

            <!-- Formulario para crear o editar observación -->
            <form @submit.prevent="handleObservationSubmit" class="observation-form">
                <textarea v-model="nuevaObservacion" class="form-input" rows="3" placeholder="Escribe tu observación..." required />
                <button class="btn primary" type="submit">
                {{ editingObservationId ? 'Actualizar' : 'Agregar' }}
                </button>
                <button v-if="editingObservationId" class="btn danger" type="button" @click="cancelEditObservation">Cancelar</button>
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

              <div v-else class="no-observations">
                No hay retroalimentación registrada para esta planificación
              </div>
            </div>
        </div>
        </main>
    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import planningService from '@/services/planningService'
import { useNotifications } from '@/utils/useNotifications.js'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
import { Edit, Trash } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()

const tareas = ref([])
const observaciones = ref([])
const planificacion = ref(null)
const courseId = route.params.courseId
const planId = route.params.planId
const nuevaObservacion = ref('')
const editingObservationId = ref(null)
const nuevoEstado = ref('')

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

const actualizarEstado = async () => {
  if (!nuevoEstado.value || nuevoEstado.value === planificacion.value.estado) return

  try {
    await planningService.updateEstado(courseId, planId, {
      estado: nuevoEstado.value
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
    nuevoEstado.value = planificacion.value.estado
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
  nuevaObservacion.value = obs.observaciones
  editingObservationId.value = obs.id
}

const confirmDeleteObservation = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta observación?')) return

  try {
    await planningService.deleteObservation(courseId, planId, id)
    showNotification('success', 'Observación eliminada correctamente')
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la observación')
    console.error(error)
  }
}

const cancelEditObservation = () => {
  nuevaObservacion.value = ''
  editingObservationId.value = null
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
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.course-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

.separator {
  height: 1px;
  background-color: #eee;
  margin: 1.5rem 0;
}

.task-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.form-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  min-width: 200px;
}

.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: 2rem;
}

.task-card {
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
  min-height: 130px;
}

.task-info h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.task-actions {
  margin-top: auto;
}

.btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-right: 8px;
  cursor: pointer;
}

.btn.primary {
  background-color: #1b9963;
  color: white;
}

.btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn.danger {
  background-color: #f44336;
  color: white;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: capitalize;
}
.badge.en\ revision { background: #856404; color: white; }
.badge.aceptada { background: #155724; color: white; }
.badge.rechazada { background: #721c24; color: white; }

.no-tasks {
  text-align: center;
  color: #777;
  font-style: italic;
  margin-bottom: 1rem;
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
  border-left: 5px solid #4a90e2;
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

.estado-dropdown {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.estado-dropdown:focus {
  border-color: #4a90e2;
  outline: none;
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

.estado-section {
  margin-top: 2rem; 
}

.observations-box {
  margin-top: 3rem; 
  background-color: #f1f1f1;
  padding: 1.5rem;
  border-radius: 8px;
}



</style>
