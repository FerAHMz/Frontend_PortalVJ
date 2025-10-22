<template>
  <Transition name="toast" appear>
    <div v-if="show" class="toast-notification" :class="type">
      <div class="toast-icon">
        <component :is="iconComponent" :size="20" />
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
      <button v-if="showClose" @click="$emit('close')" class="toast-close">
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { AlertCircle, CheckCircle, X, CreditCard } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  autoClose: {
    type: Number,
    default: 5000 // 5 segundos
  }
})

const emit = defineEmits(['close'])

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertCircle
    case 'error':
      return AlertCircle
    case 'info':
    default:
      return CreditCard
  }
})

// Auto close functionality
if (props.autoClose > 0) {
  setTimeout(() => {
    emit('close')
  }, props.autoClose)
}
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  max-width: 400px;
  min-width: 300px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-notification.info {
  background: linear-gradient(135deg, rgba(27, 153, 99, 0.95) 0%, rgba(21, 122, 80, 0.95) 100%);
  color: white;
}

.toast-notification.success {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.95) 0%, rgba(32, 134, 55, 0.95) 100%);
  color: white;
}

.toast-notification.warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 143, 0, 0.95) 100%);
  color: #856404;
}

.toast-notification.error {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.95) 0%, rgba(176, 42, 55, 0.95) 100%);
  color: white;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* Transitions */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-notification {
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
  }
  
  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(-100%) scale(0.9);
  }
}
</style>
