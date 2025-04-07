<template>
    <div class="layout">
      <Sidebar :items="menuItems" />
      <main class="profile-container">
        <h1 class="page-title">Perfil</h1>
        <ProfileCard
          name="Elisabeth García"
          role="Secretaria"
          phone="2234-5586"
          email="elisagar23@gmail.com"
          :image="secretariaImg"
        />
      </main>
    </div>
  </template>
  
  <script setup>
  import Sidebar from '@/components/Sidebar.vue'
  import ProfileCard from '@/components/ProfileCard.vue'
  import { User, CreditCard } from 'lucide-vue-next'
  import secretariaImg from '@/assets/secretaria.jpg'

  const menuItems = [
    { label: 'Perfil', icon: User },
    { label: 'Control de pagos', icon: CreditCard }
  ]
  </script>
  
  <style scoped>
  .layout {
    display: flex;
    height: 100vh;
  }
  .profile-container {
    flex: 1;
    padding: 20px;
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
  