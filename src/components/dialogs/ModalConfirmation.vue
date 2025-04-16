<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content confirm">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button @click="onCancel" class="modal-btn cancel">
            {{ cancelText }}
          </button>
          <button 
            @click="onConfirm" 
            class="modal-btn confirm-btn"
            :class="confirmButtonClass"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    visible: Boolean,
    title: {
      type: String,
      default: 'Confirmar Acción'
    },
    message: {
      type: String,
      default: '¿Estás seguro de realizar esta acción?'
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    confirmButtonClass: {
      type: String,
      default: 'delete' 
    },
    loading: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['confirm', 'cancel'])
  
  const onConfirm = () => {
    emit('confirm')
  }
  
  const onCancel = () => {
    emit('cancel')
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-content.confirm {
    max-width: 400px;
    text-align: center;
  }
  
  .modal-content h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .modal-content p {
    margin-bottom: 2rem;
    color: #666;
  }
  
  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
  }
  
  .modal-btn.cancel {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    color: #333;
  }
  
  .modal-btn.cancel:hover {
    background-color: #e9e9e9;
  }
  
  .modal-btn.confirm-btn {
    color: white;
    border: none;
  }
  
  .modal-btn.delete {
    background-color: #d9534f;
  }
  
  .modal-btn.delete:hover {
    background-color: #c9302c;
  }
  
  .modal-btn.primary {
    background-color: #1b9963;
  }
  
  .modal-btn.primary:hover {
    background-color: #158a50;
  }
  
  .modal-btn.warning {
    background-color: #f0ad4e;
  }
  
  .modal-btn.warning:hover {
    background-color: #eea236;
  }
  
  .modal-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .modal-content {
      padding: 1.5rem;
      margin: 0 1rem;
    }
    
    .modal-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .modal-btn {
      width: 100%;
    }
  }
  </style>