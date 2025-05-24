<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="courses-container">
        <h1 class="page-title">Cursos</h1>
        <div class="separator"></div>
        
        <div v-if="loading" class="loading">Cargando cursos...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <CardList v-else :items="formattedCourses" @item-clicked="navigateToCourse">
          <template #item="{ item }">
            <div class="course-item">
              <h3>{{ item.materia }}</h3>
              <p>Grado: {{ item.grado }}</p>
              <p>Sección: {{ item.seccion }}</p>
            </div>
          </template>
        </CardList>
      </main>
    </div>
  </template>
  
  <script setup>
  import Sidebar from '@/components/Sidebar.vue'
  import CardList from '@/components/CardList.vue'
  import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const courses = ref([])
  const loading = ref(true)
  const error = ref(null)
  
  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
  ]
  
  // Función para obtener los cursos del maestro
  const fetchTeacherCourses = async () => {
    try {
      loading.value = true
      error.value = null
      
      const teacherId = localStorage.getItem('userId')
      const token = localStorage.getItem('token')
      
      if (!teacherId || !token) {
        throw new Error('No se encontró la información del usuario')
      }
  
      const response = await fetch(`http://localhost:3000/api/teacher/${teacherId}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener los cursos')
      }
      
      const data = await response.json()
      courses.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching courses:', err)
    } finally {
      loading.value = false
    }
  }
  
  const formattedCourses = computed(() => {
    return courses.value.map(course => ({
      ...course,
      path: `/teacher/courses/${course.id}`
    }))
  })
  
  const handleItemClick = (item) => {
    if (item.path) {
      router.push(item.path)
    }
  }
  
  const navigateToCourse = (course) => {
    const publicData = { 
      materia: course.materia,
      grado: course.grado,
      seccion: course.seccion
    };
    sessionStorage.setItem('currentCourse', JSON.stringify(publicData));
  
    router.push({
      path: `/teacher/courses/${course.id}`,
      state: { 
        courseData: {
          materia: course.materia,
          grado: course.grado,
          seccion: course.seccion
        }
      }
    })
  }
  
  onMounted(() => {
    fetchTeacherCourses()
  })
  </script>
  
  <style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }
  
  .courses-container {
    flex: 1;
    padding: 2rem;
    background: white;
    overflow: auto;
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
    width: 100%;
  }
  
  .course-item h3 {
    margin: 0 0 0.25rem 0;
    color: #000;
  }
  
  .course-item p {
    margin: 0;
    color: #555;
    font-size: 0.9rem;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: #555;
  }
  
  .error {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: #dc3545;
  }
  </style>