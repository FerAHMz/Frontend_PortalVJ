<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="course-detail-container">
      <h1 class="page-title">{{ courseData?.materia }} - Calificaciones</h1>
      <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
        Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
      </div>
      <div class="separator"></div>
      
      <CardList :items="gradeOptions" @item-clicked="handleOptionClick">
        <template #item="{ item }">
          <div class="option-item">
            <span>{{ item.label }}</span>
          </div>
        </template>
      </CardList>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import CardList from '@/components/CardList.vue'
import CreateTaskForm from '@/views/CreateTaskForm.vue'
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

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays },
  { label: 'Boleta de calificaciones', icon: FileText },
  { label: 'Comunicación', icon: MessageSquare }
]

const gradeOptions = [
  { label: 'Crear tarea', path: 'create-task' },
  { label: 'Ver tareas', path: 'view-task' },
  { label: 'Registrar nota', path: 'register-grade' },
  { label: 'Ver calificaciones', path: 'view-grades' },
  { label: 'Boleta de calificaciones', path: 'report' }
]

onMounted(() => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    courseData.value = JSON.parse(savedCourse)
  }
})

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const handleOptionClick = (option) => {
  if (option.path === 'create-task') {
    router.push(`/teacher/courses/${route.params.courseId}/create-task`)
  }
}

const handleTaskCreated = (taskId) => {
  console.log('Task created:', taskId)
  showCreateTask.value = false
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.course-detail-container {
  flex: 1;
  padding: 2rem;
  background: white;
  overflow: auto;
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
  width: 100%;
}

.option-item {
  padding: 0.5rem 0;
  font-size: 1.1rem;
}
</style>