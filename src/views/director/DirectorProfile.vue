<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="page-title">Perfil de Director</h1>
      <ProfileCard
        :name="directorInfo.nombre + ' ' + directorInfo.apellido"
        role="Director"
        :phone="directorInfo.telefono"
        :email="directorInfo.email"
      />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const directorInfo = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  email: ''
})

const menuItems = [
  { icon: 'User', text: 'Perfil', route: '/director' },
  { icon: 'Book', text: 'Gestión Académica', route: '/director/academic' }
]

const handleItemClick = (route) => {
  router.push(route)
}
</script>