<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="page-title">Perfil Administrativo</h1>
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <ProfileCard
        v-else
        :name="(userProfile.nombre || '') + ' ' + (userProfile.apellido || '')"
        role="Administrativo"
        :phone="userProfile.telefono || ''"
        :email="userProfile.email || ''"
        :image="userProfile.profileImageUrl || null"
        @profile-image-updated="handleProfileImageUpdate"
      />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import { User, CreditCard } from 'lucide-vue-next'
import secretariaImg from '@/assets/secretaria.jpg'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileService } from '@/services/profileService.js'

const router = useRouter()
const userProfile = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  profileImageUrl: null
})
const loading = ref(true)
const error = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
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
  padding: 20px;
  background-color: white;
  overflow-y: auto;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .profile-container {
    padding: 10px;
    height: auto;
    min-height: calc(100vh - 60px); 
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .loading, .error {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 8px;
  }
  
  .page-title {
    font-size: 1.3rem;
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
    padding: 5px;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
}
</style>