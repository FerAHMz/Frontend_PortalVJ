<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="tasks-container">
      <h1 class="page-title">{{ courseData?.materia }} - Tareas</h1>
      <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
        Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
      </div>
      <div class="separator"></div>

      <div class="tasks-list">
        <div v-if="loading" class="loading">Cargando tareas...</div>
        <div v-else-if="tasks.length === 0" class="no-tasks">
          No hay tareas creadas para este curso
        </div>
        <div v-else class="table-container">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha de Entrega</th>
                <th>Valor</th>
                <th>Trimestre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in tasks" :key="task.id">
                <td>{{ task.titulo }}</td>
                <td>{{ formatDate(task.fecha_entrega) }}</td>
                <td>{{ task.valor }} pts</td>
                <td>{{ task.nombre_trimestre || 'Sin asignar' }}</td>
                <td>
                  <button @click="viewTaskDetails(task)" class="view-btn">
                    Ver detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
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

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays },
  { label: 'Boleta de calificaciones', icon: FileText },
  { label: 'Comunicación', icon: MessageSquare }
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
  router.push(`/teacher/courses/${route.params.courseId}/tasks/${task.id}`)
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
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.tasks-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
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
  margin-bottom: 1rem;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.tasks-table th,
.tasks-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.tasks-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.tasks-table tr:hover {
  background-color: #f8f9fa;
}

.view-btn {
  background: #1b9963;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.view-btn:hover {
  background: #158a50;
}

.loading, .no-tasks {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}
</style>