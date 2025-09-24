<template>
  <div class="calendar-layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="calendar-container">
      <div class="header-section">
        <h1 class="text-page-title">Calendario de Tareas</h1>
        <div class="separator"></div>
      </div>

      <div class="calendar">
        <div class="calendar-header">
          <button @click="prevMonth" class="nav-btn" title="Mes anterior">←</button>
          <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>
          <button @click="nextMonth" class="nav-btn" title="Mes siguiente">→</button>
        </div>
        
        <div class="calendar-grid">
          <div class="day-header" v-for="day in daysOfWeek" :key="day">{{ day }}</div>
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="['day-cell', { 'current-day': isToday(day.date) }]"
          >
            <span class="day-number" v-if="day.date">{{ day.date.getDate() }}</span>
            <div class="homework-list" v-if="day.date">
              <div
                v-for="task in day.tasks"
                :key="task.id"
                class="homework-item"
                :style="{ color: courseColors[task.course_id] || '#666' }"
                :title="tooltipContent(task)"
                @click="showTaskDetails(task)"
              >
                <span class="task-title">{{ task.titulo }}</span>
                <span v-if="task.curso_nombre" class="task-course">{{ task.curso_nombre }}</span>
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
            <button @click="closeTaskModal" class="close-btn" title="Cerrar">×</button>
          </div>
          <div class="task-modal-content">
            <div v-if="selectedTask.curso_nombre" class="modal-field">
              <strong>Curso:</strong> {{ selectedTask.curso_nombre }}
            </div>
            <div v-if="selectedTask.fecha_entrega" class="modal-field">
              <strong>Fecha de entrega:</strong> {{ formatDate(selectedTask.fecha_entrega) }}
            </div>
            <div v-if="selectedTask.descripcion" class="modal-field">
              <strong>Descripción:</strong> {{ selectedTask.descripcion }}
            </div>
            <div v-if="selectedTask.puntos_tarea" class="modal-field">
              <strong>Puntaje:</strong> {{ selectedTask.puntos_tarea }} puntos
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tareas...</p>
      </div>

      <!-- Estado vacío cuando no hay tareas -->
      <div v-if="!loading && tasks.length === 0" class="empty-state">
        <CalendarDays class="empty-icon" />
        <h3>No hay tareas programadas</h3>
        <p>Las tareas que asignes aparecerán en este calendario.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next';
import { getCourseColor, subscribeToColorChanges } from '@/utils/courseColors.js';

const router = useRouter();

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
];

const currentDate = ref(new Date());
const tasks = ref([]);
const courseColors = ref({});
const loading = ref(true);
const selectedTask = ref(null);

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

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const currentMonthName = computed(() =>
  currentDate.value.toLocaleString('es-ES', { month: 'long' })
);
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarDays = computed(() => {
  const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  // Días vacíos al inicio del mes
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, tasks: [] });
  }
  
  // Días del mes con tareas
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), i);
    const dayTasks = tasks.value.filter(task => {
      if (!task.fecha_entrega) return false;
      return new Date(task.fecha_entrega).toDateString() === date.toDateString();
    });
    days.push({ date, tasks: dayTasks });
  }
  
  return days;
});

const fetchTasks = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await fetch(`http://localhost:3000/api/teacher/tasks/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      tasks.value = Array.isArray(data) ? data : [];
      assignCourseColors();
    } else {
      tasks.value = [];
      console.error('Error fetching tasks:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    tasks.value = [];
  } finally {
    loading.value = false;
  }
};

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const handleItemClick = (item) => {
  if (item.path) router.push(item.path);
};

// Mostrar detalles de tarea (especialmente útil en móvil)
const showTaskDetails = (task) => {
  selectedTask.value = task;
};

const closeTaskModal = () => {
  selectedTask.value = null;
};

// Formatear fecha para mostrar
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Tooltip content para desktop
const tooltipContent = (task) => {
  let text = `"${task.titulo}"`;
  if (task.curso_nombre) text += `\nCurso: ${task.curso_nombre}`;
  if (task.fecha_entrega) text += `\nEntrega: ${formatDate(task.fecha_entrega)}`;
  if (task.puntos_tarea) text += `\nPuntaje: ${task.puntos_tarea} puntos`;
  return text;
};

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
/* Layout base */
.calendar-layout {
  display: flex;
  min-height: 100vh;
}

.calendar-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  max-width: 100%;
  box-sizing: border-box;
  transition: margin-left 0.3s ease;
}

/* Header section */
.header-section {
  margin-bottom: 2rem;
}



.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Calendario */
.calendar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.month-title {
  flex: 1;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-transform: capitalize;
}

.nav-btn {
  background: #1b9963;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.nav-btn:hover {
  background: #158a50;
  transform: translateY(-1px);
}

.nav-btn:active {
  transform: translateY(0);
}

/* Grid del calendario */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  min-width: 600px;
}

.day-header {
  font-weight: 600;
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #495057;
  border: 1px solid #e9ecef;
}

.day-cell {
  min-height: 120px;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
}

.day-cell:hover {
  border-color: #1b9963;
  box-shadow: 0 2px 4px rgba(27, 153, 99, 0.1);
}

.current-day {
  border: 2px solid #1b9963;
  background: #f0f9f4;
  box-shadow: 0 2px 8px rgba(27, 153, 99, 0.2);
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #495057;
}

.current-day .day-number {
  color: #1b9963;
  font-weight: 700;
}

/* Lista de tareas */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

.homework-item {
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  line-height: 1.3;
  word-break: break-word;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid transparent;
  min-height: 2.2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.homework-item:hover {
  background: rgba(27, 153, 99, 0.1);
  border-color: rgba(27, 153, 99, 0.2);
  transform: translateY(-1px);
}

.task-title {
  font-weight: 600;
  margin-bottom: 0.1rem;
  display: block;
}

.task-course {
  font-size: 0.7rem;
  opacity: 0.8;
  font-weight: 400;
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
  backdrop-filter: blur(4px);
}

.task-modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.task-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.task-modal-header h3 {
  margin: 0;
  color: #1b9963;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e9ecef;
  color: #333;
}

.task-modal-content {
  padding: 1.5rem;
}

.modal-field {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #1b9963;
}

.modal-field:last-child {
  margin-bottom: 0;
}

.modal-field strong {
  color: #495057;
  margin-right: 0.5rem;
}

/* Loading state */
.loading-container {
  margin-top: 3rem;
  text-align: center;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive Design */

/* Tablet */
@media screen and (max-width: 1024px) {
  .calendar-container {
    padding: 1.5rem;
  }
  
  
  
  .day-cell {
    min-height: 100px;
  }
  
  .homework-item {
    font-size: 0.75rem;
    padding: 0.3rem 0.4rem;
  }
}

/* Móvil */
@media screen and (max-width: 768px) {
  .calendar-container {
    margin-left: 0;
    padding: 1rem;
    margin-top: 5.25rem; /* Espacio para el botón hamburguesa */
  }

  .text-page-title {
    text-align: center;
  }

  .calendar {
    padding: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .calendar-header {
    margin-bottom: 1rem;
    gap: 0.5rem;
  }

  .month-title {
    font-size: 1.25rem;
  }

  .nav-btn {
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    min-width: 40px;
    height: 40px;
  }

  .calendar-grid {
    gap: 0.25rem;
    min-width: 300px;
  }

  .day-header {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }

  .day-cell {
    min-height: 70px;
    padding: 0.5rem;
  }

  .day-number {
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }

  .homework-item {
    font-size: 0.7rem;
    padding: 0.25rem 0.3rem;
    min-height: 1.8rem;
  }

  .task-course {
    font-size: 0.65rem;
  }

  /* Modal responsive */
  .task-modal {
    margin: 1rem;
    max-height: 90vh;
  }

  .task-modal-header {
    padding: 1rem;
  }

  .task-modal-header h3 {
    font-size: 1.1rem;
  }

  .task-modal-content {
    padding: 1rem;
  }

  .modal-field {
    padding: 0.5rem;
    margin-bottom: 0.75rem;
  }
}

/* Móviles muy pequeños */
@media screen and (max-width: 480px) {
  .calendar-container {
    padding: 0.75rem;
    margin-top: 5.25rem;
  }

  

  .calendar {
    padding: 0.75rem;
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
    min-height: 60px;
    padding: 0.3rem;
  }

  .day-number {
    font-size: 0.8rem;
  }

  .homework-item {
    font-size: 0.65rem;
    padding: 0.2rem;
    min-height: 1.5rem;
  }

  .task-modal {
    margin: 0.5rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .calendar-container,
  .nav-btn,
  .homework-item,
  .loading-spinner,
  .day-cell {
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
    min-height: 50px;
  }

  .calendar {
    padding: 1rem;
  }
}

/* Tema de color coherente */
:root {
  --primary-color: #1b9963;
  --primary-hover: #158a50;
  --primary-light: #f0f9f4;
  --border-color: #dee2e6;
  --text-color: #495057;
  --background-light: #f8f9fa;
}
</style>


