<template>
  <div class="confirmation-overlay" @click="handleOverlayClick">
    <div class="confirmation-container" @click.stop>
      <div class="confirmation-header">
        <div class="confirmation-icon" :class="type">
          <i :class="getIconClass()"></i>
        </div>
        <h3 class="confirmation-title">{{ title }}</h3>
      </div>

      <div class="confirmation-body">
        <p class="confirmation-message">{{ message }}</p>
      </div>

      <div class="confirmation-footer">
        <button 
          class="btn btn-secondary"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </button>
        
        <button 
          class="btn"
          :class="getConfirmButtonClass()"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmationModal',
  props: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'danger', 'warning', 'success'].includes(value)
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props) {
    const getIconClass = () => {
      const iconMap = {
        'default': 'fas fa-question-circle',
        'danger': 'fas fa-exclamation-triangle',
        'warning': 'fas fa-exclamation-circle',
        'success': 'fas fa-check-circle'
      }
      return iconMap[props.type] || iconMap.default
    }

    const getConfirmButtonClass = () => {
      const classMap = {
        'default': 'btn-primary',
        'danger': 'btn-danger',
        'warning': 'btn-warning',
        'success': 'btn-success'
      }
      return classMap[props.type] || classMap.default
    }

    const handleOverlayClick = () => {
      // No cerrar automáticamente al hacer clic en el overlay
      // para evitar cierres accidentales en confirmaciones importantes
    }

    return {
      getIconClass,
      getConfirmButtonClass,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.confirmation-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  animation: confirmationSlideIn 0.3s ease-out;
}

.confirmation-header {
  padding: 2rem 2rem 1rem 2rem;
  text-align: center;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.confirmation-icon.default {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.confirmation-icon.danger {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.confirmation-icon.warning {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.confirmation-icon.success {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.confirmation-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.confirmation-body {
  padding: 0 2rem 1rem 2rem;
  text-align: center;
}

.confirmation-message {
  margin: 0;
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.6;
}

.confirmation-footer {
  padding: 1rem 2rem 2rem 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
}

.btn-warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

@keyframes confirmationSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .confirmation-overlay {
    padding: 0.5rem;
  }

  .confirmation-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .confirmation-body {
    padding: 0 1.5rem 1rem 1.5rem;
  }

  .confirmation-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
