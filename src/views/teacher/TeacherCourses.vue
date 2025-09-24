<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="courses-container">
        <h1 class="text-page-title">Cursos</h1>
        <div class="separator"></div>
        
        <div v-if="loading" class="loading">Cargando cursos...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <CardList v-else :items="formattedCourses" @item-clicked="navigateToCourse">
          <template #item="{ item }">
            <div class="course-item">
              <h3>{{ item.materia }}</h3>
              <div class="course-details">
                <p>Grado: {{ item.grado }}</p>
                <p>Sección: {{ item.seccion }}</p>
              </div>
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
    { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
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
    margin-left: 130px; /* Espacio para sidebar en desktop */
    transition: margin-left 0.3s ease;
  }
  
  
  
  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
    width: 100%;
  }
  
  .course-item {
    padding: 1rem;
    transition: transform 0.2s ease;
  }
  
  .course-item:hover {
    transform: translateY(-2px);
  }
  
  .course-item h3 {
    margin: 0 0 0.5rem 0;
    color: #000;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .course-details {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .course-item p {
    margin: 0;
    color: #555;
    font-size: 0.9rem;
    background: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }
  
  .loading {
    text-align: center;
    padding: 3rem 2rem;
    font-size: 1.1rem;
    color: #555;
  }
  
  .error {
    text-align: center;
    padding: 3rem 2rem;
    font-size: 1.1rem;
    color: #dc3545;
    background: #f8d7da;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
  }
  
  /* Tablet styles */
  @media screen and (max-width: 1024px) {
    .courses-container {
      padding: 1.5rem;
    }
    
    
  }
  
  /* Mobile styles */
  @media screen and (max-width: 768px) {
    .courses-container {
      margin-left: 0; /* Sin margen en móvil */
      padding: 1rem;
      margin-top: 5.25rem; /* Espacio para el botón hamburguesa */
    }
    
    .text-page-title {
      text-align: center;
    }
    
    .separator {
      margin-bottom: 1rem;
    }
    
    .course-item {
      padding: 1.2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 1rem;
      background: white;
      border: 1px solid #e9ecef;
    }
    
    .course-item h3 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      text-align: center;
      color: #00923f;
    }
    
    .course-details {
      justify-content: center;
      gap: 0.5rem;
    }
    
    .course-item p {
      font-size: 0.85rem;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      background: #00923f;
      color: white;
      border: none;
      font-weight: 500;
    }
    
    .loading, .error {
      padding: 2rem 1rem;
      font-size: 1rem;
    }
  }
  
  /* Small mobile styles */
  @media screen and (max-width: 480px) {
    .courses-container {
      padding: 0.8rem;
      padding-top: 4.5rem;
    }
    
    
    
    .course-item {
      padding: 1rem;
    }
    
    .course-item h3 {
      font-size: 1rem;
    }
    
    .course-details {
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
    }
    
    .course-item p {
      font-size: 0.8rem;
      padding: 0.35rem 0.7rem;
      width: fit-content;
    }
    
    .loading, .error {
      padding: 1.5rem 0.5rem;
      font-size: 0.95rem;
    }
  }
  
  /* Estilos para CardList responsive */
  :deep(.card-list) {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  @media screen and (max-width: 768px) {
    :deep(.card-list) {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }
  }
  
  @media screen and (max-width: 480px) {
    :deep(.card-list) {
      gap: 0.6rem;
    }
  }
  </style>


