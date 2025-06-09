<template>
    <div v-if="show" class="dialog-overlay">
        <div class="dialog-content">
            <h3>Error</h3>
            <ul class="error-list">
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
            <button @click="$emit('close')" class="close-btn">Cerrar</button>
        </div>
    </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  errors: Array
})

defineEmits(['close'])
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}

.error-list {
  color: #dc3545;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.close-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background: #c82333;
}
</style>
