<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
  
      <main class="attendance-container">
        <!-- Skeleton loading mientras carga -->
        <AttendanceSkeleton v-if="loading" />
        
        <!-- Contenido real -->
        <template v-else>
          <!-- Encabezado -->
          <ArrowBack 
            :show-text="true" 
            text="Volver al Curso"
            @before-back="saveViewState"
          />
          <div class="page-header">
            <div class="header-content">
              <h1 class="text-page-title">{{ courseData.materia }} - Asistencia</h1>
              <div class="course-subtitle" v-if="courseData.grado && courseData.seccion">
                Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
              </div>
            </div>
          </div>
          <div class="separator"></div>
  
          <!-- Filtros -->
          <div class="filters-section" v-show="!loading">
            <h3>Filtros</h3>
            <div class="filter-controls">
              <div class="filter-group">
                <label>Estudiante:</label>
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  v-model.trim="filterStudent"
                  @input="$event.target.value = $event.target.value.substring(0, 50)"
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
          </div>        <!-- Registro de Asistencia -->
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
            <div v-if="studentsLoading" class="students-loading">
              <p>Cargando estudiantes...</p>
            </div>
            <div v-else
              v-for="student in filteredStudents"
              :key="student.carnet"
              class="student-card"
            >
              <div class="student-icon">
                <CircleUser />
              </div>
              <div class="student-info">
                <div class="student-name">
                  {{ student.nombre }} {{ student.apellido }}
                </div>
                <div class="student-class">
                  Materia: {{ courseData.materia }}, Grado: {{ courseData.grado }}, Sección: {{ courseData.seccion }}
                </div>
              </div>
              <div class="attendance-status">
                <div class="status-button" 
                     :class="{ active: attendanceStatus[student.carnet] === 'absent' }"
                     @click="setStatus(student.carnet, 'absent')"
                     title="Ausente">
                  <CircleX class="status-icon" />
                  <span class="status-label">Ausente</span>
                </div>
                <div class="status-button"
                     :class="{ active: attendanceStatus[student.carnet] === 'late' }"
                     @click="setStatus(student.carnet, 'late')"
                     title="Llegada tarde">
                  <ClockAlert class="status-icon" />
                  <span class="status-label">Tarde</span>
                </div>
                <div class="status-button"
                     :class="{ active: attendanceStatus[student.carnet] === 'present' }"
                     @click="setStatus(student.carnet, 'present')"
                     title="Presente">
                  <CircleCheck class="status-icon" />
                  <span class="status-label">Presente</span>
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
              <div class="date-input-group">
                <label>Desde:</label>
                <input type="date" v-model="reportStartDate" :max="todayDate">
              </div>
              <div class="date-input-group">
                <label>Hasta:</label>
                <input type="date" v-model="reportEndDate" :max="todayDate">
              </div>
              <button @click="generateReport" class="generate-button">
                Generar Reporte
              </button>
            </div>
          </div>

          <div v-if="reportData.length" class="report-results">
            <div class="table-container">
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
        </div>
        <NotificationDialog />
        </template>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  // Importación directa para componentes críticos
  import Sidebar from '@/components/Sidebar.vue'
  import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
  import AttendanceSkeleton from '@/components/AttendanceSkeleton.vue'
  import ArrowBack from '@/components/common/ArrowBack.vue'
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
  
  // Función para guardar el estado de la vista antes de salir
  const saveViewState = () => {
    localStorage.setItem('attendanceViewState', JSON.stringify({
      currentDate: currentDate.value,
      filterStudent: filterStudent.value,
      filterStatus: filterStatus.value,
      scrollPosition: window.scrollY
    }))
  }
  
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
  const loading = ref(false) // Cambiar a false para mostrar UI inmediatamente
  const studentsLoading = ref(true) // Loading específico para estudiantes
  
  const reportStartDate = ref('');
  const reportEndDate = ref('');
  const reportData = ref([]);

  onMounted(async () => {
    // 1. Cargar datos del curso inmediatamente (síncronos)
    if (route.state?.courseData) {
      courseData.value = route.state.courseData
    } else {
      const savedCourse = sessionStorage.getItem('currentCourse')
      if (savedCourse) {
        courseData.value = JSON.parse(savedCourse)
      } else {
        router.push('/teacher/courses')
        return
      }
    }
    
    // 2. Mostrar UI inmediatamente con datos del curso
    loading.value = false
    
    // 3. Cargar datos de estudiantes
    fetchData()
  })
  
  watch(currentDate, () => {
    saved.value = false
    studentsLoading.value = true
    fetchData()
  })
  
  // Memoized computed para mejor performance
  const filteredStudents = computed(() => {
    if (!students.value?.length) return []
    
    const searchTerm = filterStudent.value.toLowerCase().trim()
    const statusFilter = filterStatus.value
    
    return students.value.filter(student => {
      if (!student) return false
      
      const fullName = `${student.nombre || ''} ${student.apellido || ''}`.toLowerCase()
      const matchesSearch = !searchTerm || fullName.includes(searchTerm)
      const matchesStatus = statusFilter === 'all' || attendanceStatus.value[student.carnet] === statusFilter
      
      return matchesSearch && matchesStatus
    })
  })
  
  function setStatus(carnet, status) {
    attendanceStatus.value[carnet] = status
  }
  
  async function fetchData() {
    studentsLoading.value = true
    
    try {
      const { students: s, attendanceStatus: a } = await attendanceService.fetchAttendance(
        route.params.courseId,
        currentDate.value
      )
      
      // Batch updates para minimizar re-renders
      students.value = s
      const newStatus = {}
      s.forEach(st => {
        newStatus[st.carnet] = a[st.carnet] || ''
      })
      attendanceStatus.value = newStatus
      
      saved.value = Object.values(a).some(v => v === 'present' || v === 'absent' || v === 'late')
      
    } catch (err) {
      console.error(err)
      showNotification(err.message || 'Error cargando asistencia', 'error')
    } finally {
      studentsLoading.value = false
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
    { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
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
    margin-left: 130px;
    background: white;
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Header Section */
  .header-section {
    margin-bottom: 1rem;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .header-content {
    width: 100%;
  }

  

  .course-subtitle {
    color: #6b7280;
    font-size: 1rem;
  }

  .separator {
    border-bottom: 2px solid #ddd;
    margin: 1.5rem 0;
  }

  /* Filters Section */
  .filters-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .filters-section h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
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
    flex: 1;
  }

  .filter-group label {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #555;
    font-weight: 500;
  }

  .filter-group input,
  .filter-group select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  /* Attendance Form */
  .attendance-form {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .form-header h3 {
    margin: 0;
    color: #2c3e50;
  }

  .date-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .date-selector label {
    font-weight: 500;
    color: #555;
  }

  .date-selector input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  /* Student Cards - Optimizado para rendimiento */
  .student-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    /* Optimización de rendering */
    will-change: scroll-position;
    contain: layout style;
  }

  .student-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    /* Animación de entrada suave */
    opacity: 0;
    transform: translateY(20px);
    animation: slideInUp 0.3s ease-out forwards;
    /* Optimización GPU */
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .student-icon {
    width: 48px;
    height: 48px;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .student-icon svg {
    width: 100%;
    height: 100%;
  }

  .student-info {
    flex: 1;
    min-width: 0;
  }

  .student-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    word-break: break-word;
  }

  .student-class {
    font-size: 0.9rem;
    color: #6c757d;
    word-break: break-word;
  }

  .attendance-status {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .status-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    border: 2px solid #e9ecef;
    min-width: 60px;
  }

  .status-button:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
  }

  .status-button.active {
    background: white;
    border-width: 2px;
  }

  .status-button.active:nth-child(1) {
    border-color: #dc3545;
    color: #dc3545;
  }

  .status-button.active:nth-child(2) {
    border-color: #fd7e14;
    color: #fd7e14;
  }

  .status-button.active:nth-child(3) {
    border-color: #198754;
    color: #198754;
  }

  .status-icon {
    width: 24px;
    height: 24px;
    margin-bottom: 0.25rem;
  }

  .status-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
  }

  /* Animaciones optimizadas */
  @keyframes slideInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Optimización para filtros */
  .filters-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    /* Transición suave */
    transition: opacity 0.2s ease;
  }

  .filters-section.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  /* Save Button */
  .save-button {
    margin-top: 1rem;
    background-color: #198754;
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
    background-color: #157347;
  }

  .save-button.update-mode {
    background-color: #fd7e14;
  }

  .save-button.update-mode:hover {
    background-color: #e8630f;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  .students-loading {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  /* Report Section */
  .report-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .report-section h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
  }

  .report-controls {
    margin-bottom: 1rem;
  }

  .date-range {
    display: flex;
    align-items: end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .date-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-input-group label {
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
  }

  .date-input-group input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 150px;
  }

  .generate-button {
    background-color: #0d6efd;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    height: fit-content;
  }

  .generate-button:hover {
    background-color: #0b5ed7;
  }

  .report-results {
    margin-top: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
    white-space: nowrap;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }

  tr:hover {
    background-color: #f8f9fa;
  }

  /* Mobile Responsive Styles */
  @media screen and (max-width: 768px) {
    .attendance-container {
      margin-left: 0;
      padding: 1rem;
      margin-top: 5.25rem;
    }

    .text-page-title {
      text-align: center;
    }

    .course-subtitle {
      font-size: 1rem;
    }

    /* Mobile filters */
    .filter-group {
      min-width: 100%;
    }

    /* Mobile form header */
    .form-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .date-selector {
      justify-content: space-between;
    }

    /* Mobile student cards */
    .student-card {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .student-info {
      text-align: center;
      order: -1;
    }

    .student-icon {
      order: -2;
      width: 60px;
      height: 60px;
    }

    .attendance-status {
      justify-content: center;
      width: 100%;
      gap: 1rem;
    }

    .status-button {
      flex: 1;
      min-width: 80px;
      padding: 1rem 0.5rem;
    }

    .status-icon {
      width: 28px;
      height: 28px;
    }

    .status-label {
      font-size: 0.8rem;
    }

    /* Mobile report section */
    .date-range {
      flex-direction: column;
      align-items: stretch;
    }

    .date-input-group {
      width: 100%;
    }

    .date-input-group input {
      min-width: 100%;
    }

    .generate-button {
      width: 100%;
      padding: 0.8rem;
      font-size: 1rem;
    }

    /* Mobile table */
    table {
      font-size: 0.8rem;
    }

    th, td {
      padding: 0.5rem 0.25rem;
    }
  }

  @media screen and (max-width: 480px) {
    .attendance-container {
      padding: 0.5rem;
    }

    .filters-section,
    .attendance-form,
    .report-section {
      padding: 1rem;
    }

    .student-card {
      padding: 1rem 0.5rem;
    }

    .status-button {
      min-width: 70px;
      padding: 0.8rem 0.25rem;
    }

    .status-icon {
      width: 24px;
      height: 24px;
    }

    .status-label {
      font-size: 0.7rem;
    }
  }
  </style>


