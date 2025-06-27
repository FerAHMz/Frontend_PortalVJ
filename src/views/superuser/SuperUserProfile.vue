<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="page-title">Perfil de Super Usuario</h1>
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <ProfileCard
        v-else
        :name="(userProfile.nombre || '') + ' ' + (userProfile.apellido || '')"
        role="Super Usuario"
        :phone="userProfile.telefono || ''"
        :email="userProfile.email || ''"
        :image="adminImg"
      />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import { User, Settings, BookOpen } from 'lucide-vue-next'
import adminImg from '@/assets/maestro.png' // Usando la misma imagen por ahora
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileService } from '@/services/profileService.js'

const router = useRouter()
const userProfile = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: ''
})
const loading = ref(true)
const error = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/superuser/profile' },
  { label: 'Gestión de Usuarios', icon: Settings, path: '/superuser' },
  { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' }
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
  } catch (err) {
    console.error('Error fetching profile:', err)
    error.value = 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
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
