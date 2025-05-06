<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="register-grade-container">
      <h1 class="page-title">{{ courseData?.materia }} - Registrar Notas</h1>
      <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
        Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
      </div>
      <div class="separator"></div>

      <!-- Task Selection Section -->
      <div v-if="!selectedTask" class="tasks-section">
        <h2>Seleccionar Tarea</h2>
        <div class="tasks-list">
          <div v-for="task in tasks" :key="task.id" 
               class="task-item" 
               @click="selectTask(task)">
            <h3>{{ task.titulo }}</h3>
            <div class="task-details">
              <span>Valor: {{ task.valor }} pts</span>
              <span>Fecha: {{ formatDate(task.fecha_entrega) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Grade Registration Section -->
      <div v-else class="grades-section">
        <div class="selected-task-header">
          <h2>{{ selectedTask.titulo }}</h2>
          <button @click="selectedTask = null" class="back-btn">
            Volver a tareas
          </button>
        </div>

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
            <div class="grade-input">
              <input 
                type="number" 
                v-model="student.grade" 
                :max="selectedTask.valor"
                min="0"
                step="0.01"
                placeholder="Nota"
              >
              <span class="max-points">/ {{ selectedTask.valor }}</span>
              <button 
                @click="handleGradeAction(student)"
                :class="['grade-action-btn', student.hasExistingGrade ? 'update' : 'create']"
              >
                {{ student.hasExistingGrade ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>

        <div class="actions">
          <button @click="saveGrades" class="save-btn" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Todas las Calificaciones' }}
          </button>
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
const tasks = ref([])
const students = ref([])
const selectedTask = ref(null)
const searchQuery = ref('')
const saving = ref(false)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays },
  { label: 'Boleta de calificaciones', icon: FileText },
  { label: 'Comunicación', icon: MessageSquare }
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

const fetchStudents = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/teacher/courses/${route.params.courseId}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    students.value = data.map(student => ({
      ...student,
      grade: '',
      hasExistingGrade: false
    }))
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

const fetchTaskGrades = async (taskId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/teacher/courses/${route.params.courseId}/tasks/${taskId}/grades`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!response.ok) return []
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching task grades:', error)
    return []
  }
}

const selectTask = async (task) => {
  selectedTask.value = task
  const existingGrades = await fetchTaskGrades(task.id)
  
  students.value = students.value.map(student => {
    const studentGrade = existingGrades.find(g => 
      g.carnet_estudiante === student.carnet && 
      g.id_tarea === task.id
    )
    return {
      ...student,
      grade: studentGrade ? studentGrade.nota.toString() : '',
      hasExistingGrade: !!studentGrade
    }
  })
}

const handleGradeAction = async (student) => {
  try {
    const token = localStorage.getItem('token')
    const baseUrl = `http://localhost:3000/api/teacher/courses/${route.params.courseId}/tasks/${selectedTask.value.id}/grades`
    
    if (student.hasExistingGrade) {
      const response = await fetch(`${baseUrl}/${student.carnet}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nota: parseFloat(student.grade) })
      })
      if (!response.ok) throw new Error('Error al actualizar la calificación')
      alert('Calificación actualizada exitosamente')
    } else {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          grades: [{
            carnet_estudiante: student.carnet,
            id_curso: parseInt(route.params.courseId),
            id_tarea: selectedTask.value.id,
            nota: parseFloat(student.grade)
          }]
        })
      })
      if (!response.ok) throw new Error('Error al guardar la calificación')
      student.hasExistingGrade = true
      alert('Calificación guardada exitosamente')
    }
  } catch (error) {
    console.error('Error handling grade:', error)
    alert(error.message)
  }
}

const saveGrades = async () => {
  try {
    saving.value = true
    const token = localStorage.getItem('token')
    const gradesToSave = students.value
      .filter(student => student.grade !== '')
      .map(student => ({
        carnet_estudiante: student.carnet,
        id_curso: parseInt(route.params.courseId),
        id_tarea: selectedTask.value.id,
        nota: parseFloat(student.grade)
      }))

    const response = await fetch(`http://localhost:3000/api/teacher/courses/${route.params.courseId}/tasks/${selectedTask.value.id}/grades`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grades: gradesToSave })
    })

    if (!response.ok) {
      throw new Error('Error al guardar las calificaciones')
    }

    alert('Calificaciones guardadas exitosamente')
    selectedTask.value = null
    await fetchTasks() 
  } catch (error) {
    console.error('Error saving grades:', error)
    alert('Error al guardar las calificaciones')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    courseData.value = JSON.parse(savedCourse)
  }
  fetchTasks()
  fetchStudents()
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

.register-grade-container {
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

.tasks-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.task-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.task-item:hover {
  transform: translateY(-2px);
}

.task-details {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: #666;
}

.selected-task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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

.grade-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grade-input input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.max-points {
  color: #666;
}

.grade-action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.grade-action-btn.update {
  background: #f0ad4e;
  color: white;
}

.grade-action-btn.create {
  background: #5cb85c;
  color: white;
}

.grade-action-btn:hover {
  opacity: 0.9;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background: #1b9963;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>