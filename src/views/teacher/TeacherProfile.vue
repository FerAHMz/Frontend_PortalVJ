<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick"/>
    <main class="profile-container">
      <h1 class="page-title">Perfil del Maestro</h1>
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <ProfileCard
        v-else
        :name="(userProfile.nombre || '') + ' ' + (userProfile.apellido || '')"
        role="Maestro"
        :phone="userProfile.telefono || ''"
        :email="userProfile.email || ''"
        :image="teacherImg"
        :courses="teacherCourses"
      />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import {
  User,
  ClipboardList,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare
} from 'lucide-vue-next'

import teacherImg from '@/assets/maestro.png'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileService } from '@/services/profileService.js'
import { getCurrentUser } from '@/utils/auth.js'

const router = useRouter()
const userProfile = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: ''
})
const teacherCourses = ref([])
const loading = ref(true)
const error = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

const fetchUserProfile = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await profileService.getCurrentUserProfile()
    console.log('Profile response:', response) // Debug log

    // El backend devuelve { success: true, user: userProfile }
    if (response.success && response.user) {
      userProfile.value = response.user
      console.log('User profile set:', userProfile.value) // Debug log
    } else {
      console.log('Response format issue:', response)
      throw new Error('Invalid response format')
    }

    // Fetch teacher courses
    await fetchTeacherCourses()
  } catch (err) {
    console.error('Error fetching profile:', err)
    error.value = 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
  }
}

const fetchTeacherCourses = async () => {
  try {
    const user = getCurrentUser()
    if (user?.id) {
      const response = await fetch(`http://localhost:3000/api/teacher/${user.id}/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const courses = await response.json()
        teacherCourses.value = courses.map(course =>
          `${course.materia} - ${course.grado} ${course.seccion}`
        )
      }
    }
  } catch (err) {
    console.error('Error fetching teacher courses:', err)
    // No hacer que falle todo el perfil si no se pueden cargar los cursos
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.profile-container {
  flex: 1;
  padding: 20px;
  background-color: white;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000000;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #000000;
  padding-bottom: 0.5rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.loading {
  color: #1b9963;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}
</style>
