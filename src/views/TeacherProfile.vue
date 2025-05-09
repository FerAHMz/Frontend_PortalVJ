<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick"/>
    <main class="profile-container">
      <h1 class="page-title">Perfil</h1>
      <ProfileCard
        name="Marco López"
        role="Maestro"
        phone="1342-9876"
        email="marclop@gmail.com"
        :image="teacherImg"
        :courses="['Matemática 1', 'Matemática 2', 'Lenguaje 1']"
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
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText },
  { label: 'Comunicación', icon: MessageSquare }
]

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

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
</style>
