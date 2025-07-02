<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <h1 class="page-title">Planificación del Curso</h1>
      <div class="course-subtitle">{{ courseData?.materia }} | Grado: {{ courseData?.grado }} | Sección: {{ courseData?.seccion }}</div>
      <div class="separator"></div>

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
const courseId = route.params.courseId

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

.planning-table {
  width: 100%;
  border-collapse: collapse;
}

.planning-table th,
.planning-table td {
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
</style>
