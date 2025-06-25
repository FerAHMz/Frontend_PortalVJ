<template>
    <div class="profile-header">
      <img :src="image" alt="Foto de perfil" class="profile-img" />
      <div class="profile-info">
        <div class="profile-main">
          <h2>{{ name }}</h2>
          <p class="role">{{ role }}</p>
          <div class="contact">
            <h3>Formas de contacto</h3>
            <p>📞 {{ phone }}</p>
            <p>✉️ {{ email }}</p>
          </div>
          <div v-if="courses?.length" class="courses">
            <h3>Cursos</h3>
            <ul>
              <li v-for="course in courses" :key="course">{{ course }}</li>
            </ul>
          </div>
        </div>
        <div class="profile-actions">
          <button @click="handleLogout" class="logout-btn">
            <LogOut class="logout-icon" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { LogOut } from 'lucide-vue-next'
  import { useAuth } from '@/utils/useAuth.js'

  defineProps({
    name: String,
    role: String,
    phone: String,
    email: String,
    image: String,
    courses: Array
  })

  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }
  </script>

  <style scoped>
  .profile-header {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    background: #fff;
    padding: 2rem 3rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    border-radius: 12px;
  }

  .profile-img {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 100px;
    border: 3px solid #1b9963;
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
  }

  .profile-main {
    flex: 1;
  }

  .profile-main h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: bold;
    color: black;
  }

  .role {
    font-weight: bold;
    margin-bottom: 1rem;
    color: #444;
    font-size: 1.1rem;
  }

  .contact h3,
  .courses h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    color: #111;
  }

  .contact p,
  .courses ul {
    margin: 0;
    font-size: 0.95rem;
    color: #222;
  }

  .courses ul {
    padding-left: 1.5rem;
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .logout-btn:hover {
    background-color: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  }

  .logout-icon {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .profile-info {
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .profile-actions {
      align-items: center;
    }
  }
  </style>
