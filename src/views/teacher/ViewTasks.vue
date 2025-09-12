<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="tasks-container">
      <!-- Header responsive -->
      <ArrowBack 
        :use-history-back="true"
        :show-text="true"
        text="Volver"
        @before-back="saveViewState"
      />
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ courseData?.materia }} - Tareas</h1>
          <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
            <span class="course-info">Grado: {{ courseData.grado }}</span>
            <span class="course-divider">|</span>
            <span class="course-info">Sección: {{ courseData.seccion }}</span>
          </div>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Barra de búsqueda responsive -->
      <div class="search-container">
        <div class="search-wrapper">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por título o valor..."
            class="search-input"
          >
          <div class="search-icon">🔍</div>
        </div>
        <div class="results-count" v-if="searchQuery">
          {{ filteredTasks.length }} resultado{{ filteredTasks.length !== 1 ? 's' : '' }} encontrado{{ filteredTasks.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Lista de tareas responsive -->
      <div class="tasks-list">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Cargando tareas...</p>
        </div>
        <div v-else-if="filteredTasks.length === 0" class="no-tasks">
          <div class="no-tasks-icon">📋</div>
          <h3>No se encontraron tareas</h3>
          <p v-if="searchQuery">Intenta con otros términos de búsqueda</p>
          <p v-else>Aún no hay tareas creadas para este curso</p>
        </div>
        <div v-else>
          <!-- Vista de tabla para desktop -->
          <div class="table-container desktop-view">
            <table class="tasks-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Fecha de Entrega</th>
                  <th>Valor</th>
                  <th>Trimestre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in filteredTasks" :key="task.id">
                  <td>
                    <div class="task-title">{{ task.titulo }}</div>
                  </td>
                  <td>
                    <div class="task-description">{{ task.descripcion }}</div>
                  </td>
                  <td>
                    <div class="task-date">{{ formatDate(task.fecha_entrega) }}</div>
                  </td>
                  <td>
                    <div class="task-value">{{ task.valor }} pts</div>
                  </td>
                  <td>
                    <div class="task-trimester">{{ task.nombre_trimestre || 'Sin asignar' }}</div>
                  </td>
                  <td>
                    <button @click="viewTaskDetails(task)" class="view-btn desktop-btn">
                      Ver detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista de tarjetas para móvil -->
          <div class="cards-container mobile-view">
            <div v-for="task in filteredTasks" :key="task.id" class="task-card">
              <div class="card-header">
                <h3 class="card-title">{{ task.titulo }}</h3>
                <span class="card-value">{{ task.valor }} pts</span>
              </div>
              
              <div class="card-body">
                <div class="card-field">
                  <label>Descripción:</label>
                  <p>{{ task.descripcion }}</p>
                </div>
                
                <div class="card-info-row">
                  <div class="card-field">
                    <label>Fecha de entrega:</label>
                    <p>{{ formatDate(task.fecha_entrega) }}</p>
                  </div>
                  
                  <div class="card-field">
                    <label>Trimestre:</label>
                    <p>{{ task.nombre_trimestre || 'Sin asignar' }}</p>
                  </div>
                </div>
              </div>
              
              <div class="card-actions">
                <button @click="viewTaskDetails(task)" class="view-btn mobile-btn">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import ArrowBack from '@/components/common/ArrowBack.vue'
import {
  User,
  ClipboardList,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const courseData = ref(null)
const tasks = ref([])
const loading = ref(true)
const searchQuery = ref('')

// Función para guardar el estado de la vista
const saveViewState = () => {
  localStorage.setItem('tasksViewState', JSON.stringify({
    searchQuery: searchQuery.value,
    scrollPosition: window.scrollY
  }))
}

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchTasks = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    const response = await fetch(`http://localhost:3000/api/teacher/courses/${route.params.courseId}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 404) {
      tasks.value = []
      return
    }

    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response body:', responseText)

    if (responseText) {
      const data = JSON.parse(responseText)
      tasks.value = Array.isArray(data) ? data : []
    } else {
      tasks.value = []
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const viewTaskDetails = (task) => {
  sessionStorage.setItem('selectedTask', JSON.stringify(task))
  router.push(`/teacher/courses/${route.params.courseId}/register-grade`)
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

onMounted(() => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    courseData.value = JSON.parse(savedCourse)
  }
  fetchTasks()
})

const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value
  
  const query = searchQuery.value.toLowerCase()
  return tasks.value.filter(task => 
    task.titulo.toLowerCase().includes(query) || 
    task.descripcion.toLowerCase().includes(query) ||
    task.valor.toString().includes(query)
  )
})
</script>

<style scoped>
/* Layout principal */
.layout {
  display: flex;
  min-height: 100vh;
}

.tasks-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header con ArrowBack */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  width: 100%;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
}

.course-subtitle {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  color: #6b7280;
  font-size: 1rem;
}

.course-info {
  font-weight: 500;
}

.course-divider {
  color: #d1d5db;
}

/* Header responsive */
.header-section {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 0.5rem;
}

.course-subtitle {
  color: #555;
  font-size: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.course-info {
  white-space: nowrap;
}

.course-divider {
  color: #999;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Barra de búsqueda responsive */
.search-container {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 500px;
  margin-bottom: 0.5rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  padding-right: 3rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #1b9963;
  box-shadow: 0 0 0 3px rgba(27, 153, 99, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.results-count {
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

/* Estados de carga y vacío */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-tasks {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-tasks-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-tasks h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

/* Vista de tabla para desktop */
.desktop-view {
  display: block !important;
}

.mobile-view,
.cards-container {
  display: none !important;  /* Esto asegura que las cards no se muestren en desktop */
}

.task-card {
  display: none !important;  /* Ocultar todas las cards individualmente en desktop */
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.tasks-table th,
.tasks-table td {
  padding: 1.25rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.tasks-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tasks-table tbody tr {
  transition: background-color 0.2s ease;
}

.tasks-table tbody tr:hover {
  background-color: #f8f9fa;
}

.task-title {
  font-weight: 600;
  color: #333;
}

.task-description {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-date {
  color: #666;
  font-size: 0.9rem;
}

.task-value {
  font-weight: 600;
  color: #1b9963;
}

.task-trimester {
  color: #666;
  font-size: 0.9rem;
}

/* Botones */
.view-btn {
  background: #1b9963;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-btn:hover {
  background: #158a50;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 153, 99, 0.3);
}

/* Vista de tarjetas para móvil */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 1.25rem;
  background: linear-gradient(135deg, #1b9963 0%, #158a50 100%);
  color: white;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  margin-right: 1rem;
}

.card-value {
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.card-body {
  padding: 1.25rem;
}

.card-field {
  margin-bottom: 1rem;
}

.card-field:last-child {
  margin-bottom: 0;
}

.card-field label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.card-field p {
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.card-info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.card-actions {
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.mobile-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

/* Responsive breakpoints */
@media screen and (max-width: 1200px) {
  .table-container {
    overflow-x: auto;
  }
  
  .tasks-table {
    min-width: 800px;
  }
}

@media screen and (max-width: 768px) {
  .tasks-container {
    margin-left: 0;
    padding: 1rem;
    padding-top: 80px;
  }
  
  /* Header móvil */
  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .course-subtitle {
    justify-content: center;
    text-align: center;
    font-size: 1rem;
  }
  
  .course-divider {
    display: none;
  }
  
  .course-info {
    display: block;
    width: 100%;
    text-align: center;
  }
  
  /* Cambiar a vista de tarjetas - SOLO EN MÓVIL */
  .desktop-view {
    display: none !important;
  }
  
  .mobile-view,
  .cards-container {
    display: block !important;
  }
  
  .task-card {
    display: block !important;  /* Mostrar cards en móvil */
  }
  
  /* Búsqueda móvil */
  .search-wrapper {
    max-width: 100%;
  }
  
  .search-input {
    font-size: 16px; 
  }
  
  /* Tarjetas móvil */
  .card-info-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

@media screen and (max-width: 480px) {
  .tasks-container {
    padding: 0.75rem;
    padding-top: 75px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .course-subtitle {
    font-size: 0.9rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-actions {
    padding: 0.75rem 1rem;
  }
}

/* Scroll suave para tabla */
.table-container {
  scrollbar-width: thin;
  scrollbar-color: #1b9963 #f1f1f1;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #1b9963;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #158a50;
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .task-card,
  .view-btn,
  .search-input {
    transition: all 0.3s ease;
  }
}
</style>