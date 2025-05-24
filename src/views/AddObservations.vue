<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="add-observation-container">
        <div v-if="alert.show" :class="['alert', alert.type]">
          {{ alert.message }}
        </div>
        <h1 class="page-title">Registrar observaciones</h1>
        <div class="course-subtitle" v-if="courseData && studentData">
          {{ courseData.materia }} | Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }} | Estudiante:  {{  studentData.nombre }} | Carnet:  {{  studentData.carnet }}
        </div>
        <div class="separator"></div>
        
        <form @submit.prevent="handleSubmit" class="observation-form">
          <!-- Task Selection Section -->
            <div class="form-group">
                <label for="taskSelect">Vincular a una tarea</label>
                <select id="taskSelect" v-model="selectedTaskId" class="form-input">
                  <option :value="null">No vincular a ninguna tarea</option>
                  <option v-for="task in tasks" :key="task.id" :value="task.id">
                    {{ task.titulo }} - {{ formatDate(task.fecha_entrega) }}
                  </option>
                </select>
            </div>
            <div class="form-group">
            <label for="observation">Observaciones</label>
            <textarea 
              id="observations" 
              v-model="obsData.observaciones" 
              required
              class="form-input"
            ></textarea>
          </div>
  
          <div class="form-group">
            <label for="action-points">Puntos de acción</label>
            <textarea 
              id="action_points" 
              v-model="obsData.puntos_de_accion" 
              required
              class="form-input"
            ></textarea>
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
  import {
    User,
    ClipboardList,
    BookOpen,
    CalendarDays,
    FileText,
    MessageSquare
  } from 'lucide-vue-next'
  import observationsService from '@/services/observationsService'
  
  const props = defineProps({
    courseId: {
      type: String,
      required: true
    }
  })
  
  const route = useRoute()
  const router = useRouter()
  const courseData = ref(null)
  const studentData = ref(null)
  const tasks = ref([])
  const selectedTaskId = ref(null)
  
  onMounted(async () => {

    const student = sessionStorage.getItem('studentData')
    if (student) {
      studentData.value = JSON.parse(student)
    }

    const savedCourse = sessionStorage.getItem('currentCourse')
    if (savedCourse) {
      courseData.value = JSON.parse(savedCourse)
      await fetchTasks()
    } else {
      router.back()
    }
  })
  
  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays },
    { label: 'Boleta de calificaciones', icon: FileText },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
  ]
  
  const obsData = ref({
    id_tarea: null,
    observaciones: '',
    puntos_de_accion: ''
   
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const handleSubmit = async () => {
    try {
      obsData.value.id_tarea = selectedTaskId.value || null

      const response = await observationsService.createObservations(
        route.params.carnet_estudiante,
        route.params.courseId,
        obsData.value
      )

      if (response.success) {
        alert.value = {
          show: true,
          message: 'Observación agregada exitosamente',
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
        message: 'Error al agregar la observación',
        type: 'error'
      }
      console.error('Error creating observation:', error)
    }
  }


  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/teacher/courses/${route.params.courseId}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      tasks.value = data
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  </script>
  
  <style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }
  
  .add-observation-container {
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
  
  .observation-form {
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