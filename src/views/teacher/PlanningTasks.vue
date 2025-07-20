<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <h1 class="page-title">Tareas Planificadas</h1>
      <div class="course-subtitle" v-if="planificacion">
        {{ planificacion.mes }} | Ciclo: {{ planificacion.ciclo_escolar }} |
        Estado:
        <span class="badge" :class="planificacion.estado">{{ planificacion.estado }}</span>
       </div>
      <div class="separator"></div>

      <!-- Formulario para agregar tarea (si editable) -->
      <form @submit.prevent="handleSubmit" class="task-form" v-if="planificacion?.estado === 'en revision'">
        <input v-model="tema" placeholder="Tema de la tarea" class="form-input" required />
        <input v-model.number="puntos" type="number" min="0" step="0.5" placeholder="Puntaje" class="form-input" required />
        <button type="submit" class="btn primary">
          {{ isEditing ? 'Actualizar tarea' : 'Agregar tarea' }}
        </button> 
        <button v-if="isEditing" type="button" class="btn warning" @click="cancelEdit">Cancelar</button>
      </form>

      <!-- Tabla de tareas -->
        <table v-if="tareas.length" class="task-table">
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
            <td>{{ tarea.tema_tarea }}</td>
            <td>{{ tarea.puntos_tarea }}</td>
            <td v-if="planificacion.estado === 'en revision'">
                <button @click="editTask(tarea)" class="action-btn edit">
                  <Edit class="action-icon" />
                </button>
                <button @click="deleteTask(tarea.id)" class="action-btn delete">
                  <Trash class="action-icon" />
                </button>
            </td>
            </tr>
        </tbody>
        </table>

        <div v-else class="no-tasks">No hay tareas planificadas.</div>


      <!-- Observaciones del director -->
      <div class="observations-section">
        <h2 class="observations-title"> Observaciones del director</h2>

        <div v-if="observaciones.length">
          <div
            v-for="obs in observaciones"
            :key="obs.id"
            class="observation-card"
          >
            <p class="obs-text"> <strong>{{ obs.observaciones }}</strong></p>
            <p class="obs-meta"> <em>{{ formatDate(obs.fecha) }}</em></p>
          </div>
        </div>

        <div v-else class="no-observations">
          No hay retroalimentación registrada para esta planificación.
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
const tema = ref('')
const puntos = ref(null)
const courseId = route.params.courseId
const planId = route.params.planId
const isEditing = ref(false)
const taskBeingEdited = ref(null)
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
  if (!tema.value || puntos.value === null) return
  try {
    if (isEditing.value && taskBeingEdited.value) {
      // EDITAR
      await planningService.updateTask(courseId, planId, taskBeingEdited.value.id, {
        tema_tarea: tema.value,
        puntos_tarea: puntos.value
      })
      showNotification('success', 'Editado', 'Tarea actualizada')
    } else {
      // CREAR NUEVA
      await planningService.createTask(courseId, planId, {
        tema_tarea: tema.value,
        puntos_tarea: puntos.value
      })
      showNotification('success', 'Agregada', 'Tarea registrada')
    }
    // Reset
    tema.value = ''
    puntos.value = null
    isEditing.value = false
    taskBeingEdited.value = null
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo guardar la tarea')
    console.error(error)
  }
}
const deleteTask = async (taskId) => {
  if (!confirm('¿Eliminar esta tarea?')) return
  try {
    await planningService.deleteTask(courseId, planId, taskId)
    showNotification('success', 'Tarea eliminada')
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la tarea')
    console.error(error)
  }
}
const editTask = (tarea) => {
  tema.value = tarea.tema_tarea
  puntos.value = tarea.puntos_tarea
  taskBeingEdited.value = tarea
  isEditing.value = true
}
const cancelEdit = () => {
  isEditing.value = false
  taskBeingEdited.value = null
  tema.value = ''
  puntos.value = null
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
  margin-left: 150px; /* Compensar el sidebar */
  margin-right: 2rem; /* Margen derecho para balance */
  width: calc(100vw - 170px); /* Usar todo el espacio disponible */
  box-sizing: border-box;
}

/* Responsive design */
@media screen and (max-width: 1024px) {
  .planning-tasks-container {
    margin-left: 130px;
    width: calc(100vw - 150px);
    padding: 1.5rem;
  }
}

@media screen and (max-width: 768px) {
  .planning-tasks-container {
    margin-left: 0;
    width: 100vw;
    padding: 1rem;
  }
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
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  line-height: 1;
  font-family: inherit;
}

.badge.en-revision { 
  background-color: #f9e723; 
  color: #333; 
}

.badge.aceptada { 
  background-color: #5cc30d; 
  color: white; 
}

.badge.rechazada { 
  background-color: #f00b0b; 
  color: white; 
}
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
  min-width: 600px; /* Mínimo ancho para evitar compresión excesiva */
}

.task-table th,
.task-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
  word-wrap: break-word;
}

.task-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Responsive table */
@media screen and (max-width: 768px) {
  .task-table {
    font-size: 0.9rem;
    min-width: auto;
  }
  
  .task-table th,
  .task-table td {
    padding: 8px;
  }
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
</style>