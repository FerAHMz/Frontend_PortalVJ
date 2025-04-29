<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="course-detail-container">
        <h1 class="page-title">{{ courseData.materia }}</h1>
        <div class="course-subtitle" v-if="courseData.grado && courseData.seccion">
          Grado: {{ courseData.grado }} | Sección: {{ courseData.seccion }}
        </div>
        <div class="separator"></div>
        
        <CardList :items="courseOptions" @item-clicked="handleOptionClick">
          <template #item="{ item }">
            <div class="option-item">
              <span>{{ item.label }}</span>
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
  const courseData = ref({}) 

onMounted(() => {
  if (route.state?.courseData) {
    courseData.value = route.state.courseData
  } else {
    // Si no hay datos en la ruta, intenta obtenerlos del almacenamiento local temporal
    const savedCourse = sessionStorage.getItem('currentCourse')
    if (savedCourse) {
      courseData.value = JSON.parse(savedCourse)
    } else {
      console.error('No se encontraron datos del curso')
      // Redirige si no hay datos
      router.push('/teacher/courses')
    }
  }
  console.log('Datos del curso:', courseData.value)
})
  
  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays },
    { label: 'Boleta de calificaciones', icon: FileText },
    { label: 'Comunicación', icon: MessageSquare }
  ]
  
  // Opciones 
  const courseOptions = [
  { label: 'Asistencia', path: 'attendance' },
  { 
    label: 'Calificaciones', 
    path: 'grades',
    description: 'Gestionar calificaciones y tareas'
  }
  ]
  
  const handleItemClick = (item) => {
    if (item.path) router.push(item.path)
  }
  
  const handleOptionClick = (option) => {
    if (option.path === 'grades') {
      router.push({
        name: 'CourseGrades',
        params: { 
          courseId: route.params.courseId
        },
        state: { courseData: courseData.value }
      })
    } else {
      router.push(`/teacher/courses/${route.params.courseId}/${option.path}`)
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
  
  .option-item {
    padding: 0.5rem 0;
    font-size: 1.1rem;
  }
  </style>