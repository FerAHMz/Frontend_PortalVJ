<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="course-detail-container">
      <h1 class="page-title">{{ courseData?.materia }} - Calificaciones</h1>
      <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
        Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
      </div>
      <div class="separator"></div>

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

      <div class="grades-table-container">
        <table class="grades-table">
          <thead>
            <tr>
              <th class="student-column">Nombre del Estudiante</th>
              <th v-for="task in tasks" :key="task.id">
                {{ task.titulo }}
                <div class="task-value">({{ task.valor }} pts)</div>
              </th>
              <th class="average-column">
                Promedio
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
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

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

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

const studentsWithAverages = computed(() => {
  return students.value.map(student => {
    return {
      ...student,
      average: parseFloat(student.average || 0).toFixed(2)
    }
  })
})

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

.grades-table-container {
  overflow-x: auto;
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
}

.student-name {
  text-align: left;
}

.task-value {
  font-size: 0.8em;
  color: #666;
  margin-top: 4px;
}

.grade-cell {
  font-weight: 500;
}

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

.average-column {
  background-color: #f0f7ff;
}

.average-grade {
  font-weight: bold;
  color: #2c3e50;
}
</style>