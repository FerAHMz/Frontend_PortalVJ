<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="register-observation-container">
        <h1 class="page-title">{{ courseData?.materia }} - Registrar observaciones</h1>
        <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
         Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
        </div>
        <div class="separator"></div>

          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Ingrese el nombre del estudiante..."
              class="search-input"
            >
          </div>
  
          <div class="students-list">
            <div v-for="student in filteredStudents" :key="student.carnet" class="student-row">
              <div class="student-info">
                <span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
                <span class="student-id">Carnet: {{ student.carnet }}</span>
              </div>
              <div>
                <button @click="addObservation(student)"  class="save-btn">
                  Agregar observación
                </button>
                <button @click="viewObservations(student)" class="save-btn">
                  Ver observaciones
                </button>
              </div>
            </div>
          </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
  
  const route = useRoute()
  const router = useRouter()
  const courseData = ref(null)
  const students = ref([])
  const searchQuery = ref('')
  const saving = ref(false)
  
  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
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
      alert('Error al cargar los estudiantes')
    }
  }
  
  
  onMounted(async () => {
    const savedCourse = sessionStorage.getItem('currentCourse')
    if (savedCourse) {
      courseData.value = JSON.parse(savedCourse)
      await fetchStudents()
    }
  })
  
  const handleItemClick = (path) => {
    if (path) {
      router.push(path)
    }
  }
  </script>
  
  <style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
  }
  
  .register-observation-container {
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

  .form-group label {
    font-weight: 500;
    color: #333;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .search-container {
    margin-bottom: 2rem;
  }
  
  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .students-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .student-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .student-info {
    display: flex;
    flex-direction: column;
  }
  
  .student-name {
    font-weight: 500;
  }
  
  .student-id {
    color: #666;
    font-size: 0.9rem;
  }

  
  .actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .student-row > div:last-child {
    display: flex;
    gap: 1rem;
  }
  
  .save-btn {
    background: #1b9963;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    white-space: nowrap; 
  }

  .save-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  .save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  </style>