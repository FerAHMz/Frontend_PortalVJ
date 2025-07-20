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

      <div class="table-container">
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
              <td>{{ plan.mes }}</td>
              <td>{{ plan.ciclo_escolar }}</td>
              <td>
                <span class="badge" :class="formatEstadoClass(plan.estado)">{{ plan.estado }}</span>
              </td>
              <td class="actions">
                <button class="action-btn view" @click="goToTasks(plan.id)">
                  <BookOpen class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
import { User, BookOpen, BarChart3, Users } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'
const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const courseData = ref(null)
const planificaciones = ref([])
const courseId = route.params.courseId
const menuItems = [
  { label: 'Perfil', icon: User, path: '/director' },
  { label: 'Gestión Académica', icon: BookOpen, path: '/director/academic' },
  { label: 'Reportes', icon: BarChart3, path: '/director/reports' },
  { label: 'Personal', icon: Users, path: '/director/staff' }
]
const formatEstadoClass = (estado) => {
  return estado.toLowerCase().replace(/\s/g, '-');
}
const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}
const goToTasks = (planId) => {
  router.push({
    name: 'PlanningTasksDir',
    params: { courseId: route.params.courseId, planId: planId },
    state: { courseData: courseData.value }
  })
}
const fetchPlanning = async () => {
  try {
    const data = await planningService.fetchByCourse(courseId)
    console.log('courseId:', courseId)
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

.actions {
  display: flex;
  gap: 0.5rem;
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
}

.action-btn.view {
  background-color: #1b9963;
  color: white;
}

.action-btn.view:hover {
  background-color: #158a50;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.no-planning {
  text-align: center;
  color: #777;
  font-style: italic;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .planning-container {
    padding: 1rem;
    margin-left: 0;
  }

  .data-table th, .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
}
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
.btn {
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-right: 8px;
  cursor: pointer;
}
.btn.primary {
  background-color: #1b9963;
  margin-top: 20px;
  height: 40px;
  color: white;
}
.btn.danger {
  background-color: #f44336;
  color: white;
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
.action-btn.add {
  background-color:  #70c873;; 
  color: white;
  border: none;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  height: 35px;
}
.action-btn.mustard:hover {
  background-color: #469e49;
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
.action-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap; 
}
</style>