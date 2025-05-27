<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="course-detail-container">
      <div v-if="alert.show" :class="['alert', alert.type]">
        {{ alert.message }}
      </div>
      <h1 class="page-title">Crear tarea</h1>
      <div class="course-subtitle" v-if="courseData">
        {{ courseData.materia }} | Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
      </div>
      <div class="separator"></div>
      
      <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-group">
          <label for="titulo">Título</label>
          <input 
            type="text" 
            id="titulo" 
            v-model="taskData.titulo" 
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea 
            id="descripcion" 
            v-model="taskData.descripcion" 
            required
            class="form-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="valor">Valor</label>
          <input 
            type="number" 
            id="valor" 
            v-model="taskData.valor" 
            required
            min="0"
            max="100"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="fecha">Fecha de entrega</label>
          <input 
            type="date" 
            id="fecha" 
            v-model="taskData.fecha_entrega" 
            required
            class="form-input"
          >
        </div>

        <div class="form-actions">
          <button type="button" class="btn cancel" @click="handleCancel">Cancelar</button>
          <button type="submit" class="btn primary">Guardar</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import taskService from '@/services/taskService'
import {
  User,
  ClipboardList,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare
} from 'lucide-vue-next'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const courseData = ref(null)

onMounted(async () => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    courseData.value = JSON.parse(savedCourse)
  } else {
    router.back()
  }
})

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const taskData = ref({
  titulo: '',
  descripcion: '',
  valor: '',
  fecha_entrega: ''
})

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const handleCancel = () => {
  router.back()
}

const alert = ref({
  show: false,
  message: '',
  type: 'success'
})

const handleSubmit = async () => {
  try {
    const response = await taskService.createTask(route.params.courseId, taskData.value)
    if (response.success) {
      alert.value = {
        show: true,
        message: 'Tarea creada exitosamente',
        type: 'success'
      }
      setTimeout(() => {
        alert.value.show = false
        router.back()
      }, 2000)
    }
  } catch (error) {
    alert.value = {
      show: true,
      message: 'Error al crear la tarea',
      type: 'error'
    }
    console.error('Error creating task:', error)
  }
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

.task-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.primary {
  background: #0f9d58;
  color: white;
}

.primary:hover {
  background: #0b8043;
}

.cancel {
  background: #ddd;
}

.cancel:hover {
  background: #ccc;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>