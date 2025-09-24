<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="register-grade-container">
      <ArrowBack 
        :use-history-back="true"
        :show-text="true"
        text="Volver"
      />
      <div class="page-header">
        <div class="header-content">
          <h1 class="text-page-title">{{ courseData?.materia }} - Registrar Notas</h1>
          <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion">
            Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
          </div>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Sección de Selección de Tareas -->
      <div v-if="!selectedTask" class="tasks-section">
        <h2>Seleccionar Tarea</h2>
        <div class="tasks-list">
          <div v-for="task in tasks" :key="task.id"
               class="task-item"
               @click="selectTask(task)">
            <h3>{{ task.titulo }}</h3>
            <div class="task-details">
              <span class="task-value">Valor: {{ task.valor }} pts</span>
              <span class="task-date">Fecha: {{ formatDate(task.fecha_entrega) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Registro de Notas -->
      <div v-else class="grades-section">
        <div class="selected-task-header">
          <div class="task-info">
            <h2>{{ selectedTask.titulo }}</h2>
            <div class="task-meta mobile-only">
              <span>{{ selectedTask.valor }} pts</span>
            </div>
          </div>
          <button @click="selectedTask = null" class="back-btn">
            <span class="desktop-text">Volver a tareas</span>
            <span class="mobile-text">Volver</span>
          </button>
        </div>

        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar estudiante..."
            class="search-input"
          >
        </div>

        <!-- Vista Desktop de estudiantes -->
        <div class="students-list desktop-view">
          <div class="students-header">
            <div class="header-student">Estudiante</div>
            <div class="header-grade">Calificación</div>
            <div class="header-action">Acción</div>
          </div>
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
            </div>
            <div class="grade-action">
              <button
                @click="handleGradeAction(student)"
                :class="['grade-action-btn', student.hasExistingGrade ? 'update' : 'create']"
              >
                {{ student.hasExistingGrade ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Vista Mobile de estudiantes -->
        <div class="students-list mobile-view">
          <div v-for="student in filteredStudents" :key="student.carnet" class="student-card">
            <div class="student-card-header">
              <div class="student-info">
                <span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
                <span class="student-id">{{ student.carnet }}</span>
              </div>
            </div>
            <div class="student-card-content">
              <div class="grade-section">
                <label class="grade-label">Calificación:</label>
                <div class="grade-input-mobile">
                  <input
                    type="number"
                    v-model="student.grade"
                    :max="selectedTask.valor"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  >
                  <span class="max-points">/ {{ selectedTask.valor }}</span>
                </div>
              </div>
              <button
                @click="handleGradeAction(student)"
                :class="['grade-action-btn-mobile', student.hasExistingGrade ? 'update' : 'create']"
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
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications'

const { showNotification } = useNotifications()
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
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
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
      showNotification('Calificación actualizada exitosamente', 'success')
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
      showNotification('Calificación guardada exitosamente', 'success')
    }
  } catch (error) {
    console.error('Error handling grade:', error)
    showNotification(error.message, 'error')
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

    showNotification('Calificaciones guardadas exitosamente', 'success')
    selectedTask.value = null
    await fetchTasks()
  } catch (error) {
    console.error('Error saving grades:', error)
    showNotification('Error al guardar las calificaciones', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    courseData.value = JSON.parse(savedCourse)
    await Promise.all([fetchTasks(), fetchStudents()])

    const savedTask = sessionStorage.getItem('selectedTask')
    const directSelection = sessionStorage.getItem('directTaskSelection')

    if (savedTask && directSelection) {
      const task = JSON.parse(savedTask)
      await selectTask(task)
      sessionStorage.removeItem('directTaskSelection')
      sessionStorage.removeItem('selectedTask')
    }
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

.register-grade-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  max-width: 100%;
  overflow-x: hidden;
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

/* Sección de tareas */
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

.task-item h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.task-details {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

/* Header de tarea seleccionada */
.selected-task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.task-info h2 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.2;
}

.task-meta {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: #e0e0e0;
}

/* Buscador */
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

/* Vista desktop de estudiantes */
.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.students-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.students-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  font-weight: bold;
  border-bottom: 2px solid #dee2e6;
}

.student-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.student-row:last-child {
  border-bottom: none;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
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
  font-size: 0.9rem;
}

.max-points {
  color: #666;
  font-size: 0.9rem;
}

.grade-action {
  display: flex;
  justify-content: center;
}

.grade-action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  white-space: nowrap;
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

/* Botones de acción */
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

/* Estilos para móvil */
@media screen and (max-width: 768px) {
  .register-grade-container {
    margin-left: 0;
    padding: 1rem;
    margin-top: 5.25rem; /* Espacio para el botón hamburguesa */
  }

  .text-page-title {
    text-align: center;
  }

  .course-subtitle {
    font-size: 1rem;
  }

  /* Ocultar textos largos en móvil */
  .desktop-text {
    display: none;
  }

  .mobile-text {
    display: inline;
  }

  .mobile-only {
    display: block;
  }

  /* Tareas en móvil */
  .tasks-list {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .task-item {
    padding: 0.75rem;
  }

  .task-item h3 {
    font-size: 1rem;
  }

  .task-details {
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Header de tarea seleccionada en móvil */
  .selected-task-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .task-info h2 {
    font-size: 1.25rem;
  }

  .back-btn {
    align-self: flex-start;
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  /* Buscador en móvil */
  .search-input {
    max-width: none;
    font-size: 16px; /* Previene zoom en iOS */
  }

  /* Ocultar vista desktop y mostrar vista móvil */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  /* Vista móvil de estudiantes */
  .student-card {
    background: white;
    margin-bottom: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .student-card-header {
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
  }

  .student-card .student-info {
    gap: 0.25rem;
  }

  .student-card .student-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .student-card .student-id {
    font-size: 0.9rem;
  }

  .student-card-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .grade-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .grade-label {
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
  }

  .grade-input-mobile {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .grade-input-mobile input {
    flex: 1;
    max-width: 120px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
    font-size: 16px; /* Previene zoom en iOS */
  }

  .grade-action-btn-mobile {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .grade-action-btn-mobile.update {
    background: #f0ad4e;
    color: white;
  }

  .grade-action-btn-mobile.create {
    background: #5cb85c;
    color: white;
  }

  .grade-action-btn-mobile:hover {
    opacity: 0.9;
  }

  /* Botón de guardar en móvil */
  .actions {
    justify-content: stretch;
  }

  .save-btn {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
  }
}

/* Tablets */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .register-grade-container {
    padding: 1.5rem;
  }

  .tasks-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .student-row {
    grid-template-columns: 2fr 1.2fr 1fr;
  }

  .students-header {
    grid-template-columns: 2fr 1.2fr 1fr;
  }
}

/* Pantallas muy pequeñas */
@media screen and (max-width: 480px) {
  .register-grade-container {
    padding: 0.75rem;
    margin-top: 5.25rem;
  }

  

  .course-subtitle {
    font-size: 0.9rem;
  }

  .task-item {
    padding: 0.5rem;
  }

  .student-card-header,
  .student-card-content {
    padding: 0.75rem;
  }

  .grade-input-mobile input {
    padding: 0.5rem;
  }

  .grade-action-btn-mobile {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

/* Clases de utilidad para mostrar/ocultar en diferentes tamaños */
.mobile-only {
  display: none;
}

@media screen and (max-width: 768px) {
  .mobile-only {
    display: block;
  }
  
  .desktop-text {
    display: none;
  }
  
  .mobile-text {
    display: inline;
  }
}

@media screen and (min-width: 769px) {
  .mobile-text {
    display: none;
  }
  
  .desktop-text {
    display: inline;
  }
}
</style>


