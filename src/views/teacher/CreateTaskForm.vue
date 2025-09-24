<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="course-detail-container">
      <div v-if="alert.show" :class="['alert', alert.type]">
        {{ alert.message }}
      </div>
      
      <!-- Header responsive -->
      <ArrowBack 
        :disabled="formHasChanges && !isSubmitting"
        tooltip="Guarda los cambios antes de salir"
        @before-back="checkUnsavedChanges"
        :show-text="true"
        text="Cancelar"
      />
      <div class="page-header">
        <div class="header-content">
          <h1 class="text-page-title">Crear tarea</h1>
          <div class="course-subtitle" v-if="courseData">
            <span class="course-info">{{ courseData.materia }}</span>
            <span class="course-divider">|</span>
            <span class="course-info">Grado: {{ courseData.grado }}</span>
            <span class="course-divider">|</span>
            <span class="course-info">Sección: {{ courseData.seccion }}</span>
          </div>
        </div>
      </div>
      
      <div class="separator"></div>
      
      <!-- Formulario responsive -->
      <div class="form-wrapper">
        <form @submit.prevent="handleSubmit" class="task-form">
          <div class="form-group">
            <label for="titulo">Título</label>
            <input 
              type="text" 
              id="titulo" 
              v-model="taskData.titulo" 
              required
              class="form-input"
              placeholder="Ingrese el título de la tarea"
            >
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea 
              id="descripcion" 
              v-model="taskData.descripcion" 
              required
              class="form-input"
              placeholder="Describa los detalles de la tarea"
            ></textarea>
          </div>

          <!-- Campos en fila para desktop -->
          <div class="form-row">
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
                placeholder="0-100"
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
          </div>

          <!-- Botones responsive -->
          <div class="form-actions">
            <button type="button" class="btn cancel" @click="handleCancel">
              Cancelar
            </button>
            <button type="submit" class="btn primary">
              Guardar tarea
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import ArrowBack from '@/components/common/ArrowBack.vue'
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
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const taskData = ref({
  titulo: '',
  descripcion: '',
  valor: '',
  fecha_entrega: ''
})

// Estado para el manejo de cambios no guardados
const originalData = ref({
  titulo: '',
  descripcion: '',
  valor: '',
  fecha_entrega: ''
})

const isSubmitting = ref(false)

// Computed para verificar si hay cambios no guardados
const formHasChanges = computed(() => {
  return JSON.stringify(taskData.value) !== JSON.stringify(originalData.value)
})

// Función para verificar cambios antes de salir
const checkUnsavedChanges = () => {
  if (formHasChanges.value && !isSubmitting.value) {
    const confirmed = confirm('¿Estás seguro de que quieres salir sin guardar los cambios?')
    if (!confirmed) {
      return false
    }
  }
}

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
  isSubmitting.value = true
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
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Layout principal */
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
  /* Ajuste para el sidebar fijo */
  margin-left: 130px;
}

/* Header con ArrowBack */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  width: 100%;
}



.course-subtitle {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

/* Header responsive */
.header-section {
  margin-bottom: 1.5rem;
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
  width: 100%;
}

/* Contenedor del formulario */
.form-wrapper {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Fila de campos para desktop */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #0f9d58;
  box-shadow: 0 0 0 3px rgba(15, 157, 88, 0.1);
}

textarea.form-input {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

/* Botones responsive */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn.primary {
  background: #0f9d58;
  color: white;
}

.btn.primary:hover {
  background: #0b8043;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 157, 88, 0.3);
}

.btn.cancel {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn.cancel:hover {
  background: #e9ecef;
  color: #333;
}

/* Alertas */
.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
}

.alert.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Estilos responsive para tablets */
@media screen and (max-width: 1024px) {
  .course-detail-container {
    padding: 1.5rem;
  }
  
  .form-wrapper {
    max-width: 600px;
  }
  
  
}

/* Estilos responsive para móviles */
@media screen and (max-width: 768px) {
  .course-detail-container {
    /* Remover margen del sidebar en móvil */
    margin-left: 0;
    padding: 1rem;
    /* Ajuste para el botón hamburguesa */
    margin-top: 5.25rem;
  }
  
  .text-page-title {
    text-align: center;
  }
  
  /* Header móvil */
  
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
  
  /* Formulario móvil */
  .form-wrapper {
    max-width: 100%;
  }
  
  /* Campos en columna en móvil */
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-input {
    padding: 0.875rem;
    font-size: 16px; 
  }
  
  textarea.form-input {
    min-height: 100px;
  }
  
  /* Botones móvil */
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .btn {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
  }
  
  /* Alert móvil */
  .alert {
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
  }
}

/* Estilos para móviles pequeños */
@media screen and (max-width: 480px) {
  .course-detail-container {
    padding: 0.75rem;
    padding-top: 75px;
  }
  
  
  
  .course-subtitle {
    font-size: 0.9rem;
  }
  
  .form-input {
    padding: 0.75rem;
  }
  
  .btn {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .form-input,
  .btn,
  .alert {
    transition: all 0.3s ease;
  }
}
</style>


