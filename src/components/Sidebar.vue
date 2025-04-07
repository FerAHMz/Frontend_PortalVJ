<template>
    <aside class="sidebar">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <ul class="menu">
        <li v-for="item in items" :key="item.label">
          <component :is="item.icon" class="icon large" />
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </aside>
  </template>
  
  <script setup>
  defineProps({
    items: Array
  })
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
  }
  
  .menu li:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .icon.large {
    width: 36px;
    height: 36px;
    margin-bottom: 4px;
  }
  </style>
  