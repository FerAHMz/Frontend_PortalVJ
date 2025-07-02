<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <h1 class="page-title">Tareas Planificadas</h1>
      <div class="course-subtitle">
        {{ planificacion?.mes }} | Ciclo: {{ planificacion?.ciclo_escolar }} |
        Estado:
        <span class="badge" :class="planificacion.estado">{{ planificacion.estado }}</span>
      </div>
      <div class="separator"></div>

      <!-- Formulario para agregar tarea (si editable) -->
      <form @submit.prevent="handleSubmit" class="task-form" v-if="planificacion?.estado === 'en revision'">
        <input v-model="tema" placeholder="Tema de la tarea" class="form-input" required />
        <input v-model.number="puntos" type="number" min="0" step="0.5" placeholder="Puntaje" class="form-input" required />
        <button type="submit" class="btn primary">Agregar tarea</button>
        <button v-if="isEditing" type="button" class="btn warning" @click="cancelEdit">Cancelar</button>
      </form>

      <!-- Tarjetas de tareas -->
      <div v-if="tareas.length === 0" class="no-tasks">No hay tareas planificadas.</div>

      <div class="card-grid">
        <div class="task-card" v-for="tarea in tareas" :key="tarea.id">
            <div class="task-info">
            <h3>{{ tarea.tema_tarea }}</h3>
            <p><strong>Puntaje:</strong> {{ tarea.puntos_tarea }}</p>
            </div>
        </div>
      </div>

      <!-- Observaciones del director (activas) -->
        <div class="observations-box">
            <h2>Observaciones del director</h2>

            <!-- Formulario para crear o editar observación -->
            <form @submit.prevent="handleObservationSubmit" class="observation-form">
                <textarea v-model="nuevaObservacion" class="form-input" rows="3" placeholder="Escribe tu observación..." required />
                <button class="btn primary" type="submit">
                {{ editingObservationId ? 'Actualizar' : 'Agregar' }} observación
                </button>
                <button v-if="editingObservationId" class="btn danger" type="button" @click="cancelEditObservation">Cancelar</button>
            </form>

            <!-- Lista de observaciones -->
            <ul>
                <li v-for="obs in observaciones" :key="obs.id">
                <p class="obs-text">🗒️ {{ obs.observaciones }}</p>
                <p class="obs-meta">📅 {{ formatDate(obs.fecha) }}</p>
                <div class="obs-actions">
                    <button class="btn small warning" @click="startEditObservation(obs)">Editar</button>
                    <button class="btn small danger" @click="deleteObservation(obs.id)">Eliminar</button>
                </div>
                </li>
            </ul>
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
const nuevaObservacion = ref('')
const editingObservationId = ref(null)

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
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo cargar la planificación')
    console.error(error)
  }
}

const handleObservationSubmit = async () => {
  try {
    if (editingObservationId.value) {
      await planningService.updateObservation(courseId, editingObservationId.value, planId, {
        observaciones: nuevaObservacion.value
      })
      showNotification('success', 'Observación actualizada')
    } else {
      await planningService.createObservation({
        courseId,
        id_planificacion: planId,
        planId,
        id_director: localStorage.getItem('userId'), // ajusta según tu auth
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

const cancelEditObservation = () => {
  nuevaObservacion.value = ''
  editingObservationId.value = null
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
  background-color: #4CAF50;
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
.badge.en\ revision { background: #fff3cd; color: #856404; }
.badge.aceptada { background: #d4edda; color: #155724; }
.badge.rechazada { background: #f8d7da; color: #721c24; }

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

.obs-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}
</style>
