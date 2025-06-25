<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="page-title">Perfil de Padre/Madre</h1>
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <ProfileCard
        v-else
        :name="(userProfile.nombre || '') + ' ' + (userProfile.apellido || '')"
        role="Padre/Madre"
        :phone="userProfile.telefono || ''"
        :email="userProfile.email || ''"
        :image="parentImg"
      />

      <!-- Información adicional para padres -->
      <div v-if="!loading && !error" class="parent-info">
        <h2>Información de sus hijos</h2>
        <div v-if="children.length === 0" class="no-children">
          No se encontraron estudiantes asociados a su cuenta.
        </div>
        <div v-else class="children-list">
          <div v-for="child in children" :key="child.id" class="child-card">
            <h3>{{ child.nombre }} {{ child.apellido }}</h3>
            <p><strong>Carnet:</strong> {{ child.carnet }}</p>
            <p><strong>Grado:</strong> {{ child.grado }} - Sección {{ child.seccion }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import { User, BookOpen, FileText, MessageSquare, CreditCard } from 'lucide-vue-next'
import parentImg from '@/assets/maestro.png' // Usando la misma imagen por ahora
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
const children = ref([])
const loading = ref(true)
const error = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' }
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

    // Aquí podrías agregar una llamada para obtener información de los hijos
    // await fetchChildren()
  } catch (err) {
    console.error('Error fetching profile:', err)
    error.value = 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
  }
}

const fetchChildren = async () => {
  // Esta función se implementaría cuando el backend tenga el endpoint
  // para obtener los hijos asociados al padre
  try {
    // const response = await fetch('/api/parent/children', ...)
    // children.value = await response.json()
  } catch (err) {
    console.error('Error fetching children:', err)
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

.parent-info {
  margin-top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.parent-info h2 {
  margin-bottom: 1.5rem;
  color: #1b9963;
  border-bottom: 2px solid #1b9963;
  padding-bottom: 0.5rem;
}

.no-children {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.children-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.child-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #1b9963;
}

.child-card h3 {
  margin: 0 0 1rem 0;
  color: #1b9963;
}

.child-card p {
  margin: 0.5rem 0;
  color: #555;
}
</style>
