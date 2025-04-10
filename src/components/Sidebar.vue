<template>
  <aside class="sidebar">
    <img src="@/assets/logo.png" alt="Logo" class="logo" />
    <ul class="menu">
      <li v-for="item in items" :key="item.label" @click="navigate(item)" :class="{ 'active': isActive(item.path) }">
        <component :is="item.icon" class="icon large" />
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const props = defineProps({
  items: Array
})

const isActive = (path) => {
  return route.path === path
}

const navigate = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.sidebar {
  width: 130px;
  background-color: #00923f;
  color: white;
  padding: 0; 
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; 
  z-index: 100;
  position: fixed;
  height: 100%;
  min-height: 100vh;
  left: 0;
  top: 0;
  margin-right: 130px;
  bottom: 0; 
  & + * {
    margin-left: 130px;
  }
}

@media screen and (max-width: 768px) {
  .sidebar {
    height: 100%;
    min-height: -webkit-fill-available; 
  }
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding: 0;
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
</style>
