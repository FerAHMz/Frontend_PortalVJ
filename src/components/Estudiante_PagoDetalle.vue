<template>
  <div class="Estudiante_PagoDetalle">
    <component :is="icon" class="icon large" />
    <p>{{ name }}</p>
    <button>
      {{ estado === 'Al día' ? 'Ver detalles' : 'Pagar' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props for the component
defineProps({
  icon: Object, // Pass the icon component dynamically
  name: String, // Name of the student
  estado: String // Payment status of the student
})
</script>

<style scoped>
.Estudiante_PagoDetalle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 10px;
}

.icon.large {
  width: 36px;
  height: 36px;
  margin-right: 10px;
}

button {
  background-color: #008c1a;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #006f13;
}
</style>
