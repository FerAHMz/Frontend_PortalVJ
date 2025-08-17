<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i :class="getIconClass()"></i>
          {{ getTitle() }}
        </h3>
        <button class="modal-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="inscripcion-form">
          <!-- Datos básicos del estudiante -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-user"></i>
              Datos del Estudiante
            </h4>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="carnet" class="form-label required">
                  Carnet
                </label>
                <input
                  id="carnet"
                  v-model="form.carnet"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.carnet }"
                  placeholder="Ej: 12345"
                  :disabled="!isEditing && inscripcion"
                  required
                />
                <span v-if="errors.carnet" class="error-message">
                  {{ errors.carnet }}
                </span>
              </div>

              <div class="form-group">
                <label for="nombre" class="form-label required">
                  Nombre
                </label>
                <input
                  id="nombre"
                  v-model="form.nombre"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.nombre }"
                  placeholder="Ej: Juan Carlos"
                  :disabled="!isEditing && inscripcion"
                  required
                />
                <span v-if="errors.nombre" class="error-message">
                  {{ errors.nombre }}
                </span>
              </div>

              <div class="form-group">
                <label for="apellido" class="form-label required">
                  Apellido
                </label>
                <input
                  id="apellido"
                  v-model="form.apellido"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.apellido }"
                  placeholder="Ej: Pérez García"
                  :disabled="!isEditing && inscripcion"
                  required
                />
                <span v-if="errors.apellido" class="error-message">
                  {{ errors.apellido }}
                </span>
              </div>

              <div class="form-group">
                <label for="fecha_nacimiento" class="form-label required">
                  Fecha de Nacimiento
                </label>
                <input
                  id="fecha_nacimiento"
                  v-model="form.fecha_nacimiento"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.fecha_nacimiento }"
                  :disabled="!isEditing && inscripcion"
                  :max="maxBirthDate"
                  required
                />
                <span v-if="errors.fecha_nacimiento" class="error-message">
                  {{ errors.fecha_nacimiento }}
                </span>
              </div>
            </div>
          </div>

          <!-- Información académica -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-graduation-cap"></i>
              Información Académica
            </h4>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="id_grado_seccion" class="form-label required">
                  Grado y Sección
                </label>
                <select
                  id="id_grado_seccion"
                  v-model="form.id_grado_seccion"
                  class="form-select"
                  :class="{ 'error': errors.id_grado_seccion }"
                  :disabled="!isEditing && inscripcion"
                  required
                >
                  <option value="">Seleccionar grado y sección</option>
                  <option 
                    v-for="grade in gradosYSecciones" 
                    :key="grade.id_grado_seccion"
                    :value="grade.id_grado_seccion"
                  >
                    {{ grade.display_name }} 
                    <span v-if="grade.capacidad_maxima">
                      (Capacidad: {{ grade.capacidad_maxima }})
                    </span>
                  </option>
                </select>
                <span v-if="errors.id_grado_seccion" class="error-message">
                  {{ errors.id_grado_seccion }}
                </span>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-info-circle"></i>
              Información Adicional
            </h4>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="sire" class="form-label required">
                  Código SIRE
                </label>
                <input
                  id="sire"
                  v-model="form.sire"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.sire }"
                  placeholder="Ej: SIRE001"
                  :disabled="!isEditing && inscripcion"
                  required
                />
                <span v-if="errors.sire" class="error-message">
                  {{ errors.sire }}
                </span>
                <span class="field-help">
                  Código único del Sistema de Información de Registro Escolar
                </span>
              </div>

              <div class="form-group">
                <label for="correo_padres" class="form-label required">
                  Correo de Padres
                </label>
                <input
                  id="correo_padres"
                  v-model="form.correo_padres"
                  type="email"
                  class="form-input"
                  :class="{ 'error': errors.correo_padres }"
                  placeholder="Ej: padres@email.com"
                  :disabled="!isEditing && inscripcion"
                  required
                />
                <span v-if="errors.correo_padres" class="error-message">
                  {{ errors.correo_padres }}
                </span>
                <span class="field-help">
                  Correo de contacto principal para comunicaciones
                </span>
              </div>
            </div>
          </div>

          <!-- Información de estado (solo para vista) -->
          <div v-if="inscripcion" class="form-section">
            <h4 class="section-title">
              <i class="fas fa-info"></i>
              Estado de la Inscripción
            </h4>
            
            <div class="status-info">
              <div class="status-item">
                <span class="status-label">Estado Actual:</span>
                <span 
                  class="status-badge" 
                  :class="inscripcion.estado_inscripcion"
                >
                  {{ getStatusText(inscripcion.estado_inscripcion) }}
                </span>
              </div>
              
              <div class="status-item">
                <span class="status-label">Fecha de Inscripción:</span>
                <span class="status-value">
                  {{ formatDate(inscripcion.fecha_inscripcion) }}
                </span>
              </div>
              
              <div v-if="inscripcion.fecha_actualizacion !== inscripcion.fecha_inscripcion" class="status-item">
                <span class="status-label">Última Actualización:</span>
                <span class="status-value">
                  {{ formatDate(inscripcion.fecha_actualizacion) }}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="$emit('close')"
        >
          <i class="fas fa-times"></i>
          {{ isEditing || !inscripcion ? 'Cancelar' : 'Cerrar' }}
        </button>
        
        <button 
          v-if="isEditing || !inscripcion"
          type="submit" 
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
          @click="handleSubmit"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-plus'"></i>
          {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'InscripcionModal',
  props: {
    inscripcion: {
      type: Object,
      default: null
    },
    gradosYSecciones: {
      type: Array,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    // Estado reactivo
    const loading = ref(false)
    const form = ref({
      carnet: '',
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      id_grado_seccion: '',
      sire: '',
      correo_padres: ''
    })
    const errors = ref({})

    // Computed properties
    const isFormValid = computed(() => {
      const requiredFields = ['carnet', 'nombre', 'apellido', 'fecha_nacimiento', 'id_grado_seccion']
      return requiredFields.every(field => {
        const value = form.value[field]
        if (field === 'id_grado_seccion') {
          return value && value !== ''
        }
        return value?.trim?.() && value.trim() !== ''
      }) && Object.keys(errors.value).length === 0
    })

    const maxBirthDate = computed(() => {
      const today = new Date()
      const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
      return maxDate.toISOString().split('T')[0]
    })

    // Métodos
    const initializeForm = () => {
      if (props.inscripcion) {
        form.value = {
          carnet: props.inscripcion.carnet || '',
          nombre: props.inscripcion.nombre || '',
          apellido: props.inscripcion.apellido || '',
          fecha_nacimiento: props.inscripcion.fecha_nacimiento 
            ? new Date(props.inscripcion.fecha_nacimiento).toISOString().split('T')[0] 
            : '',
          id_grado_seccion: props.inscripcion.id_grado_seccion || '',
          sire: props.inscripcion.sire || '',
          correo_padres: props.inscripcion.correo_padres || ''
        }
      } else {
        form.value = {
          carnet: '',
          nombre: '',
          apellido: '',
          fecha_nacimiento: '',
          id_grado_seccion: '',
          sire: '',
          correo_padres: ''
        }
      }
      errors.value = {}
    }

    const validateForm = () => {
      const newErrors = {}

      // Validar carnet
      if (!form.value.carnet?.trim()) {
        newErrors.carnet = 'El carnet es requerido'
      } else if (form.value.carnet.length < 3) {
        newErrors.carnet = 'El carnet debe tener al menos 3 caracteres'
      }

      // Validar nombre
      if (!form.value.nombre?.trim()) {
        newErrors.nombre = 'El nombre es requerido'
      } else if (form.value.nombre.length < 2) {
        newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
      }

      // Validar apellido
      if (!form.value.apellido?.trim()) {
        newErrors.apellido = 'El apellido es requerido'
      } else if (form.value.apellido.length < 2) {
        newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
      }

      // Validar fecha de nacimiento
      if (!form.value.fecha_nacimiento) {
        newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
      } else {
        const birthDate = new Date(form.value.fecha_nacimiento)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        
        if (age < 5 || age > 25) {
          newErrors.fecha_nacimiento = 'La edad debe estar entre 5 y 25 años'
        }
      }

      // Validar grado y sección
      if (!form.value.id_grado_seccion) {
        newErrors.id_grado_seccion = 'Debe seleccionar un grado y sección'
      }

      // Validar SIRE (ahora requerido)
      if (!form.value.sire?.trim()) {
        newErrors.sire = 'El código SIRE es requerido'
      } else if (form.value.sire.length < 3) {
        newErrors.sire = 'El código SIRE debe tener al menos 3 caracteres'
      }

      // Validar correo (ahora requerido)
      if (!form.value.correo_padres?.trim()) {
        newErrors.correo_padres = 'El correo de padres es requerido'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.value.correo_padres)) {
          newErrors.correo_padres = 'El formato del correo no es válido'
        }
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }

      try {
        loading.value = true
        
        // Preparar datos para envío
        const dataToSend = {
          carnet: form.value.carnet.trim(),
          nombre: form.value.nombre.trim(),
          apellido: form.value.apellido.trim(),
          fecha_nacimiento: form.value.fecha_nacimiento,
          id_grado_seccion: parseInt(form.value.id_grado_seccion),
          sire: form.value.sire?.trim() || null,
          correo_padres: form.value.correo_padres?.trim() || null
        }

        emit('save', dataToSend)
      } catch (error) {
        console.error('Error en handleSubmit:', error)
      } finally {
        loading.value = false
      }
    }

    const handleOverlayClick = () => {
      emit('close')
    }

    const getTitle = () => {
      if (!props.inscripcion) {
        return 'Nueva Inscripción'
      }
      return props.isEditing ? 'Editar Inscripción' : 'Ver Inscripción'
    }

    const getIconClass = () => {
      if (!props.inscripcion) {
        return 'fas fa-plus'
      }
      return props.isEditing ? 'fas fa-edit' : 'fas fa-eye'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'inscrito': 'Inscrito',
        'estudiante_activo': 'Estudiante Activo',
        'eliminado': 'Eliminado'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Watchers para validación en tiempo real
    watch(() => form.value.carnet, () => {
      if (errors.value.carnet) {
        validateForm()
      }
    })

    watch(() => form.value.nombre, () => {
      if (errors.value.nombre) {
        validateForm()
      }
    })

    watch(() => form.value.apellido, () => {
      if (errors.value.apellido) {
        validateForm()
      }
    })

    watch(() => form.value.correo_padres, () => {
      if (errors.value.correo_padres) {
        validateForm()
      }
    })

    // Lifecycle
    onMounted(() => {
      initializeForm()
    })

    // Watch para reinicializar cuando cambie la prop
    watch(() => props.inscripcion, () => {
      initializeForm()
    }, { deep: true })

    return {
      // Estado
      loading,
      form,
      errors,
      
      // Computed
      isFormValid,
      maxBirthDate,
      
      // Métodos
      handleSubmit,
      handleOverlayClick,
      getTitle,
      getIconClass,
      getStatusText,
      formatDate
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f7fafc;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title i {
  color: #4299e1;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #4a5568;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.inscripcion-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #4299e1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #e53e3e;
}

.optional-text {
  font-weight: 400;
  color: #718096;
  font-size: 0.8rem;
}

.form-input,
.form-select {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background: #f7fafc;
  color: #718096;
  cursor: not-allowed;
}

.form-input.error,
.form-select.error {
  border-color: #e53e3e;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.field-help {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-label {
  font-weight: 500;
  color: #4a5568;
  min-width: 150px;
}

.status-value {
  color: #2d3748;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.inscrito {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.estudiante_activo {
  background: #c6f6d5;
  color: #2f855a;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f7fafc;
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
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Animaciones */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-container {
  animation: modalSlideIn 0.2s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    justify-content: center;
  }
}
</style>
