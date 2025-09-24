<template>
  <div class="calendar-layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="calendar-container">
      <h1 class="text-page-title">Calendario de Tareas de Mis Hijos</h1>
      <div class="separator"></div>
      <div class="calendar">
        <div class="calendar-header">
          <button @click="prevMonth" class="nav-btn">←</button>
          <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>
          <button @click="nextMonth" class="nav-btn">→</button>
        </div>
        <div class="calendar-grid">
          <div class="day-header" v-for="day in daysOfWeek" :key="day">{{ day }}</div>
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="['day-cell', { 'current-day': isToday(day.date) }]"
          >
            <span class="day-number" v-if="day.date">{{ day.date.getDate() }}</span>
            <div class="homework-list">
              <div
                v-for="task in day.tasks"
                :key="task.id"
                class="homework-item"
                :style="{ color: courseColors[task.course_id] || 'gray' }"
                :title="tooltipContent(task)"
                @click="showTaskDetails(task)"
              >
                <span class="task-title">{{ task.titulo }}</span>
                <span v-if="task.hijo_nombre" class="task-child"> - {{ task.hijo_nombre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal para mostrar detalles de tarea en móvil -->
      <div v-if="selectedTask" class="task-modal-overlay" @click="closeTaskModal">
        <div class="task-modal" @click.stop>
          <div class="task-modal-header">
            <h3>{{ selectedTask.titulo }}</h3>
            <button @click="closeTaskModal" class="close-btn">×</button>
          </div>
          <div class="task-modal-content">
            <p v-if="selectedTask.curso_nombre"><strong>Curso:</strong> {{ selectedTask.curso_nombre }}</p>
            <p v-if="selectedTask.hijo_nombre"><strong>Hijo:</strong> {{ selectedTask.hijo_nombre }}</p>
            <p v-if="selectedTask.fecha_entrega"><strong>Fecha de entrega:</strong> {{ formatDate(selectedTask.fecha_entrega) }}</p>
            <p v-if="selectedTask.descripcion"><strong>Descripción:</strong> {{ selectedTask.descripcion }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tareas...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue';
import { User, BookOpen, CalendarDays, FileText, MessageSquare, CreditCard } from 'lucide-vue-next';
import { getCourseColor, subscribeToColorChanges } from '@/utils/courseColors.js';

const router = useRouter()

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' },
  { label: 'Calendario', icon: CalendarDays, path: '/parent/calendar' }
]

const currentDate = ref(new Date())
const tasks = ref([])
const courseColors = ref({})
const loading = ref(true)
const selectedTask = ref(null)

const colorOptions = [
  '#4a5568', '#d97706', '#9f7aea', '#0891b2', '#db2777', '#ca8a04',
  '#059669', '#dc2626', '#4f46e5', '#10b981', '#06b6d4', '#8b5cf6'
];

const generateColor = (index = 0) => {
  return colorOptions[index % colorOptions.length];
};

const assignCourseColors = () => {
  tasks.value.forEach((task, index) => {
    if (!courseColors.value[task.course_id]) {
      // Use the color utility to get consistent colors
      courseColors.value[task.course_id] = getCourseColor(task.course_id, index);
    }
  });
};

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const currentMonthName = computed(() =>
  currentDate.value.toLocaleString('es-ES', { month: 'long' })
)
const currentYear = computed(() => currentDate.value.getFullYear())

const calendarDays = computed(() => {
  const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  const startDay = startOfMonth.getDay()
  const daysInMonth = endOfMonth.getDate()

  const days = []
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, tasks: [] })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), i)
    const dayTasks = tasks.value.filter(task => {
      return new Date(task.fecha_entrega).toDateString() === date.toDateString()
    })
    days.push({ date, tasks: dayTasks })
  }
  return days
})

const fetchTasks = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No se encontró token de autenticación')

    // Ajustar endpoint según tu backend
    const response = await fetch(`http://localhost:3000/api/parent/tasks/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      tasks.value = Array.isArray(data) ? data : []
      assignCourseColors()
    } else {
      tasks.value = []
    }
  } catch (error) {
    console.error('Error fetching parent tasks:', error)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

// Mostrar detalles de tarea (especialmente útil en móvil)
const showTaskDetails = (task) => {
  selectedTask.value = task
}

const closeTaskModal = () => {
  selectedTask.value = null
}

// Formatear fecha para mostrar
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Tooltip text para assignment
const tooltipContent = (task) => {
  let text = `"${task.titulo}"`
  if (task.curso_nombre) text += `\nCurso: ${task.curso_nombre}`
  if (task.hijo_nombre) text += `\nHijo: ${task.hijo_nombre}`
  if (task.fecha_entrega) text += `\nEntrega: ${new Date(task.fecha_entrega).toLocaleDateString('es-ES')}`
  return text
}

let unsubscribeColorChanges = null;

onMounted(() => {
  fetchTasks();
  
  // Subscribe to color changes from other components (like dashboard)
  unsubscribeColorChanges = subscribeToColorChanges((courseId, newColor) => {
    // Update the color for this course if it exists in our tasks
    courseColors.value[courseId] = newColor;
  });
});

onUnmounted(() => {
  // Clean up subscription
  if (unsubscribeColorChanges) {
    unsubscribeColorChanges();
  }
});
</script>

<style scoped>
.calendar-layout {
  display: flex;
  min-height: 100vh;
}

.calendar-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  transition: margin-left 0.3s ease;
}

.calendar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  overflow-x: auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.month-title {
  flex: 1;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.nav-btn {
  background: #00923f;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #007a36;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  min-width: 600px;
}

.day-header {
  font-weight: bold;
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
}

.day-cell {
  min-height: 100px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.current-day {
  border: 2px solid #00923f;
  background: #f0f9f4;
}

.day-number {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.homework-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.homework-item {
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  line-height: 1.2;
  word-break: break-word;
  transition: background-color 0.2s ease;
}

.homework-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.task-title {
  display: block;
}

.task-child {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Modal para detalles de tarea */
.task-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
}

.task-modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.task-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.task-modal-header h3 {
  margin: 0;
  color: #00923f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f0f0f0;
}

.task-modal-content {
  padding: 1rem;
}

.task-modal-content p {
  margin: 0.5rem 0;
}

/* Loading spinner */
.loading-container {
  margin-top: 2rem;
  text-align: center;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00923f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estilos responsive para tablet */
@media screen and (max-width: 1024px) {
  .calendar-container {
    padding: 1.5rem;
  }
  
  .day-cell {
    min-height: 80px;
  }
  
  .homework-item {
    font-size: 0.75rem;
  }
}

/* Estilos responsive para móvil */
@media screen and (max-width: 768px) {
  .calendar-container {
    margin-left: 0;
    padding: 1rem;
  }

  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .calendar {
    padding: 0.75rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .calendar-header {
    margin-bottom: 0.75rem;
  }

  .month-title {
    font-size: 1.2rem;
  }

  .nav-btn {
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    min-width: 40px;
    height: 40px;
  }

  .calendar-grid {
    gap: 0.25rem;
    min-width: 280px;
  }

  .day-header {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }

  .day-cell {
    min-height: 60px;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .homework-item {
    font-size: 0.7rem;
    padding: 0.15rem;
  }

  .task-child {
    font-size: 0.6rem;
  }

  /* Ocultar tooltips en móvil ya que tenemos el modal */
  .homework-item:hover {
    background: rgba(0, 146, 63, 0.1);
  }
}

/* Estilos para móviles muy pequeños */
@media screen and (max-width: 480px) {
  .calendar-container {
    padding: 0.75rem;
  }

  .text-page-title {
    margin-bottom: 0.8rem;
  }

  .calendar {
    padding: 0.5rem;
  }

  .month-title {
    font-size: 1.1rem;
  }

  .nav-btn {
    font-size: 1.1rem;
    min-width: 36px;
    height: 36px;
  }

  .day-cell {
    min-height: 50px;
    padding: 0.2rem;
  }

  .day-number {
    font-size: 0.75rem;
  }

  .homework-item {
    font-size: 0.65rem;
  }

  .task-modal {
    margin: 0.5rem;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .calendar-container,
  .nav-btn,
  .homework-item,
  .loading-spinner {
    transition: none;
    animation: none;
  }
}

/* Soporte para modo landscape en móvil */
@media screen and (max-height: 600px) and (orientation: landscape) {
  .calendar-container {
    padding-top: 60px;
  }
  
  .day-cell {
    min-height: 45px;
  }
}
</style>
