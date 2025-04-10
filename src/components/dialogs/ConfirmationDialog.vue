<template>
    <div v-if="show" class="dialog-overlay">
      <div class="dialog-content">
        <h3>Confirmar carga de archivo</h3>
        <p>¿Está seguro que desea procesar el archivo "{{ fileName }}"?</p>
        <div class="button-group">
          <button @click="$emit('confirm')" class="confirm-btn">Procesar</button>
          <button @click="$emit('cancel')" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </template>

<script setup>
defineProps({
  show: Boolean,
  fileName: String
})

defineEmits(['confirm', 'cancel'])
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
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-btn {
  background: #1b9963;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: rgba(255, 0, 0, 0.822);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn:hover {
  background: #158a50;
}

.cancel-btn:hover {
  background: rgb(197, 0, 0);
}
</style>