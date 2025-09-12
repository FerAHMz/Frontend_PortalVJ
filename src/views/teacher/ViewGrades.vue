<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="course-detail-container">
      <ArrowBack 
        :use-history-back="true"
        :show-text="true"
        text="Volver"
        @before-back="saveViewState"
      />
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">{{ courseData?.materia }} - Calificaciones</h1>
          <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
            Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
          </div>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Resumen de calificaciones -->
      <div class="summary-container" v-if="summaryData">
        <div class="summary-card">
          <span class="summary-label">Promedio del grupo:</span>
          <span class="summary-value">{{ summaryData.classAverage }}%</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Total puntos:</span>
          <span class="summary-value">{{ summaryData.totalPossiblePoints }}</span>
        </div>
      </div>

      <!-- Vista Desktop - Tabla completa -->
      <div class="grades-table-container desktop-view">
        <table class="grades-table">
          <thead>
            <tr>
              <th class="student-column">Nombre del Estudiante</th>
              <th v-for="task in tasks" :key="task.id" class="task-header">
                <div class="task-title">{{ task.titulo }}</div>
                <div class="task-value">({{ task.valor }} pts)</div>
              </th>
              <th class="average-column">
                <div class="task-title">Promedio</div>
                <div class="task-value">(%)</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in studentsWithAverages" :key="student.carnet">
              <td class="student-name">{{ student.nombre }} {{ student.apellido }}</td>
              <td v-for="task in tasks" :key="task.id" class="grade-cell">
                {{ getStudentGrade(student.carnet, task.id) }}
              </td>
              <td class="average-grade">
                {{ student.average || '0.00' }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista Mobile - Tarjetas de estudiantes -->
      <div class="mobile-view">
        <!-- Selector de estudiante -->
        <div class="student-selector-container">
          <label class="selector-label">Seleccionar estudiante:</label>
          <select v-model="selectedStudentIndex" class="student-selector">
            <option v-for="(student, index) in studentsWithAverages" 
                    :key="student.carnet" 
                    :value="index">
              {{ student.nombre }} {{ student.apellido }}
            </option>
          </select>
        </div>

        <!-- Información del estudiante seleccionado -->
        <div v-if="selectedStudent" class="student-detail-card">
          <div class="student-header">
            <h3 class="student-name-mobile">{{ selectedStudent.nombre }} {{ selectedStudent.apellido }}</h3>
            <div class="student-average">
              <span class="average-label">Promedio:</span>
              <span class="average-value">{{ selectedStudent.average }}%</span>
            </div>
          </div>

          <!-- Navegación entre estudiantes -->
          <div class="student-navigation">
            <button 
              @click="previousStudent" 
              :disabled="selectedStudentIndex === 0"
              class="nav-btn prev-btn">
              ← Anterior
            </button>
            <span class="student-counter">
              {{ selectedStudentIndex + 1 }} de {{ studentsWithAverages.length }}
            </span>
            <button 
              @click="nextStudent" 
              :disabled="selectedStudentIndex === studentsWithAverages.length - 1"
              class="nav-btn next-btn">
              Siguiente →
            </button>
          </div>

          <!-- Lista de tareas y calificaciones -->
          <div class="tasks-grades-list">
            <div v-for="task in tasks" :key="task.id" class="task-grade-item">
              <div class="task-info">
                <div class="task-title-mobile">{{ task.titulo }}</div>
                <div class="task-points">{{ task.valor }} puntos</div>
              </div>
              <div class="grade-display">
                <span class="grade-value">
                  {{ getStudentGrade(selectedStudent.carnet, task.id) }}
                </span>
                <span v-if="getStudentGrade(selectedStudent.carnet, task.id) !== '-'" class="grade-separator">/</span>
                <span v-if="getStudentGrade(selectedStudent.carnet, task.id) !== '-'" class="max-points">{{ task.valor }}</span>
              </div>
            </div>
          </div>
        </div>


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
import studentService from '@/services/studentService'
import gradeService from '@/services/gradeService'
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
const tasks = ref([])
const students = ref([])
const grades = ref({})
const summaryData = ref(null)
const selectedStudentIndex = ref(0)

// Función para guardar el estado de la vista
const saveViewState = () => {
  localStorage.setItem('gradesViewState', JSON.stringify({
    selectedStudentIndex: selectedStudentIndex.value,
    scrollPosition: window.scrollY
  }))
}

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const selectedStudent = computed(() => {
  return studentsWithAverages.value[selectedStudentIndex.value] || null
})

const studentsWithAverages = computed(() => {
  return students.value.map(student => {
    return {
      ...student,
      average: parseFloat(student.average || 0).toFixed(2)
    }
  })
})

const previousStudent = () => {
  if (selectedStudentIndex.value > 0) {
    selectedStudentIndex.value--
  }
}

const nextStudent = () => {
  if (selectedStudentIndex.value < studentsWithAverages.value.length - 1) {
    selectedStudentIndex.value++
  }
}

onMounted(async () => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    courseData.value = JSON.parse(savedCourse)
    await loadData()
  }
})

const loadData = async () => {
  try {
    const [tasksData, , gradesData] = await Promise.all([
      taskService.getCourseTasks(route.params.courseId),
      studentService.getStudentsByCourse(route.params.courseId), 
      gradeService.getCourseGrades(route.params.courseId)
    ]);
    
    tasks.value = tasksData;
    students.value = gradesData.students; 
    summaryData.value = gradesData.summary;

    const gradesMap = {};
    gradesData.students.forEach(student => {
      student.tasks.forEach(task => {
        if (!gradesMap[task.taskId]) {
          gradesMap[task.taskId] = {};
        }
        gradesMap[task.taskId][student.carnet] = task.pointsEarned;
      });
    });
    grades.value = gradesMap;

  } catch (error) {
    console.error('Error loading data:', {
      error: error.message,
      details: error.response?.data || 'No hay detalles adicionales'
    });
  }
};

const getStudentGrade = (studentId, taskId) => {
  return grades.value[taskId]?.[studentId] || '-'
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
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
  margin-left: 130px;
}

.page-header {
  margin-bottom: 24px;
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

/* Resumen */
.summary-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  flex: 1;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.summary-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Vista Desktop */
.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.grades-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.grades-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.grades-table th,
.grades-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.grades-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.student-column {
  text-align: left;
  min-width: 200px;
  position: sticky;
  left: 0;
  background: #f8f9fa;
  z-index: 1;
}

.student-name {
  text-align: left;
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}

.task-header {
  min-width: 120px;
}

.task-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.task-value {
  font-size: 0.8em;
  color: #666;
  font-weight: normal;
}

.grade-cell {
  font-weight: 500;
}

.average-column {
  background-color: #f0f7ff;
  position: sticky;
  right: 0;
  z-index: 1;
}

.average-grade {
  font-weight: bold;
  color: #2c3e50;
  position: sticky;
  right: 0;
  background: #f0f7ff;
  z-index: 1;
}

/* Vista Mobile */
.student-selector-container {
  margin-bottom: 1rem;
}

.selector-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.student-selector {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px; /* Previene zoom en iOS */
  background: white;
}

.student-detail-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 1rem;
}

.student-header {
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.student-name-mobile {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.student-average {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.average-label {
  color: #666;
  font-size: 0.9rem;
}

.average-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}

.student-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.nav-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):hover {
  background: #0056b3;
}

.student-counter {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.tasks-grades-list {
  padding: 1rem;
}

.task-grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.task-grade-item:last-child {
  border-bottom: none;
}

.task-info {
  flex: 1;
}

.task-title-mobile {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.task-points {
  font-size: 0.85rem;
  color: #666;
}

.grade-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: bold;
}

.grade-value {
  color: #2c3e50;
  font-size: 1.1rem;
}

.grade-separator, .max-points {
  color: #666;
  font-size: 0.9rem;
}



/* Responsive breakpoints */
@media screen and (max-width: 768px) {
  .course-detail-container {
    margin-left: 0;
    padding: 1rem;
    padding-top: 80px; /* Espacio para hamburguesa */
  }

  .page-title {
    font-size: 1.5rem;
    margin-top: 1.25rem;
  }

  .course-subtitle {
    font-size: 1rem;
  }

  /* Ocultar vista desktop y mostrar mobile */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  /* Ajustar resumen en móvil */
  .summary-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .summary-card {
    padding: 0.75rem;
  }

  .summary-value {
    font-size: 1.1rem;
  }
}

/* Tablets */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .course-detail-container {
    padding: 1.5rem;
  }

  .grades-table {
    min-width: 700px;
  }

  .task-header {
    min-width: 100px;
  }

  .student-column {
    min-width: 180px;
  }
}

/* Pantallas muy pequeñas */
@media screen and (max-width: 480px) {
  .course-detail-container {
    padding: 0.75rem;
    padding-top: 70px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .student-detail-card {
    border-radius: 8px;
  }

  .student-header,
  .student-navigation,
  .tasks-grades-list {
    padding: 0.75rem;
  }

  .nav-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .task-grade-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1rem 0;
  }

  .grade-display {
    align-self: flex-end;
  }
}

/* Modo landscape en móviles */
@media screen and (max-width: 768px) and (orientation: landscape) {
  .course-detail-container {
    padding-top: 60px;
  }
}
</style>