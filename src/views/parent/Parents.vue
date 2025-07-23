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
        <SelectChild v-if="children.length" :children="children" @child-selected="handleChildSelected" />
        <div v-else class="no-children">
          No se encontraron estudiantes asociados a su cuenta.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import SelectChild from './SelectChild.vue'
import StudentGrades from './StudentGrades.vue'
import StudentTasks from './StudentTasks.vue'
import { User, BookOpen, FileText, MessageSquare, CreditCard, CalendarDays } from 'lucide-vue-next'
import parentImg from '@/assets/maestro.png'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileService } from '@/services/profileService.js'
import { parentService } from '@/services/parentService.js'

const router = useRouter()
const userProfile = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: ''
})
const children = ref([])
const selectedChild = ref(null)
const selectedSubjectId = ref(null)
const loading = ref(true)
const error = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' },
  { label: 'Calendario', icon: CalendarDays, path: '/parent/calendar' }
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

    if (response.success && response.user) {
      userProfile.value = response.user
      // Si el perfil trae un campo estudiante, lo usamos como hijo
      if (response.user.estudiante) {
        children.value = [response.user.estudiante]
      } else {
        children.value = []
      }
      console.log('User profile set:', userProfile.value, 'Children:', children.value) // Debug log
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




const handleChildSelected = (child) => {
  selectedChild.value = child;
  selectedSubjectId.value = null;
}

const handleSubjectSelected = (subjectId) => {
  selectedSubjectId.value = subjectId;
}

onMounted(async () => {
  await fetchUserProfile();
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

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .parent-info {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .children-list {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  
  .parent-info {
    padding: 1.5rem;
    margin-top: 1rem;
  }
  
  .parent-info h2 {
    font-size: 1.3rem;
    text-align: center;
  }
  
  .children-list {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .child-card {
    padding: 1.2rem;
  }
  
  .no-children {
    padding: 1.5rem;
    font-size: 0.95rem;
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
  
  .parent-info {
    padding: 1rem;
    margin-top: 0.8rem;
  }
  
  .parent-info h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .child-card {
    padding: 1rem;
  }
  
  .child-card h3 {
    font-size: 1.1rem;
  }
  
  .child-card p {
    font-size: 0.9rem;
  }
  
  .no-children {
    padding: 1.2rem;
    font-size: 0.9rem;
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
  
  .parent-info {
    padding: 0.8rem;
  }
  
  .child-card {
    padding: 0.8rem;
  }
  
  .child-card h3 {
    font-size: 1rem;
  }
  
  .child-card p {
    font-size: 0.85rem;
  }
}
</style>