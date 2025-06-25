<template>
  <div v-if="show" class="notification-overlay">
    <div class="notification-content" :class="typeClass">
      <div class="notification-header">
        <div class="notification-icon">
          <component :is="iconComponent" />
        </div>
        <h3>{{ title }}</h3>
      </div>
      <div class="notification-body">
        <p v-if="message">{{ message }}</p>
        <ul v-if="messages && messages.length" class="message-list">
          <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
        </ul>
      </div>
      <div class="notification-actions">
        <button @click="handleClose" class="notification-btn" :class="typeClass">
          {{ closeText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'success', 'error', 'warning', 'info'
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  messages: {
    type: Array,
    default: () => []
  },
  closeText: {
    type: String,
    default: 'Cerrar'
  },
  autoClose: {
    type: Boolean,
    default: false
  },
  autoCloseDelay: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

const typeClass = computed(() => `notification-${props.type}`)

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
    case 'info':
    default:
      return Info
  }
})

const handleClose = () => {
  emit('close')
}

// Auto-close functionality
if (props.autoClose && props.show) {
  setTimeout(() => {
    if (props.show) {
      handleClose()
    }
  }, props.autoCloseDelay)
}
</script>

<style scoped>
.notification-overlay {
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

.notification-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  min-width: 350px;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border-left: 5px solid;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.notification-body {
  margin-bottom: 1.5rem;
}

.notification-body p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.message-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #555;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
}

.notification-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Success styles */
.notification-success {
  border-left-color: #28a745;
}

.notification-success .notification-icon {
  background-color: #d4edda;
  color: #28a745;
}

.notification-success h3 {
  color: #28a745;
}

.notification-success .notification-btn {
  background-color: #28a745;
  color: white;
}

.notification-success .notification-btn:hover {
  background-color: #218838;
}

/* Error styles */
.notification-error {
  border-left-color: #dc3545;
}

.notification-error .notification-icon {
  background-color: #f8d7da;
  color: #dc3545;
}

.notification-error h3 {
  color: #dc3545;
}

.notification-error .notification-btn {
  background-color: #dc3545;
  color: white;
}

.notification-error .notification-btn:hover {
  background-color: #c82333;
}

/* Warning styles */
.notification-warning {
  border-left-color: #ffc107;
}

.notification-warning .notification-icon {
  background-color: #fff3cd;
  color: #856404;
}

.notification-warning h3 {
  color: #856404;
}

.notification-warning .notification-btn {
  background-color: #ffc107;
  color: #212529;
}

.notification-warning .notification-btn:hover {
  background-color: #e0a800;
}

/* Info styles */
.notification-info {
  border-left-color: #17a2b8;
}

.notification-info .notification-icon {
  background-color: #d1ecf1;
  color: #17a2b8;
}

.notification-info h3 {
  color: #17a2b8;
}

.notification-info .notification-btn {
  background-color: #17a2b8;
  color: white;
}

.notification-info .notification-btn:hover {
  background-color: #138496;
}
</style>
