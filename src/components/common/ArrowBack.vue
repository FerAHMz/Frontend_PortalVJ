<template>
  <div class="arrow-back-container">
    <button 
      @click="handleGoBack"
      class="arrow-back-button"
      :class="{ 'disabled': disabled }"
      :disabled="disabled"
      :title="tooltip"
      type="button"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class="arrow-icon"
      >
        <path 
          d="M19 12H5M12 19L5 12L12 5" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
      <span v-if="showText" class="button-text">{{ text }}</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  // Ruta específica a la que regresar (opcional)
  to: {
    type: [String, Object],
    default: null
  },
  // Texto a mostrar junto al ícono
  text: {
    type: String,
    default: 'Volver'
  },
  // Mostrar texto junto al ícono
  showText: {
    type: Boolean,
    default: false
  },
  // Deshabilitar el botón
  disabled: {
    type: Boolean,
    default: false
  },
  // Tooltip al hacer hover
  tooltip: {
    type: String,
    default: 'Volver atrás'
  },
  // Usar history.back() en lugar del router
  useHistoryBack: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['beforeBack', 'afterBack'])

const router = useRouter()

const handleGoBack = () => {
  if (props.disabled) return

  // Emit evento antes de navegar
  emit('beforeBack')

  if (props.useHistoryBack) {
    // Usar history.back() del navegador
    window.history.back()
  } else if (props.to) {
    // Navegar a una ruta específica
    router.push(props.to)
  } else {
    // Usar router.back() por defecto
    router.back()
  }

  // Emit evento después de navegar
  emit('afterBack')
}
</script>

<style scoped>
.arrow-back-container {
  display: inline-block;
}

.arrow-back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.arrow-back-button:hover:not(.disabled) {
  background-color: #f3f4f6;
  color: #1f2937;
  transform: translateX(-2px);
}

.arrow-back-button:active:not(.disabled) {
  background-color: #e5e7eb;
  transform: translateX(-1px);
}

.arrow-back-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.arrow-icon {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.arrow-back-button:hover:not(.disabled) .arrow-icon {
  transform: translateX(-2px);
}

.button-text {
  white-space: nowrap;
}

/* Variantes de estilo */
.arrow-back-button.primary {
  background-color: #3b82f6;
  color: white;
}

.arrow-back-button.primary:hover:not(.disabled) {
  background-color: #2563eb;
}

.arrow-back-button.secondary {
  border: 1px solid #d1d5db;
  background-color: white;
}

.arrow-back-button.secondary:hover:not(.disabled) {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

/* Responsive */
@media (max-width: 640px) {
  .arrow-back-button {
    padding: 6px 8px;
  }
  
  .button-text {
    font-size: 12px;
  }
}
</style>
