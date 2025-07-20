<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-overlay" @click.self="handleCancel">
      <div class="confirm-dialog">
        <div class="confirm-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="confirm-body">
          <p>{{ message }}</p>
        </div>
        <div class="confirm-actions">
          <button @click="handleCancel" class="action-btn cancel">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="action-btn delete">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
const resolvePromise = ref(null)
const title = ref('')
const message = ref('')
const confirmText = ref('Confirmar')
const cancelText = ref('Cancelar')

const show = (options = {}) => {
  title.value = options.title || 'Confirmar acción'
  message.value = options.message || '¿Estás seguro?'
  confirmText.value = options.confirmText || 'Confirmar'
  cancelText.value = options.cancelText || 'Cancelar'
  isVisible.value = true
  
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}

const handleConfirm = () => {
  isVisible.value = false
  if (resolvePromise.value) {
    resolvePromise.value(true)
    resolvePromise.value = null
  }
}

const handleCancel = () => {
  isVisible.value = false
  if (resolvePromise.value) {
    resolvePromise.value(false)
    resolvePromise.value = null
  }
}

defineExpose({
  show
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  border-radius: 8px;
  padding: 0;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirm-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #eee;
}

.confirm-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.confirm-body {
  padding: 1.5rem;
}

.confirm-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.confirm-actions {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.action-btn.cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn.cancel:hover {
  background-color: #e6e6e6;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
}

.action-btn.delete:hover {
  background-color: #c9302c;
}
</style>
