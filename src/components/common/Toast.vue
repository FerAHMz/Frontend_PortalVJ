<template>
  <Transition name="toast" appear>
    <div
      v-if="visible"
      class="toast"
      :class="[type, { 'toast-dismissible': dismissible }]"
      role="alert"
    >
      <div class="toast-content">
        <div class="toast-icon">
          <i :class="getIconClass()"></i>
        </div>
        
        <div class="toast-message">
          <p>{{ message }}</p>
        </div>
        
        <button
          v-if="dismissible"
          class="toast-close"
          @click="handleClose"
          aria-label="Cerrar notificación"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div v-if="showProgress" class="toast-progress">
        <div
          class="toast-progress-bar"
          :style="{ width: progressWidth + '%' }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(true)
    const progressWidth = ref(100)
    
    let progressInterval = null
    let autoCloseTimer = null

    const getIconClass = () => {
      const iconMap = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
      }
      return iconMap[props.type] || iconMap.info
    }

    const handleClose = () => {
      visible.value = false
      clearTimers()
      setTimeout(() => {
        emit('close')
      }, 300) // Esperar a que termine la animación
    }

    const clearTimers = () => {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
        autoCloseTimer = null
      }
    }

    const startProgress = () => {
      if (!props.showProgress || props.duration <= 0) return

      const updateInterval = 50 // Actualizar cada 50ms
      const decrementAmount = (100 / props.duration) * updateInterval

      progressInterval = setInterval(() => {
        progressWidth.value -= decrementAmount
        if (progressWidth.value <= 0) {
          progressWidth.value = 0
          clearInterval(progressInterval)
        }
      }, updateInterval)
    }

    const startAutoClose = () => {
      if (props.duration > 0) {
        autoCloseTimer = setTimeout(() => {
          handleClose()
        }, props.duration)
      }
    }

    onMounted(() => {
      startProgress()
      startAutoClose()
    })

    onUnmounted(() => {
      clearTimers()
    })

    return {
      visible,
      progressWidth,
      getIconClass,
      handleClose
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  min-width: 300px;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border-left: 4px solid;
}

.toast.success {
  border-left-color: #38a169;
}

.toast.error {
  border-left-color: #e53e3e;
}

.toast.warning {
  border-left-color: #dd6b20;
}

.toast.info {
  border-left-color: #3182ce;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: 0.9rem;
}

.toast.success .toast-icon {
  background: #38a169;
}

.toast.error .toast-icon {
  background: #e53e3e;
}

.toast.warning .toast-icon {
  background: #dd6b20;
}

.toast.info .toast-icon {
  background: #3182ce;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-message p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2d3748;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.toast-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.toast-progress {
  height: 3px;
  background: #e2e8f0;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  background: currentColor;
  transition: width 0.1s linear;
}

.toast.success .toast-progress-bar {
  background: #38a169;
}

.toast.error .toast-progress-bar {
  background: #e53e3e;
}

.toast.warning .toast-progress-bar {
  background: #dd6b20;
}

.toast.info .toast-progress-bar {
  background: #3182ce;
}

/* Animaciones */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .toast {
    left: 20px;
    right: 20px;
    min-width: auto;
    max-width: none;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(-100%);
  }
}

/* Toast stack */
.toast:not(:first-child) {
  margin-top: 0.5rem;
}

/* Hover pause */
.toast:hover .toast-progress-bar {
  animation-play-state: paused;
}
</style>
