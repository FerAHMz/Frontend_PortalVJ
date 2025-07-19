<template>
  <div class="calendar-layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="calendar-container">
      <h1 class="page-title">Calendario de Tareas de Mis Hijos</h1>
      <div class="separator"></div>
      <div class="calendar">
        <div class="calendar-header">
          <button @click="prevMonth" class="nav-btn">←</button>
          <h2>{{ currentMonthName }} {{ currentYear }}</h2>
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
              >
                {{ task.titulo }}<span v-if="task.hijo_nombre"> - {{ task.hijo_nombre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" style="margin-top:2rem;text-align:center;">Cargando tareas...</div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue';
import { User, BookOpen, CalendarDays, FileText, MessageSquare, CreditCard } from 'lucide-vue-next';

const router = useRouter()

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' },
  { label: 'Calendario', icon: CalendarDays, path: '/parent/calendar' },
  { label: 'Mensajes', icon: MessageSquare, path: '/parent/messages' }
]

const currentDate = ref(new Date())
const tasks = ref([])
const courseColors = ref({})
const loading = ref(true)

const generateColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const assignCourseColors = () => {
  tasks.value.forEach((task) => {
    if (!courseColors.value[task.course_id]) {
      courseColors.value[task.course_id] = generateColor()
    }
  })
}

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

    // Adjust endpoint as needed by your backend
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

// Tooltip text for assignment
const tooltipContent = (task) => {
  let text = `"${task.titulo}"`
  if (task.curso_nombre) text += `\nCurso: ${task.curso_nombre}`
  if (task.hijo_nombre) text += `\nHijo: ${task.hijo_nombre}`
  if (task.fecha_entrega) text += `\nEntrega: ${new Date(task.fecha_entrega).toLocaleDateString('es-ES')}`
  return text
}

onMounted(() => {
  fetchTasks()
})
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
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

.calendar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-header {
  font-weight: bold;
  text-align: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.day-cell {
  min-height: 100px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.current-day {
  border: 2px solid #1b9963;
}

.day-number {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.homework-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.homework-item {
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}
</style>