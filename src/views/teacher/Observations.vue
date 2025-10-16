<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

      <main class="register-observation-container">
        <ArrowBack 
          :to="`/teacher/courses/${route.params.courseId}/grades`"
          :show-text="true" 
          text="Volver"
        />
        <div class="page-header">
          <div class="header-content">
            <h1 class="text-page-title">{{ courseData?.materia }} - Registrar observaciones</h1>
            <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
             Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
            </div>
          </div>
        </div>
        
        <div class="separator"></div>

        <!-- Contenedor de búsqueda responsive -->
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Ingrese el nombre del estudiante..."
            class="search-input"
          >
        </div>

        <!-- Lista de estudiantes responsive -->
        <div class="students-list">
          <div v-for="student in filteredStudents" :key="student.carnet" class="student-row">
            <div class="student-info">
              <span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
              <span class="student-id">Carnet: {{ student.carnet }}</span>
            </div>
            <div class="student-actions">
              <button @click="addObservation(student)" class="action-btn primary">
                <span class="btn-text-full">Agregar observación</span>
                <span class="btn-text-short">Agregar</span>
              </button>
              <button @click="viewObservations(student)" class="action-btn secondary">
                <span class="btn-text-full">Ver observaciones</span>
                <span class="btn-text-short">Ver</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay estudiantes -->
        <div v-if="filteredStudents.length === 0 && searchQuery" class="no-results">
          <p>No se encontraron estudiantes que coincidan con "{{ searchQuery }}"</p>
        </div>

        <NotificationDialog />
      </main>
    </div>
  </template>

  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
  import ArrowBack from '@/components/common/ArrowBack.vue'
  import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare, Info } from 'lucide-vue-next'
  import { useNotifications } from '@/utils/useNotifications'
  import { downloadInstructivePDF } from '@/composables/useInstructivePDF'

  const { showNotification } = useNotifications()
  const route = useRoute()
  const router = useRouter()
  const courseData = ref(null)
  const students = ref([])
  const searchQuery = ref('')
  const saving = ref(false)

  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' },
    { label: 'Instructivo', icon: Info, action: 'downloadInstructive' }
  ]

  const filteredStudents = computed(() => {
    if (!searchQuery.value) return students.value
    const query = searchQuery.value.toLowerCase()
    return students.value.filter(student =>
      `${student.nombre} ${student.apellido}`.toLowerCase().includes(query) ||
      student.carnet.toString().includes(query)
    )
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const addObservation = (student) => {
    sessionStorage.setItem('studentData', JSON.stringify(student))
    router.push({
      name: 'AddObservations',
      params: {
        courseId:  parseInt(route.params.courseId),
        carnet_estudiante: student.carnet
      }
    })
  }

  const viewObservations = (student) => {
    router.push({
      name: 'ViewObservations',
      params: {
        courseId: parseInt(route.params.courseId),
        carnet_estudiante: student.carnet
      }
    })
  }

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3000/api/teacher/courses/${route.params.courseId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      students.value = data.map(student => ({
        ...student
      }))
    } catch (error) {
      console.error('Error fetching students:', error)
      showNotification('Error al cargar los estudiantes', 'error')
    }
  }

  onMounted(async () => {
    const savedCourse = sessionStorage.getItem('currentCourse')
    if (savedCourse) {
      courseData.value = JSON.parse(savedCourse)
      await fetchStudents()
    }
  })

  const handleItemClick = (item) => {
    if (item.action === 'downloadInstructive') {
      downloadInstructivePDF()
    } else if (item.path) {
      router.push(item.path)
    }
  }
  </script>

  <style scoped>
  /* Layout principal */
  .layout {
    display: flex;
    min-height: 100vh;
  }

  .register-observation-container {
    flex: 1;
    padding: 2rem;
    margin-left: 130px; /* Espacio para sidebar en escritorio */
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Header de la página */
  .page-header {
    margin-bottom: 24px;
  }

  .header-content {
    width: 100%;
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

  /* Contenedor de búsqueda */
  .search-container {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #1b9963;
    box-shadow: 0 0 0 2px rgba(27, 153, 99, 0.1);
  }

  /* Lista de estudiantes */
  .students-list {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .student-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
  }

  .student-row:hover {
    background-color: #f8f9fa;
  }

  .student-row:last-child {
    border-bottom: none;
  }

  .student-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .student-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
  }

  .student-id {
    color: #666;
    font-size: 0.9rem;
  }

  /* Acciones de estudiante */
  .student-actions {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .action-btn {
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 140px;
  }

  .action-btn.primary {
    background: #1b9963;
    color: white;
  }

  .action-btn.primary:hover {
    background: #158a56;
    transform: translateY(-1px);
  }

  .action-btn.secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #ddd;
  }

  .action-btn.secondary:hover {
    background: #e9ecef;
    border-color: #adb5bd;
    transform: translateY(-1px);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  /* Textos de botones */
  .btn-text-short {
    display: none;
  }

  /* Mensaje de no resultados */
  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
    font-style: italic;
  }

  /* Responsive Design */

  /* Tablets - 1024px y menos */
  @media screen and (max-width: 1024px) {
    .register-observation-container {
      padding: 1.5rem;
    }

    

    .action-btn {
      min-width: 120px;
      padding: 0.65rem 1.25rem;
      font-size: 0.9rem;
    }
  }

  /* Tablets pequeñas y móviles grandes - 768px y menos */
  @media screen and (max-width: 768px) {
    .register-observation-container {
      margin-left: 0; /* Remover margen del sidebar */
      padding: 1rem;
      margin-top: 5.25rem; /* Espacio para el botón hamburguesa */
    }
    
    .text-page-title {
      text-align: center;
    }

    .page-header {
      position: sticky;
      top: 0;
      background: white;
      z-index: 100;
      padding: 12px 0;
      margin: -1rem -1rem 1rem -1rem;
      padding-left: 1rem;
      padding-right: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .header-content {
      text-align: center;
    }

    

    .course-subtitle {
      font-size: 0.9rem;
    }

    .search-input {
      max-width: 100%;
    }

    .student-row {
      padding: 1.25rem;
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .student-info {
      text-align: center;
    }

    .student-name {
      font-size: 1.05rem;
    }

    .student-actions {
      justify-content: center;
      gap: 0.5rem;
    }

    .action-btn {
      flex: 1;
      min-width: auto;
      max-width: 180px;
    }
  }

  /* Móviles - 480px y menos */
  @media screen and (max-width: 480px) {
    .register-observation-container {
      padding: 0.75rem;
      margin-top: 5.25rem;
    }

    

    .course-subtitle {
      font-size: 0.95rem;
    }

    .search-input {
      padding: 0.65rem;
      font-size: 0.95rem;
    }

    .student-row {
      padding: 1rem;
    }

    .student-name {
      font-size: 1rem;
    }

    .student-id {
      font-size: 0.85rem;
    }

    .student-actions {
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-btn {
      max-width: 100%;
      padding: 0.75rem 1rem;
    }

    /* Mostrar texto corto en botones en móviles muy pequeños */
    .btn-text-full {
      display: none;
    }

    .btn-text-short {
      display: inline;
    }
  }

  /* Móviles muy pequeños - 360px y menos */
  @media screen and (max-width: 360px) {
    .register-observation-container {
      padding: 0.5rem;
      padding-top: 65px;
    }

    

    .students-list {
      margin: 0 -0.25rem;
    }

    .student-row {
      padding: 0.75rem;
    }

    .action-btn {
      padding: 0.65rem 0.75rem;
      font-size: 0.85rem;
    }
  }

  /* Landscape móviles */
  @media screen and (max-height: 500px) and (orientation: landscape) {
    .register-observation-container {
      padding-top: 60px;
    }

    

    .separator {
      margin-bottom: 1rem;
    }

    .search-container {
      margin-bottom: 1rem;
    }

    .student-row {
      padding: 1rem;
    }
  }
  </style>


