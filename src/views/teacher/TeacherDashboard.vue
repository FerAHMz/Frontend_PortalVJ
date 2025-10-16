<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="dashboard-container">
      <div class="header-section">
        <h1 class="text-page-title">Tablero</h1>
      </div>
      <div class="separator"></div>
      
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando cursos...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>Error al cargar cursos</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="retryLoadCourses">
          Reintentar
        </button>
      </div>

      <!-- Courses grid -->
      <div v-else-if="courses.length > 0" class="courses-grid">
        <div 
          v-for="course in courses" 
          :key="course.id"
          class="course-card"
          :style="{ backgroundColor: course.color }"
          @click="navigateToCourse(course)"
        >
          <div class="card-header">
            <div class="course-code">{{ course.codigo }}</div>
            <button 
              class="color-picker-btn"
              @click.stop="toggleColorPicker(course.id)"
              title="Cambiar color"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div class="card-content">
            <h3 class="course-title">{{ course.materia }}</h3>
            <div class="course-info">
              <span class="course-detail">{{ course.grado }}</span>
              <span class="course-detail">{{ course.seccion }}</span>
            </div>
            <div class="course-cycle">{{ course.ciclo }}</div>
          </div>

          <!-- Color Picker Dropdown -->
          <div 
            v-if="showColorPicker === course.id" 
            class="color-picker-dropdown"
            @click.stop
          >
            <div class="color-options">
              <button
                v-for="color in colorOptions"
                :key="color.value"
                class="color-option"
                :style="{ backgroundColor: color.value }"
                @click="changeColor(course.id, color.value)"
                :title="color.name"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <BookOpen size="64" />
        </div>
        <h3>No hay cursos asignados</h3>
        <p>Aún no tienes cursos asignados para este período académico.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { courseService } from '@/services/courseService.js'
import { getCurrentUser } from '@/utils/auth.js'
import {
  User,
  ClipboardList,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare,
  Info
} from 'lucide-vue-next'
import { COLOR_OPTIONS, getCourseColor, setCourseColor } from '@/utils/courseColors.js'
import { downloadInstructivePDF } from '@/composables/useInstructivePDF'

const router = useRouter()
const showColorPicker = ref(null)
const courses = ref([])
const loading = ref(true)
const error = ref(null)

// Obtener el ID del maestro desde el sistema de autenticación
const getCurrentTeacherId = () => {
  const user = getCurrentUser()
  return user?.id || user?.maestro_id || null
}

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' },
  { label: 'Instructivo', icon: Info, action: 'downloadInstructive' }
]

const colorOptions = COLOR_OPTIONS

// Función para cargar cursos del maestro desde la API
const loadTeacherCourses = async () => {
  try {
    loading.value = true
    error.value = null
    
    const teacherId = getCurrentTeacherId()
    if (!teacherId) {
      throw new Error('No se pudo obtener el ID del maestro')
    }

    let response
    try {
      // Intentar usar la ruta específica del maestro
      response = await courseService.getCoursesByTeacher(teacherId)
    } catch (specificErr) {
      // Si falla, usar la ruta general y filtrar
      console.log('Ruta específica no disponible, usando ruta general...')
      response = await courseService.getCourses()
      // Filtrar cursos del maestro actual
      response.data = response.data.filter(course => 
        course.id_maestro?.toString() === teacherId.toString()
      )
    }
    
    // Transformar datos y agregar colores
    courses.value = response.data.map((course, index) => {
      // Usar utilidad de colores para consistencia
      const color = getCourseColor(course.id, index)
      
      return {
        id: course.id,
        materia: course.materia.toUpperCase(),
        grado: course.grado.toUpperCase(),
        seccion: course.seccion.toUpperCase(),
        nombre_maestro: course.nombre_maestro,
        apellido_maestro: course.apellido_maestro,
        ciclo: new Date().getFullYear().toString(),
        color: color,
        id_maestro: course.id_maestro,
        id_materia: course.id_materia,
        id_grado_seccion: course.id_grado_seccion
      }
    })
    
  } catch (err) {
    console.error('Error al cargar cursos:', err)
    error.value = err.response?.data?.error || err.message || 'Error al cargar los cursos'
  } finally {
    loading.value = false
  }
}

const handleItemClick = (item) => {
  if (item.action === 'downloadInstructive') {
    downloadInstructivePDF()
  } else if (item.path) {
    router.push(item.path)
  }
}

const navigateToCourse = (course) => {
  // Guardar datos del curso en sessionStorage
  sessionStorage.setItem('currentCourse', JSON.stringify(course))
  
  router.push({
    name: 'CourseDetail',
    params: { courseId: course.id },
    state: { courseData: course }
  })
}

const toggleColorPicker = (courseId) => {
  showColorPicker.value = showColorPicker.value === courseId ? null : courseId
}

const changeColor = async (courseId, newColor) => {
  const courseIndex = courses.value.findIndex(course => course.id === courseId)
  if (courseIndex !== -1) {
    courses.value[courseIndex].color = newColor
    
    // Usar utilidad de colores para notificar cambios a otros componentes
    setCourseColor(courseId, newColor)
  }
  showColorPicker.value = null
}

// Retry function for loading courses
const retryLoadCourses = () => {
  loadTeacherCourses()
}

// Cerrar color picker al hacer click fuera
const handleClickOutside = (event) => {
  if (!event.target.closest('.color-picker-btn') && !event.target.closest('.color-picker-dropdown')) {
    showColorPicker.value = null
  }
}

onMounted(() => {
  loadTeacherCourses()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.dashboard-container {
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
  overflow: auto;
  margin-left: 130px;
  transition: margin-left 0.3s ease;
}

.header-section {
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 2rem;
  width: 100%;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.course-card {
  position: relative;
  background: #4a5568;
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.course-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.course-code {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.color-picker-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-picker-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.card-content {
  position: relative;
  z-index: 2;
}

.course-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  min-height: 2.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-info {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.course-detail {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.course-cycle {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
}

/* Color Picker Dropdown */
.color-picker-dropdown {
  position: absolute;
  top: 3.5rem;
  right: 1rem;
  background: white;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  border: 1px solid #e9ecef;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00923f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.error-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
  color: #dc3545;
}

.error-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #dc3545;
}

.error-state p {
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.retry-btn {
  background: #00923f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #007a35;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 146, 63, 0.3);
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #495057;
}

.empty-state p {
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

/* Tablet styles */
@media screen and (max-width: 1024px) {
  .dashboard-container {
    padding: 1.5rem;
  }
  
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }
  
  
}

/* Mobile styles */
@media screen and (max-width: 768px) {
  .dashboard-container {
    margin-left: 0;
    padding: 1rem;
    margin-top: 5.25rem;
  }
  
  .text-page-title {
    text-align: center;
  }
  
  .header-section {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .course-card {
    padding: 1.25rem;
  }
  
  .course-title {
    font-size: 1.1rem;
  }
  
  .course-info {
    gap: 0.5rem;
  }
  
  .course-detail {
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
  }
  
  .color-picker-dropdown {
    right: 0.75rem;
    top: 3rem;
  }
  
  .color-options {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }
  
  .color-option {
    width: 28px;
    height: 28px;
  }
}

/* Small mobile styles */
@media screen and (max-width: 480px) {
  .dashboard-container {
    padding: 0.8rem;
    padding-top: 4.5rem;
  }
  
  .page-subtitle {
    font-size: 0.95rem;
  }
  
  .course-card {
    padding: 1rem;
  }
  
  .course-title {
    font-size: 1rem;
    min-height: 2.4rem;
  }
  
  .course-code {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }
  
  .color-picker-btn {
    padding: 0.4rem;
  }
  
  .color-picker-btn svg {
    width: 16px;
    height: 16px;
  }
}

/* Animaciones adicionales */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.course-card {
  animation: fadeIn 0.5s ease-out;
}

.course-card:nth-child(1) { animation-delay: 0.1s; }
.course-card:nth-child(2) { animation-delay: 0.2s; }
.course-card:nth-child(3) { animation-delay: 0.3s; }
.course-card:nth-child(4) { animation-delay: 0.4s; }
.course-card:nth-child(5) { animation-delay: 0.5s; }
.course-card:nth-child(6) { animation-delay: 0.6s; }
</style>


