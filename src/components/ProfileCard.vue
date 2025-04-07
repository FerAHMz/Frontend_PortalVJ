<template>
    <div class="profile-header">
      <img :src="image" alt="Foto de perfil" class="profile-img" />
      <div class="profile-info">
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
    </div>
  </template>
  
  <script setup>
  defineProps({
    name: String,
    role: String,
    phone: String,
    email: String,
    image: String,
    courses: Array 
  })
  </script>
  
  <style scoped>
  .profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    background: #fff;
    padding: 2rem 3rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  .profile-img {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 100px;
    border: 3px solid #1b9963;
  }
  .profile-info h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: bold;
    color: black;
  }
  .role {
    font-weight: bold;
    margin-bottom: 1rem;
    color: #444;
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
  </style>
  