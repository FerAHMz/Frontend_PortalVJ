<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
  
      <main class="attendance-container">
  
        <!-- Banner fijo para historial -->
        <div class="history-info">
          📅 Cambia la fecha para ver o editar registros históricos de asistencia.
        </div>
  
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
                <option value="late">Llegada tarde</option>
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
  
          <div v-if="filteredStudents.length" class="student-cards">
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
                <ClockAlert
                  class="status-icon"
                  :class="{ active: attendanceStatus[student.carnet] === 'late' }"
                  @click="setStatus(student.carnet, 'late')"
                  title="Llegada tarde"
                />
                <CircleCheck
                  class="status-icon"
                  :class="{ active: attendanceStatus[student.carnet] === 'present' }"
                  @click="setStatus(student.carnet, 'present')"
                  title="Presente"
                />
              </div>
              <div class="student-info">
                <div class="student-name">
                  {{ student.nombre }} {{ student.apellido }}
                </div>
                <div class="student-class">
                  Materia: {{ courseData.materia }}, Grado: {{ courseData.grado }}, Sección: {{ courseData.seccion }}
                </div>
              </div>
            </div>
  
            <button 
              class="save-button" 
              :class="{ 'update-mode': saved }" 
              @click="submitAttendance"
            >
              {{ saved ? 'Actualizar Asistencia' : 'Guardar Asistencia' }}
            </button>
          </div>
  
          <div v-else class="empty-state">
            <p>No hay estudiantes que coincidan con los filtros.</p>
          </div>
        </div>

        <!-- Sección de reportes -->
        <div class="report-section">
          <h3>Generar Reporte de Asistencia</h3>
          <div class="report-controls">
            <div class="date-range">
              <label>Desde:</label>
              <input type="date" v-model="reportStartDate" :max="todayDate">
        
              <label>Hasta:</label>
              <input type="date" v-model="reportEndDate" :max="todayDate">
        
              <button @click="generateReport" class="generate-button">
                Generar Reporte
              </button>
            </div>
          </div>

          <div v-if="reportData.length" class="report-results">
            <table>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Días escolares</th>
                  <th>Presente</th>
                  <th>Llegadas tarde</th>
                  <th>Ausente</th>
                  <th>% Asistencia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in reportData" :key="student.carnet">
                  <td>{{ student.nombre }} {{ student.apellido }}</td>
                  <td>{{ student.total_school_days }}</td>
                  <td>{{ student.present_count }}</td>
                  <td>{{ student.late_count }}</td>
                  <td>{{ student.absent_count }}</td>
                  <td>
                    {{ calculateAttendancePercentage(student) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <NotificationDialog />
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
  import {
    User,
    ClipboardList,
    BookOpen,
    CalendarDays,
    FileText,
    MessageSquare,
    CircleUser,
    CircleCheck,
    CircleX,
    ClockAlert
  } from 'lucide-vue-next'
  import attendanceService from '@/services/attendanceService'
  import { useNotifications } from '@/utils/useNotifications'
  
  const { showNotification } = useNotifications()
  const route = useRoute()
  const router = useRouter()
  
  function getLocalDateISO() {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  }

  const courseData = ref({ materia: '', grado: '', seccion: '' })
  const students = ref([])
  const attendanceStatus = ref({})
  const currentDate = ref(getLocalDateISO())
  const todayDate = ref(getLocalDateISO())
  const filterStudent = ref('')
  const filterStatus = ref('all')
  const saved = ref(false)
  
  const reportStartDate = ref('');
  const reportEndDate = ref('');
  const reportData = ref([]);

  onMounted(() => {
    if (route.state?.courseData) {
      courseData.value = route.state.courseData
    } else {
      const savedCourse = sessionStorage.getItem('currentCourse')
      if (savedCourse) courseData.value = JSON.parse(savedCourse)
      else router.push('/teacher/courses')
    }
    fetchData()
  })
  
  watch(currentDate, () => {
    saved.value = false
    fetchData()
  })
  
  const filteredStudents = computed(() =>
    students.value.filter(s => {
      const name = `${s.nombre} ${s.apellido}`.toLowerCase()
      const textMatch = name.includes(filterStudent.value.toLowerCase())
      const statusMatch =
        filterStatus.value === 'all'
          ? true
          : attendanceStatus.value[s.carnet] === filterStatus.value
      return textMatch && statusMatch
    })
  )
  
  function setStatus(carnet, status) {
    attendanceStatus.value[carnet] = status
  }
  
  async function fetchData() {
    try {
      const { students: s, attendanceStatus: a } = await attendanceService.fetchAttendance(
        route.params.courseId,
        currentDate.value
      )
      students.value = s
      s.forEach(st => {
        attendanceStatus.value[st.carnet] = a[st.carnet] || ''
      })
      saved.value = Object.values(a).some(v => v === 'present' || v === 'absent' || v === 'late')
    } catch (err) {
      console.error(err)
      showNotification(err.message || 'Error cargando asistencia', 'error')
    }
  }
  
  async function submitAttendance() {
    try {
      await attendanceService.saveAttendance(
        route.params.courseId,
        currentDate.value,
        attendanceStatus.value
      )
      saved.value = true
      showNotification('Asistencia guardada correctamente', 'success')
    } catch (err) {
      console.error(err)
      showNotification(err.message || 'Error al guardar asistencia', 'error')
    }
  }
  
  function calculateAttendancePercentage(student) {
    if (student.total_school_days === 0) return '0.0';
    
    const weights = {
      present: 1,
      late: 0.5,   
      absent: 0
    };

    const total = (student.present_count * weights.present) +
                (student.late_count * weights.late) +
                (student.absent_count * weights.absent);
                
    const percentage = (total / student.total_school_days) * 100;
    
    return Math.min(100, Math.max(0, percentage)).toFixed(1);
  }

  async function generateReport() {
    if (!reportStartDate.value || !reportEndDate.value) {
      showNotification('Debes seleccionar un rango de fechas válido', 'error');
      return;
    }

    try {
      const { report } = await attendanceService.getAttendanceReport(
        route.params.courseId,
        reportStartDate.value,
        reportEndDate.value
      );
      reportData.value = report;
      showNotification('Reporte generado correctamente', 'success');
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'Error al generar el reporte', 'error');
    }
  }

  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
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
  .history-info {
    background-color: #d9edf7;
    color: #31708f;
    padding: 0.75rem 1rem;
    border: 1px solid #bce8f1;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  .status-icon:hover { opacity: 0.7; }
  .status-icon.active {
    opacity: 1;
    stroke-width: 3;
    fill: transparent;
  }
  .status-icon.active:nth-child(1) { color: #c0392b; }
  .status-icon.active:nth-child(2) { color: #e67e22; }
  .status-icon.active:nth-child(3) { color: #1a5e40; }
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
  .save-button.update-mode {
    background-color: #f0ad4e;
  }
  .save-button.update-mode:hover {
    background-color: #ec971f;
  }
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .report-section {
    margin-top: 2rem;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .report-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .date-range {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .date-range label {
    font-weight: 500;
  }

  .generate-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .generate-button:hover {
    background-color: #2980b9;
  }

  .report-results {
    margin-top: 1.5rem;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }

  tr:hover {
    background-color: #f5f5f5;
  }

  .export-button {
    margin-top: 1rem;
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .export-button:hover {
    background-color: #27ae60;
  }
  </style>
