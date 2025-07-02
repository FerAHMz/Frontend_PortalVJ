<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <h1 class="page-title">Planificación del Curso</h1>
      <div class="course-subtitle">{{ courseData?.materia }} | Grado: {{ courseData?.grado }} | Sección: {{ courseData?.seccion }}</div>
      <div class="separator"></div>

      <!-- Formulario para crear planificación -->
      <form @submit.prevent="submitPlanning" class="planning-form">
        <div class="form-group">
          <label for="mes">Mes</label>
          <select v-model="mes" class="form-input" required>
            <option disabled value="">Selecciona un mes</option>
            <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ciclo">Ciclo escolar</label>
          <input v-model="ciclo" type="text" class="form-input" required placeholder="Ej. 2025" />
        </div>

        <button class="btn primary" type="submit">
            {{ isEditing ? 'Actualizar planificación' : 'Crear planificación' }}
        </button>
      </form>

      <div v-if="planificaciones.length === 0" class="no-planning">
        No hay planificaciones registradas para este curso.
      </div>

      <table v-else class="planning-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mes</th>
            <th>Ciclo Escolar</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in planificaciones" :key="plan.id">
            <td>{{ plan.id }}</td>
            <td>{{ plan.mes }}</td>
            <td>{{ plan.ciclo_escolar }}</td>
            <td>
              <span class="badge" :class="plan.estado">{{ plan.estado }}</span>
            </td>
            <td>
              <button class="btn primary" @click="goToTasks(plan.id)">Agregar tareas</button>
              <button class="btn warning" @click="editPlanning(plan)">Editar</button>
              <button class="btn danger" @click="deletePlanning(plan.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
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
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()

const courseData = ref(null)
const planificaciones = ref([])
const mes = ref('')
const ciclo = ref('')
const meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]
const courseId = route.params.courseId
const isEditing = ref(false)
const editingId = ref(null)

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

const fetchPlanning = async () => {
  try {
    const data = await planningService.fetchByCourse(courseId)
    planificaciones.value = data
  } catch (error) {
    showNotification('error', 'Error', 'No se pudieron cargar las planificaciones')
    console.error(error)
  }
}

const submitPlanning = async () => {
  try {
    if (isEditing.value) {
      await planningService.update(courseId, editingId.value, {
        mes: mes.value,
        ciclo_escolar: ciclo.value
      })
      showNotification('success', 'Actualizado', 'Planificación actualizada')
    } else {
      await planningService.create(courseId, { 
        mes: mes.value,
        ciclo_escolar: ciclo.value
      })
      showNotification('success', 'Creado', 'Planificación creada')
    }

    mes.value = ''
    ciclo.value = ''
    isEditing.value = false
    editingId.value = null
    await fetchPlanning()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo guardar la planificación')
    console.error(error)
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

const editPlanning = (plan) => {
  mes.value = plan.mes
  ciclo.value = plan.ciclo_escolar
  editingId.value = plan.id
  isEditing.value = true
}

const deletePlanning = async (planId) => {
  if (!confirm('¿Estás seguro de eliminar esta planificación?')) return
  try {
    await planningService.delete(courseId, planId)
    planificaciones.value = planificaciones.value.filter(p => p.id !== planId)
    showNotification('success', 'Eliminado', 'Planificación eliminada')
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la planificación')
    console.error(error)
  }
}

onMounted(async () => {
  const course = sessionStorage.getItem('currentCourse')
  if (course) {
    courseData.value = JSON.parse(course)
  }
  await fetchPlanning()
})
</script>

<style scoped>
.planning-container {
  padding: 2rem;
  max-width: 1200px;
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

.planning-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  min-width: 200px;
}

.planning-table {
  width: 100%;
  border-collapse: collapse;
}

.planning-table th, .planning-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.planning-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.badge.en\ revision {
  background-color: #ffe58f;
  color: #8c6d1f;
}

.badge.aceptada {
  background-color: #b7eb8f;
  color: #389e0d;
}

.badge.rechazada {
  background-color: #ffa39e;
  color: #a8071a;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 8px;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.danger {
  background-color: #f44336;
  color: white;
}
</style>
