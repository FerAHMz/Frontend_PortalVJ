<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick"/>
    <main class="profile-container">
      <h1 class="text-page-title">Perfil del Maestro</h1>
      <div class="separator"></div>
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <ProfileCard
        v-else
        :name="(userProfile.nombre || '') + ' ' + (userProfile.apellido || '')"
        role="Maestro"
        :phone="userProfile.telefono || ''"
        :email="userProfile.email || ''"
        :image="userProfile.profileImageUrl || null"
        :courses="teacherCourses"
        @profile-image-updated="handleProfileImageUpdate"
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
  MessageSquare,
  Info
} from 'lucide-vue-next'
import { downloadTeacherInstructivePDF } from '@/composables/useTeacherInstructivePDF.js'

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
  email: '',
  profileImageUrl: null
})
const teacherCourses = ref([])
const loading = ref(true)
const error = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' },
  { label: 'Instructivo', icon: Info, action: 'downloadInstructive' }
]

const handleItemClick = (item) => {
  if (item.action === 'downloadInstructive') {
    downloadTeacherInstructivePDF()
  } else if (item.path) {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/teacher/${user.id}/courses`, {
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

const handleProfileImageUpdate = (newImageUrl) => {
  userProfile.value.profileImageUrl = newImageUrl
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
  padding: 2rem;
  background-color: white;
  margin-left: 130px; /* Espacio para sidebar en escritorio */
  overflow-y: auto;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-container {
    padding: 15px;
  }
  
  
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .profile-container {
    margin-left: 0; /* Quitar margen en móvil */
    padding: 1rem;
    height: auto;
    min-height: calc(100vh - 60px); 
    margin-top: 5.25rem;
  }
  
  .text-page-title {
    text-align: center;
  }
  
  .loading, .error {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-container {
    margin-left: 0; /* Quitar margen en móvil */
    padding: 0.75rem;
    margin-bottom: 0.8rem;
  }
  
  .loading, .error {
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .error {
    margin: 0 10px;
  }
}

/* Para pantallas muy pequeñas */
@media (max-width: 320px) {
  .profile-container {
    margin-left: 0; /* Quitar margen en móvil */
    padding: 5px;
  }
}
</style>


