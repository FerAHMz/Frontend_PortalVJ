<template>
  <!-- Botón hamburguesa (solo visible en móvil) -->
  <button 
    class="hamburger-btn" 
    @click="toggleSidebar"
    :class="{ 'active': isSidebarOpen }"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>


  <!-- Sidebar -->
  <aside 
    class="sidebar" 
    :class="{ 'sidebar-open': isSidebarOpen }"
  >
    <img src="@/assets/logo.png" alt="Logo" class="logo" />
    <ul class="menu">
      <li 
        v-for="item in items" 
        :key="item.label" 
        @click="navigate(item)" 
        :class="{ 'active': isActive(item.path) }"
      >
        <component :is="item.icon" class="icon large" />
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </aside>

  <!-- Overlay para móvil -->
  <div 
    class="sidebar-overlay" 
    v-if="isSidebarOpen" 
    @click="closeSidebar"
  ></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(false)

const props = defineProps({
  items: Array
})

const isActive = (path) => {
  return route.path === path
}

const navigate = (item) => {
  if (item.path) {
    router.push(item.path)
    // Cerrar sidebar en móvil después de navegar
    if (window.innerWidth <= 768) {
      closeSidebar()
    }
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Cerrar sidebar al redimensionar a escritorio
const handleResize = () => {
  if (window.innerWidth > 768) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Botón hamburguesa */
.hamburger-btn {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  width: 45px;
  height: 45px;
  background-color: #00923f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.hamburger-btn span {
  width: 22px;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Overlay para móvil */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Sidebar */
.sidebar {
  width: 130px;
  background-color: #00923f;
  color: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  z-index: 1000;
  position: fixed;
  height: 100%;
  min-height: 100vh;
  left: 0;
  top: 0;
  bottom: 0;
  transition: transform 0.3s ease;
}

/* Espacio para el contenido principal */
.sidebar + * {
  margin-left: 130px;
}

.logo {
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
  display: block;
}

.menu {
  list-style: none;
  padding: 1rem 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  flex-grow: 1;
}

.menu li {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: background-color 0.3s;
  width: 80%;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.menu li.active {
  background-color: rgba(255, 255, 255, 0.3);
  position: relative;
}

.menu li.active::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background-color: white;
  border-radius: 2px;
}

.icon.large {
  width: 36px;
  height: 36px;
  margin-bottom: 4px;
}

/* Estilos para móvil */
@media screen and (max-width: 768px) {
  /* Mostrar botón hamburguesa */
  .hamburger-btn {
    display: flex;
  }

  /* Sidebar oculto por defecto en móvil */
  .sidebar {
    transform: translateX(-100%);
    width: 280px; /* Más ancho en móvil para mejor usabilidad */
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000; /* Asegurar que esté encima del overlay */
  }

  /* Sidebar visible cuando está abierto */
  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  /* Mostrar overlay cuando sidebar está abierto */
  .sidebar.sidebar-open + .sidebar-overlay,
  .sidebar-overlay {
    display: block;
  }

  /* Remover margen del contenido principal en móvil */
  .sidebar + * {
    margin-left: 0;
  }

  /* Ajustar menú para móvil */
  .menu {
    padding: 2rem 1rem 1rem;
  }

  .menu li {
    width: 90%;
    padding: 1rem;
    font-size: 16px;
  }

  .icon.large {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }
}

/* Animación suave para el contenido principal */
@media screen and (min-width: 769px) {
  .sidebar + * {
    transition: margin-left 0.3s ease;
  }
}
</style>