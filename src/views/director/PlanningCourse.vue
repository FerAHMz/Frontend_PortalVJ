<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <h1 class="text-page-title">Planificación del Curso</h1>
      <div class="course-subtitle">{{ courseData?.materia }} | Grado: {{ courseData?.grado }} | Sección: {{ courseData?.seccion }}</div>
      <div class="separator"></div>

      <div v-if="planificaciones.length === 0" class="no-planning">
        No hay planificaciones registradas para este curso.
      </div>

      <!-- Vista de tabla para desktop -->
      <div class="table-container desktop-view">
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

      <!-- Vista de tarjetas para móvil -->
      <div class="cards-container mobile-view">
        <div v-for="plan in planificaciones" :key="plan.id" class="planning-card">
          <div class="card-header">
            <h3 class="card-title">Plan #{{ plan.id }}</h3>
            <span class="badge" :class="formatEstadoClass(plan.estado)">{{ plan.estado }}</span>
          </div>
          <div class="card-content">
            <div class="card-row">
              <span class="card-label">Trimestre:</span>
              <span class="card-value">{{ plan.mes }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Ciclo Escolar:</span>
              <span class="card-value">{{ plan.ciclo_escolar }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="action-btn view mobile" @click="goToTasks(plan.id)">
              <BookOpen class="action-icon" />
              Ver Tareas
            </button>
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
    path: `/director/planning/${route.params.courseId}/tasks/${planId}`,
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
  background-color: #fff;
  min-height: 100vh;
}

.text-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
}

.course-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.4;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

.no-planning {
  text-align: center;
  color: #777;
  font-style: italic;
  margin: 2rem 0;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

/* Vista de tabla para desktop */
.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
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
  color: #333;
  font-size: 0.95rem;
}

.data-table tbody tr {
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.view {
  background-color: #1b9963;
  color: white;
}

.action-btn.view:hover {
  background-color: #158a50;
  transform: translateY(-1px);
}

.action-icon {
  width: 18px;
  height: 18px;
}

/* Vista de tarjetas para móvil */
.cards-container {
  display: grid;
  gap: 1rem;
}

.planning-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.2s ease;
}

.planning-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-content {
  padding: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-row:last-child {
  margin-bottom: 0;
}

.card-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  color: #333;
  font-size: 0.9rem;
}

.card-actions {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-btn.mobile {
  width: 100%;
  justify-content: center;
  padding: 0.8rem;
}

/* Badges */
.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  line-height: 1;
  font-family: inherit;
}

.badge.en-revision {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.badge.aceptada {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.badge.rechazada {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive breakpoints */
@media screen and (max-width: 1024px) {
  .planning-container {
    padding: 1.5rem;
  }
  
  .text-page-title {
    font-size: 1.8rem;
  }
  
  .data-table th, .data-table td {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}

@media screen and (max-width: 768px) {
  .planning-container {
    padding: 1rem;
  }
  
  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .course-subtitle {
    text-align: center;
    font-size: 0.9rem;
    padding: 0 1rem;
  }
  
  /* Ocultar tabla en móvil y mostrar tarjetas */
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: block;
  }
  
  .no-planning {
    margin: 1rem 0;
    padding: 1.5rem;
    font-size: 0.9rem;
  }
}

@media screen and (max-width: 480px) {
  .planning-container {
    padding: 0.75rem;
  }
  
  .text-page-title {
    margin-bottom: 0.8rem;
  }
  
  .course-subtitle {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  
  .separator {
    margin-bottom: 1rem;
  }
  
  .planning-card {
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  
  .card-header {
    padding: 0.8rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-content {
    padding: 0.8rem;
  }
  
  .card-actions {
    padding: 0.8rem;
  }
  
  .card-label, .card-value {
    font-size: 0.85rem;
  }
  
  .badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
  
  .action-btn.mobile {
    font-size: 0.85rem;
  }
}

@media screen and (max-width: 360px) {
  .course-subtitle {
    font-size: 0.8rem;
    line-height: 1.3;
  }
  
  .card-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
  
  .card-value {
    font-weight: 500;
  }
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .planning-card,
  .action-btn,
  .data-table tbody tr {
    transition: all 0.3s ease;
  }
}
</style>
