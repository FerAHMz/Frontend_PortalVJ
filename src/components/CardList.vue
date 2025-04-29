<template>
    <div class="card-list">
      <ul>
        <li 
          v-for="(item, index) in items" 
          :key="index"
          @click="$emit('item-clicked', item)"
        >
          <slot name="item" :item="item">
            {{ item.text || item.name || item.label }}
          </slot>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  defineProps({
    items: {
      type: Array,
      required: true
    }
  })
  
  defineEmits(['item-clicked'])
  </script>
  
  <style scoped>
  .card-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .card-list li {
    margin-bottom: 0;
    padding: 0.75rem 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #1b9963;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    cursor: pointer;
  }
  
  .card-list li:hover {
    background-color: #e9f5ef;
    transform: translateX(2px);
  }
  </style>