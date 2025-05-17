<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
  
      <main class="attendance-container">
        <!-- Encabezado -->
        <h1 class="page-title">{{ courseData.materia }} - Asistencia</h1>
        <div class="course-subtitle" v-if="courseData.grado && courseData.seccion">
          Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
        </div>
        <div class="separator"></div>
  
        <!-- Filtros -->
        <div class="filters-section">
          <h3>Filtros</h3>
          <div class="filter-controls">
            <div class="filter-group">
              <label>Estudiante:</label>
              <input
                type="text"
                placeholder="Buscar estudiante..."
                v-model="filterStudent"
              >
            </div>
            <div class="filter-group">
              <label>Estado:</label>
              <select v-model="filterStatus">
                <option value="all">Todos</option>
                <option value="present">Presente</option>
                <option value="absent">Ausente</option>
              </select>
            </div>
          </div>
        </div>
  
        <!-- Registro de Asistencia -->
        <div class="attendance-form">
          <div class="form-header">
            <h3>Registrar Asistencia</h3>
            <div class="date-selector">
              <label>Fecha:</label>
              <input
                type="date"
                v-model="currentDate"
                :max="todayDate"
              >
            </div>
          </div>
  
          <!-- Si hay alumnos tras filtrar -->
          <div v-if="filteredStudents.length > 0" class="student-cards">
            <div
              v-for="student in filteredStudents"
              :key="student.carnet"
              class="student-card"
            >
              <div class="student-icon">
                <CircleUser />
              </div>
              <div class="attendance-status">
                <CircleX
                  class="status-icon"
                  :class="{ active: attendanceStatus[student.carnet] === 'absent' }"
                  @click="setStatus(student.carnet, 'absent')"
                  title="Ausente"
                />
                <CircleCheck
                  class="status-icon"
                  :class="{ active: attendanceStatus[student.carnet] === 'present' }"
                  @click="setStatus(student.carnet, 'present')"
                  title="Presente"
                />
              </div>
              <div class="student-info">
                <div class="student-name">{{ student.nombre }} {{ student.apellido }}</div>
                <div class="student-class">Matemática 1: 1ro Primaria</div>
              </div>
            </div>
  
            <button class="save-button" @click="submitAttendance">
              Guardar Asistencia
            </button>
          </div>
  
          <!-- Si no hay coincidencias -->
          <div v-else class="empty-state">
            <p>No hay estudiantes que coincidan con los filtros.</p>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import {
    User,
    ClipboardList,
    BookOpen,
    CalendarDays,
    FileText,
    MessageSquare,
    CircleUser,
    CircleCheck,
    CircleX
  } from 'lucide-vue-next'
  
  const router = useRouter()
  
  const courseData = ref({
    materia: 'Matemáticas',
    grado: '8',
    seccion: 'A'
  })
  
  const students = ref([
    { carnet: 1001, nombre: 'Juan', apellido: 'Pérez' },
    { carnet: 1002, nombre: 'María', apellido: 'Gómez' }
  ])
  
  const attendanceStatus = ref({})
  
  const currentDate = ref(new Date().toISOString().split('T')[0])
  const todayDate   = ref(new Date().toISOString().split('T')[0])
  
  const filterStudent = ref('')
  const filterStatus  = ref('all')
  
  onMounted(() => {
    students.value.forEach(s => {
      attendanceStatus.value[s.carnet] = ''
    })
  })
  
  //Computed que aplica los filtros
  const filteredStudents = computed(() => {
    return students.value.filter(s => {
      const name = `${s.nombre} ${s.apellido}`.toLowerCase()
      const textMatch = name.includes(filterStudent.value.toLowerCase())
      const statusMatch = filterStatus.value === 'all'
        ? true
        : attendanceStatus.value[s.carnet] === filterStatus.value
      return textMatch && statusMatch
    })
  })
  
  const setStatus = (carnet, status) => {
    attendanceStatus.value[carnet] = status
  }
  
  const submitAttendance = () => {
    console.log({
      date: currentDate.value,
      attendance: attendanceStatus.value,
      filters: {
        name: filterStudent.value,
        status: filterStatus.value
      }
    })
    alert('Asistencia guardada (simulación)')
  }
  r
  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText },
    { label: 'Comunicación', icon: MessageSquare }
  ]
  
  const handleItemClick = item => {
    if (item.path) router.push(item.path)
  }
  </script>

  <style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
  }
  
  .attendance-container {
    flex: 1;
    padding: 2rem;
    background: white;
  }
  
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
  
  .course-subtitle {
    color: #555;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  
  .separator {
    border-bottom: 2px solid #ddd;
    margin: 1.5rem 0;
  }
  
  .filters-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  
  .filters-section h3 {
    margin-top: 0;
    color: #333;
  }
  
  .filter-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    min-width: 200px;
  }
  
  .filter-group label {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #555;
  }
  
  .filter-group input,
  .filter-group select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .attendance-form {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .date-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .date-selector input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .student-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .student-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #eee;
    padding: 0.75rem 1rem;
    border-radius: 8px;
  }
  
  .student-icon {
    width: 48px;
    height: 48px;
    color: #444;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .student-icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .attendance-status {
    display: flex;
    gap: 1rem;
  }
  
  .status-icon {
    width: 28px;
    height: 28px;
    cursor: pointer;
    stroke-width: 2;
    opacity: 0.4;
    transition: opacity 0.3s, stroke 0.3s;
    stroke: currentColor;
    fill: transparent;
  }
  
  .status-icon:hover {
    opacity: 0.7;
  }
  
  .status-icon.active {
    opacity: 1;
    stroke-width: 3;
    fill: transparent; 
  }
  
  .status-icon.active:nth-child(1) {
    color: #c0392b; 
  }
  
  .status-icon.active:nth-child(2) {
    color: #1a5e40; 
  }
  
  .student-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .student-name {
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .student-class {
    font-size: 0.9rem;
    color: #555;
  }
  
  .save-button {
    margin-top: 1rem;
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 0.8rem;
    width: 100%;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .save-button:hover {
    background-color: #45a049;
  }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  </style>
  