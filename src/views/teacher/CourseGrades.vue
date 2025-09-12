<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="course-detail-container">
      <ArrowBack 
        :to="`/teacher/courses/${route.params.courseId}`"
        :show-text="true" 
        text="Volver al Curso"
      />
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title" style="opacity: 1; transform: none;">
            {{ courseData?.materia || 'Calificaciones del Curso' }}
          </h1>
          <div class="course-subtitle" v-if="courseData?.grado && courseData?.seccion" style="opacity: 1; transform: none;">
            <span class="badge-info">Grado: {{ courseData.grado }}</span>
            <span class="badge-info">Sección: {{ courseData.seccion }}</span>
          </div>
        </div>
      </div>
      <div class="separator" style="opacity: 1; transform: none;"></div>
      
      <CardList :items="gradeOptions" @item-clicked="handleOptionClick">
        <template #item="{ item }">
          <div class="option-item">
            <div class="option-content">
              <h3 class="option-title">{{ item.label }}</h3>
            </div>
            <div class="option-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </template>
      </CardList>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import CardList from '@/components/CardList.vue'
import ArrowBack from '@/components/common/ArrowBack.vue'
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

// Pre-cargar datos síncronamente antes del mount
const getCourseData = () => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    try {
      return JSON.parse(savedCourse)
    } catch (error) {
      console.error('Error parsing course data:', error)
    }
  }
  // Fallback más descriptivo para mobile
  return { 
    materia: 'Calificaciones del Curso', 
    grado: '', 
    seccion: '' 
  }
}

// Asegurar que siempre tengamos datos válidos
const courseData = ref(getCourseData())

// Garantizar que nunca hay valores undefined que causen flasheo
if (!courseData.value.materia) {
  courseData.value.materia = 'Calificaciones del Curso'
}
if (!courseData.value.grado) {
  courseData.value.grado = ''
}
if (!courseData.value.seccion) {
  courseData.value.seccion = ''
}

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const gradeOptions = [
  { label: 'Crear tarea', path: 'create-task' },
  { label: 'Ver tareas', path: 'view-task' },
  { label: 'Registrar nota', path: 'register-grade' },
  { label: 'Ver calificaciones', path: 'view-grades' },
  { label: 'Registrar observaciones', path: 'observations' }
]

onMounted(() => {
  // Verificar que tenemos datos del curso, si no redirigir
  if (!courseData.value || !courseData.value.materia || courseData.value.materia === 'Calificaciones del Curso') {
    router.push('/teacher/courses')
  }
})

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const handleOptionClick = (option) => {
  if (option.path === 'create-task') {
    router.push(`/teacher/courses/${route.params.courseId}/create-task`)
  } else if (option.path === 'view-task') {
    router.push(`/teacher/courses/${route.params.courseId}/view-tasks`)
  } else if (option.path === 'register-grade') {
    router.push(`/teacher/courses/${route.params.courseId}/register-grade`)
  } else if (option.path === 'view-grades') {
    router.push(`/teacher/courses/${route.params.courseId}/view-grades`)
  } else if (option.path === 'observations') {
    router.push(`/teacher/courses/${route.params.courseId}/observations`)
  } 
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
  margin-left: 130px; /* Espacio para sidebar en desktop */
  transition: margin-left 0.3s ease;
}

.header-section {
  margin-bottom: 1rem;
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
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.loading-placeholder {
  opacity: 0.7;
}

.loading-placeholder.loaded {
  opacity: 1;
}

/* Optimizaciones específicas para mobile */
@media screen and (max-width: 768px) {
  .page-title {
    font-size: 1.6rem;
    min-height: 2rem;
    /* Evitar saltos de layout en mobile */
    line-height: 1.2;
    text-align: center;
    word-break: break-word;
    hyphens: auto;
  }
  
  .course-subtitle {
    /* Estabilizar layout mientras carga */
    min-height: 3rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .badge-info {
    /* Evitar shifts en mobile */
    min-width: 80px;
    text-align: center;
  }
}

.course-subtitle {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  min-height: 1.5rem;
}

.badge-info {
  background: #f8f9fa;
  color: #495057;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.option-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #00923f;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.option-arrow {
  color: #00923f;
  margin-left: 1rem;
  transition: transform 0.3s ease;
}

.option-item:hover .option-arrow {
  transform: translateX(4px);
}

/* Tablet styles */
@media screen and (max-width: 1024px) {
  .course-detail-container {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .option-item {
    padding: 1.25rem;
  }
  
  .option-title {
    font-size: 1.1rem;
  }
}

/* Mobile styles */
@media screen and (max-width: 768px) {
  .course-detail-container {
    margin-left: 0; /* Sin margen en móvil */
    padding: 1rem;
    padding-top: 5rem; /* Espacio para el botón hamburguesa */
  }
  
  .header-section {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: #00923f;
  }
  
  .course-subtitle {
    justify-content: center;
    gap: 0.5rem;
  }
  
  .badge-info {
    background: #00923f;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
  }
  
  .separator {
    margin-bottom: 1.25rem;
  }
  
  .option-item {
    padding: 1.25rem 1rem;
    margin-bottom: 0.75rem;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
  
  .option-title {
    font-size: 1.1rem;
    color: #00923f;
    font-weight: 700;
  }
  
  .option-arrow {
    margin-left: 0.75rem;
  }
}

/* Small mobile styles */
@media screen and (max-width: 480px) {
  .course-detail-container {
    padding: 0.8rem;
    padding-top: 4.5rem;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .course-subtitle {
    flex-direction: column;
    gap: 0.4rem;
  }
  
  .badge-info {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .option-item {
    padding: 1rem 0.8rem;
    margin-bottom: 0.6rem;
  }
  
  .option-title {
    font-size: 1rem;
  }
  
  .option-arrow {
    margin-left: 0.5rem;
  }
  
  .option-arrow svg {
    width: 20px;
    height: 20px;
  }
}

/* Estilos para CardList responsive */
:deep(.card-list) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media screen and (max-width: 768px) {
  :deep(.card-list) {
    gap: 0.75rem;
  }
}

@media screen and (max-width: 480px) {
  :deep(.card-list) {
    gap: 0.6rem;
  }
}
</style>