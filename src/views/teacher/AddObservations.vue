<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="add-observation-container">
        <!-- Alerta responsive -->
        <div v-if="alert.show" :class="['alert', alert.type]">
          {{ alert.message }}
        </div>

        <!-- Header responsive -->
        <ArrowBack 
          :use-history-back="true"
          :disabled="formHasChanges && !isSubmitting"
          tooltip="Guarda los cambios antes de salir"
          @before-back="checkUnsavedChanges"
          :show-text="true"
          text="Cancelar"
        />
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Registrar observaciones</h1>
            <div class="course-subtitle" v-if="courseData && studentData">
              <div class="course-info-grid">
                <span class="info-item">{{ courseData.materia }}</span>
                <span class="info-separator">|</span>
                <span class="info-item">Grado: {{ courseData.grado }}</span>
                <span class="info-separator">|</span>
                <span class="info-item">Sección: {{ courseData.seccion }}</span>
                <span class="info-separator">|</span>
                <span class="info-item">{{ studentData.nombre }}</span>
                <span class="info-separator">|</span>
                <span class="info-item">Carnet: {{ studentData.carnet }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="separator"></div>
        
        <!-- Formulario responsive -->
        <form @submit.prevent="handleSubmit" class="observation-form">
          <!-- Sección de selección de tarea -->
          <div class="form-group">
            <label for="taskSelect" class="form-label">Vincular a una tarea</label>
            <select id="taskSelect" v-model="selectedTaskId" class="form-input select-input">
              <option :value="null">No vincular a ninguna tarea</option>
              <option v-for="task in tasks" :key="task.id" :value="task.id">
                {{ task.titulo }} - {{ formatDate(task.fecha_entrega) }}
              </option>
            </select>
          </div>

          <!-- Campo de observaciones -->
          <div class="form-group">
            <label for="observation" class="form-label">
              Observaciones <span class="required">*</span>
            </label>
            <textarea 
              id="observations" 
              v-model="obsData.observaciones" 
              required
              class="form-input textarea-input"
              placeholder="Escriba sus observaciones aquí..."
            ></textarea>
          </div>
  
          <!-- Campo de puntos de acción -->
          <div class="form-group">
            <label for="action-points" class="form-label">
              Puntos de acción <span class="required">*</span>
            </label>
            <textarea 
              id="action_points" 
              v-model="obsData.puntos_de_accion" 
              required
              class="form-input textarea-input"
              placeholder="Escriba los puntos de acción aquí..."
            ></textarea>
          </div>
  
          <!-- Acciones del formulario -->
          <div class="form-actions">
            <button type="button" class="btn cancel" @click="handleCancel">
              <span class="btn-text-full">Cancelar</span>
              <span class="btn-text-short">Cancelar</span>
            </button>
            <button type="submit" class="btn primary">
              <span class="btn-text-full">Guardar observación</span>
              <span class="btn-text-short">Guardar</span>
            </button>
          </div>
        </form>
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
    { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
  ]
  
  const obsData = ref({
    id_tarea: null,
    observaciones: '',
    puntos_de_accion: ''
  })

  // Estado para el manejo de cambios no guardados
  const originalData = ref({
    id_tarea: null,
    observaciones: '',
    puntos_de_accion: ''
  })

  const isSubmitting = ref(false)

  // Computed para verificar si hay cambios no guardados
  const formHasChanges = computed(() => {
    return JSON.stringify(obsData.value) !== JSON.stringify(originalData.value) ||
           selectedTaskId.value !== null
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const handleSubmit = async () => {
    try {
      isSubmitting.value = true
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
    } finally {
      isSubmitting.value = false
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
  /* Layout principal */
  .layout {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }
  
  .add-observation-container {
    flex: 1;
    padding: 2rem;
    margin-left: 130px; /* Espacio para sidebar en escritorio */
    background: white;
    overflow: auto;
    max-width: 100%;
  }

  /* Header de la página */
  .page-header {
    margin-bottom: 24px;
    position: relative;
    z-index: 10;
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
    color: #6b7280;
    font-size: 1rem;
  }

  .course-info-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .info-item {
    font-weight: 500;
  }

  .info-separator {
    color: #d1d5db;
  }
  
  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 2rem;
    width: 100%;
  }
  
  /* Formulario */
  .observation-form {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-label {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }

  .required {
    color: #e74c3c;
    margin-left: 0.25rem;
  }
  
  .form-input {
    padding: 0.875rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s ease;
    background: white;
  }

  .form-input:focus {
    outline: none;
    border-color: #0f9d58;
    box-shadow: 0 0 0 3px rgba(15, 157, 88, 0.1);
  }

  .select-input {
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23666" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5rem;
    appearance: none;
    padding-right: 3rem;
  }
  
  .textarea-input {
    min-height: 120px;
    resize: vertical;
    line-height: 1.5;
  }
  
  /* Acciones del formulario */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .btn {
    padding: 0.875rem 1.75rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s ease;
    min-width: 140px;
    text-align: center;
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
    color: #333;
    border: 2px solid #e0e0e0;
  }
  
  .btn.cancel:hover {
    background: #e9ecef;
    border-color: #adb5bd;
    transform: translateY(-1px);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Textos de botones */
  .btn-text-short {
    display: none;
  }
  
  /* Alertas */
  .alert {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 500;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  /* Responsive Design */

  /* Tablets - 1024px y menos */
  @media screen and (max-width: 1024px) {
    .add-observation-container {
      padding: 1.5rem;
    }

    .observation-form {
      max-width: 100%;
    }

    .page-title {
      font-size: 1.75rem;
    }
  }

  /* Tablets pequeñas y móviles grandes - 768px y menos */
  @media screen and (max-width: 768px) {
    .add-observation-container {
      margin-left: 0;
      padding: 1rem;
      padding-top: 5rem; /* Espacio para el header */
    }
    
    .page-header {
      flex-direction: column;
      gap: 12px;
      background: white;
      padding: 1rem;
      margin: -1rem -1rem 1rem -1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 20;
    }
    
    .page-title {
      font-size: 1.5rem;
      text-align: center;
    }
    
    .course-info-grid {
      justify-content: center;
      text-align: center;
    }
  }

  @media screen and (max-width: 480px) {
    .page-header {
      padding: 0.8rem;
    }
    
    .page-title {
      font-size: 1.3rem;
    }
    
    .course-info-grid {
      flex-direction: column;
      gap: 4px;
    }
    
    .info-separator {
      display: none;
    }
  }

  /* Móviles - 480px y menos */
  @media screen and (max-width: 480px) {
    .add-observation-container {
      padding: 0.75rem;
      padding-top: 70px;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .course-subtitle {
      font-size: 0.95rem;
    }

    .separator {
      margin-bottom: 1.5rem;
    }

    .observation-form {
      gap: 1.25rem;
    }

    .form-group {
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.95rem;
    }

    .form-input {
      padding: 0.65rem;
      font-size: 0.95rem;
    }

    .textarea-input {
      min-height: 90px;
    }

    .btn {
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
    }

    /* Mostrar texto corto en botones muy pequeños */
    .btn-text-full {
      display: none;
    }

    .btn-text-short {
      display: inline;
    }
  }

  /* Móviles muy pequeños - 360px y menos */
  @media screen and (max-width: 360px) {
    .add-observation-container {
      padding: 0.5rem;
      padding-top: 65px;
    }

    .page-title {
      font-size: 1.1rem;
    }

    .observation-form {
      gap: 1rem;
    }

    .form-input {
      padding: 0.6rem;
    }

    .btn {
      padding: 0.65rem 0.75rem;
      font-size: 0.9rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }
  }

  /* Landscape móviles */
  @media screen and (max-height: 500px) and (orientation: landscape) {
    .add-observation-container {
      padding-top: 60px;
    }

    .page-title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .separator {
      margin-bottom: 1rem;
    }

    .observation-form {
      gap: 1rem;
    }

    .textarea-input {
      min-height: 80px;
    }

    .form-actions {
      margin-top: 1rem;
    }
  }

  /* Estados de focus mejorados para móvil */
  @media screen and (max-width: 768px) {
    .form-input:focus {
      box-shadow: 0 0 0 2px rgba(15, 157, 88, 0.2);
    }
  }
  </style>