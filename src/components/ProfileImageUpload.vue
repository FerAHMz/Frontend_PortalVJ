<template>
  <div class="profile-image-container">
    <div 
      class="profile-image-wrapper"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <!-- Imagen actual o icono por defecto -->
      <div v-if="!currentImage" class="default-avatar">
        <User class="default-icon" />
      </div>
      <img 
        v-else
        :src="currentImage" 
        alt="Foto de perfil" 
        class="profile-image"
        @error="handleImageError"
      />
      
      <!-- Overlay para subir imagen -->
      <div 
        v-show="showUploadOption"
        class="upload-overlay"
        @click="handleOverlayClick"
      >
        <div class="upload-content">
          <Camera class="upload-icon" />
          <span class="upload-text">{{ currentImage ? 'Cambiar foto' : 'Subir foto' }}</span>
        </div>
      </div>
      
      <!-- Loading overlay -->
      <div v-if="isUploading" class="loading-overlay">
        <div class="spinner"></div>
        <span>Subiendo...</span>
      </div>
    </div>
    
    <!-- Input file oculto -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <!-- Botón para eliminar imagen (solo si hay imagen) -->
    <button
      v-if="currentImage && !isUploading"
      @click="handleDeleteImage"
      class="delete-button"
      title="Eliminar foto"
    >
      <Trash2 class="delete-icon" />
    </button>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'
import { User, Camera, Trash2 } from 'lucide-vue-next'
import { profileImageService } from '@/services/profileImageService.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  currentImage: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'large' // 'small', 'medium', 'large'
  }
})

const emit = defineEmits(['image-updated', 'image-deleted'])

const showUploadOption = ref(false)
const isUploading = ref(false)
const fileInput = ref(null)
const isMobile = ref(false)
const { showToast } = useToast()

// Detectar si es dispositivo móvil
const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Función para manejar redimensionamiento
const handleResize = () => {
  checkIfMobile()
}

// Manejar mouse enter (solo desktop)
const handleMouseEnter = () => {
  if (!isMobile.value) {
    showUploadOption.value = true
  }
}

// Manejar mouse leave (solo desktop)
const handleMouseLeave = () => {
  if (!isMobile.value) {
    showUploadOption.value = false
  }
}

// Manejar click en la imagen
const handleClick = (event) => {
  if (isMobile.value) {
    // En móvil: primer click muestra opciones, segundo click las oculta si no se usó overlay
    if (!showUploadOption.value) {
      showUploadOption.value = true
      // Auto-ocultar después de 3 segundos si no se interactúa
      setTimeout(() => {
        if (showUploadOption.value) {
          showUploadOption.value = false
        }
      }, 3000)
    } else {
      showUploadOption.value = false
    }
    event.preventDefault()
    event.stopPropagation()
  }
}

// Manejar click en el overlay
const handleOverlayClick = (event) => {
  event.preventDefault()
  event.stopPropagation()
  triggerFileInput()
}

onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    showToast('Por favor selecciona un archivo de imagen válido', 'error')
    return
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('La imagen debe ser menor a 5MB', 'error')
    return
  }

  try {
    isUploading.value = true
    
    // Subir imagen directamente - el backend maneja tanto la subida como la actualización del perfil
    const response = await profileImageService.uploadProfileImage(file)
    
    if (response.success && response.imageUrl) {
      emit('image-updated', response.imageUrl)
      showToast('Imagen de perfil actualizada correctamente', 'success')
    } else {
      throw new Error(response.message || 'Error al subir la imagen')
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Error al subir la imagen. Intenta nuevamente.'
    showToast(errorMessage, 'error')
  } finally {
    isUploading.value = false
    // Limpiar el input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleDeleteImage = async () => {
  try {
    await profileImageService.deleteProfileImage()
    emit('image-deleted')
    showToast('Imagen de perfil eliminada', 'success')
  } catch (error) {
    console.error('Error deleting image:', error)
    showToast('Error al eliminar la imagen', 'error')
  }
}

const handleImageError = () => {
  // Si hay error cargando la imagen, emitir evento para usar imagen por defecto
  emit('image-deleted')
}
</script>

<style scoped>
.profile-image-container {
  position: relative;
  display: inline-block;
}

.profile-image-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #1b9963;
  transition: all 0.3s ease;
}

.profile-image-wrapper:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(27, 153, 99, 0.3);
}

/* Indicador visual sutil para desktop */
.profile-image-wrapper::before {
  content: '';
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: rgba(27, 153, 99, 0.8);
  border-radius: 50%;
  border: 2px solid white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/%3E%3Ccircle cx='12' cy='13' r='4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 10px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  z-index: 5;
}

.profile-image-wrapper:hover::before {
  opacity: 1;
}

/* Tamaños */
.profile-image-wrapper {
  width: 180px;
  height: 180px;
}

.profile-image-container[data-size="small"] .profile-image-wrapper {
  width: 80px;
  height: 80px;
}

.profile-image-container[data-size="medium"] .profile-image-wrapper {
  width: 120px;
  height: 120px;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.default-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1b9963, #16844a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.default-icon {
  width: 50%;
  height: 50%;
  color: white;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
  z-index: 10;
}

.upload-content {
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.upload-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.upload-text {
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1b9963;
  font-size: 0.8rem;
  font-weight: 500;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e3e3e3;
  border-top: 2px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.delete-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  background: #dc3545;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-button:hover {
  background: #c82333;
  transform: scale(1.1);
}

.delete-icon {
  width: 14px;
  height: 14px;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-image-wrapper {
    /* En móvil, mostrar un hint visual más sutil */
    position: relative;
  }
  
  .profile-image-wrapper::after {
    content: '';
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    background: #1b9963;
    border-radius: 50%;
    border: 2px solid white;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'/%3E%3Ccircle cx='12' cy='13' r='4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 12px;
    z-index: 5;
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }
  
  .profile-image-wrapper:active::after {
    opacity: 1;
    transform: scale(1.1);
  }
  
  .upload-overlay {
    /* En móvil, mejor contraste cuando aparece */
    background: rgba(0, 0, 0, 0.8);
    animation: fadeInMobile 0.3s ease;
  }
  
  @keyframes fadeInMobile {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .upload-content {
    gap: 6px;
  }
  
  .upload-text {
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .upload-icon {
    width: 22px;
    height: 22px;
  }
  
  .delete-button {
    width: 28px;
    height: 28px;
    top: -6px;
    right: -6px;
  }
  
  .delete-icon {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .profile-image-wrapper::after {
    width: 20px;
    height: 20px;
    background-size: 10px;
  }
  
  .upload-text {
    font-size: 0.7rem;
  }
  
  .upload-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
