<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="upload-container">
      <header class="page-header">
        <h1 class="text-page-title">Información de los pagos</h1>
        <div class="separator"></div>
      </header>
      
      <div class="content-wrapper">
        <section class="upload-section">
          <h2 class="text-section-title">Archivo de Excel</h2>
          
          <div class="upload-box" 
               :class="{ 'uploading': isUploading, 'dragging': isDragging }"
               @dragover.prevent="handleDragOver"
               @dragleave.prevent="handleDragLeave"
               @drop.prevent="handleDrop">
            <div class="upload-box-content">
              <div class="upload-icon-container">
                <FileUp class="upload-icon" v-if="!isUploading" />
                <Loader2 class="upload-icon animate-spin" v-else />
              </div>
              
              <div class="upload-text">
                <p class="text-body upload-message">
                  {{ isUploading ? 'Procesando archivo...' : 'Arrastra tu archivo aquí' }}
                </p>
                <p class="text-small upload-subtitle" v-if="!isUploading">
                  Formatos soportados: .xlsx, .xls, .csv
                </p>
              </div>
              
              <div class="upload-actions">
                <label for="file-upload" class="file-upload-btn" :class="{ 'disabled': isUploading }">
                  <span class="text-button btn-text">{{ isUploading ? 'Procesando...' : 'Seleccionar archivo' }}</span>
                  <span class="text-button btn-text-mobile">{{ isUploading ? 'Procesando...' : 'Subir' }}</span>
                </label>
                <input type="file" id="file-upload" accept=".xlsx, .xls, .csv" 
                  @change="handleFileUpload" :disabled="isUploading" />
              </div>
              
              <div class="upload-hint" v-if="!isUploading">
                <p class="text-small">o haz clic para seleccionar</p>
              </div>
            </div>
          </div>
          
          <!-- Información adicional -->
          <div class="upload-info">
            <div class="info-card">
              <h3 class="text-subsection-title">Formato requerido</h3>
              <p class="text-small">El archivo debe contener las columnas: Carnet, Nombre, Grado, Monto, Mes, Fecha</p>
            </div>
            <div class="info-card">
              <h3 class="text-subsection-title">Tamaño máximo</h3>
              <p class="text-small">Archivos hasta 10MB</p>
            </div>
          </div>
        </section>
        </div>
    </main>
    
    <ErrorDialog 
      :show="showError"
      :errors="validationErrors"
      @close="showError = false"
    />
    <ConfirmationDialog
      :show="showConfirmation"
      :fileName="selectedFile?.name"
      @confirm="processFile"
      @cancel="cancelUpload"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { User, CreditCard, FileUp, Loader2 } from 'lucide-vue-next'
import { validateExcelFile } from '@/utils/excelValidator'
import ErrorDialog from '@/components/dialogs/ErrorDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { uploadPaymentFile } from '@/services/paymentService'

const router = useRouter()
const file = ref(null)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

const showError = ref(false)
const validationErrors = ref([])
const showConfirmation = ref(false)
const selectedFile = ref(null)
const isUploading = ref(false)
const isDragging = ref(false)

const processFile = async () => {
  try {
    isUploading.value = true
    showConfirmation.value = false  
    const response = await uploadPaymentFile(selectedFile.value)
    
    if (response.duplicatesCount > 0) {
      validationErrors.value = [
        `Se procesaron ${response.insertedCount} pagos nuevos exitosamente.`,
        `Se encontraron ${response.duplicatesCount} pagos duplicados que fueron omitidos.`
      ]
    } else {
      validationErrors.value = [`Se procesaron ${response.insertedCount || response.count} pagos exitosamente`]
    }
    
    showError.value = true
    resetForm()
  } catch (error) {
    // Mejorar el manejo de errores
    let errorMessages = []
    
    if (error.message.includes('columna')) {
      errorMessages = error.message.split('\n')
    } else if (error.message.includes('duplicado')) {
      errorMessages = ['El archivo contiene pagos que ya han sido procesados anteriormente.']
    } else if (error.message.includes('No se encontraron datos')) {
      errorMessages = ['El archivo está vacío o no contiene datos válidos.']
    } else {
      errorMessages = [error.message]
    }
    
    validationErrors.value = errorMessages
    showError.value = true
    isUploading.value = false
  }
}

const resetForm = () => {
  selectedFile.value = null
  showConfirmation.value = false
  isUploading.value = false
  isDragging.value = false
}

const handleFileUpload = (event) => {
  showError.value = false
  validationErrors.value = []
  
  const uploadedFile = event.target.files[0]
  if (uploadedFile) {
    const validation = validateExcelFile(uploadedFile)
    if (!validation.isValid) {
      validationErrors.value = validation.errors
      showError.value = true
      return
    }
    selectedFile.value = uploadedFile
    showConfirmation.value = true
  }
}

const cancelUpload = () => {
  showConfirmation.value = false  
  resetForm()
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  // Solo cambiar isDragging si realmente salimos del área
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragging.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  const droppedFile = event.dataTransfer.files[0]
  if (droppedFile) {
    const validation = validateExcelFile(droppedFile)
    if (!validation.isValid) {
      validationErrors.value = validation.errors
      showError.value = true
      return
    }
    selectedFile.value = droppedFile
    showConfirmation.value = true
  }
}
</script>

<style scoped>
/* Layout general */
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.upload-container {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow-y: auto;
  margin-left: 130px; /* Espacio para sidebar en desktop */
  transition: margin-left 0.3s ease;
}

/* Header */
.page-header {
  padding: 2rem 2rem 0 2rem;
  background: white;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

/* Sección de upload */
.upload-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Upload box */
.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  min-height: 320px;
  border: 3px dashed #cbd5e0;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.upload-box:hover {
  border-color: #1b9963;
  background-color: #f0f9f4;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(27, 153, 99, 0.15);
}

.upload-box.dragging {
  border-color: #1b9963;
  background-color: #f0f9f4;
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(27, 153, 99, 0.2);
}

.upload-box.uploading {
  opacity: 0.8;
  cursor: not-allowed;
  pointer-events: none;
}

.upload-box-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

/* Icono de upload */
.upload-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1b9963, #22c55e);
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: white;
  transition: all 0.3s ease;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Texto del upload */
.upload-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Acciones de upload */
.upload-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.file-upload-btn {
  background: linear-gradient(135deg, #1b9963, #22c55e);
  color: white;
  padding: 12px 32px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(27, 153, 99, 0.3);
  min-width: 160px;
}

.file-upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 153, 99, 0.4);
  background: linear-gradient(135deg, #158a50, #16a34a);
}

.file-upload-btn:active {
  transform: translateY(0);
}

.file-upload-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-text-mobile {
  display: none;
}

input[type="file"] {
  display: none;
}

/* Hint de upload */
.upload-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Información adicional */
.upload-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
}

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* Animaciones */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */

/* Tablet */
@media screen and (max-width: 1024px) {
  .content-wrapper {
    padding: 1.5rem;
  }

  .upload-box {
    max-width: 450px;
    padding: 2.5rem 1.5rem;
  }

  .upload-icon-container {
    width: 70px;
    height: 70px;
  }

  .upload-icon {
    width: 35px;
    height: 35px;
  }
}

/* Mobile */
@media screen and (max-width: 768px) {
  .upload-container {
    margin-left: 0; /* Eliminar margen del sidebar en móvil */
  }

  .page-header {
    padding: 5rem 1rem 0 1rem; /* Espacio para el botón hamburguesa */
    text-align: center;
  }

  .content-wrapper {
    padding: 1rem;
    min-height: calc(100vh - 140px);
  }

  /* Upload box móvil */
  .upload-box {
    max-width: 100%;
    padding: 2rem 1rem;
    min-height: 280px;
    border-radius: 16px;
    margin: 0 0.5rem;
  }

  .upload-icon-container {
    width: 60px;
    height: 60px;
  }

  .upload-icon {
    width: 30px;
    height: 30px;
  }

  /* Botón móvil */
  .file-upload-btn {
    padding: 14px 24px;
    font-size: 1rem;
    min-width: 140px;
  }

  .btn-text {
    display: none;
  }

  .btn-text-mobile {
    display: inline;
  }

  /* Info cards móvil */
  .upload-info {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .info-card {
    padding: 1.25rem;
  }
}

/* Móvil pequeño */
@media screen and (max-width: 480px) {
  .upload-container {
    padding-top: 75px;
  }

  .content-wrapper {
    padding: 0.75rem;
  }

  .upload-box {
    padding: 1.5rem 0.75rem;
    min-height: 260px;
    margin: 0 0.25rem;
  }

  .upload-icon-container {
    width: 50px;
    height: 50px;
  }

  .upload-icon {
    width: 25px;
    height: 25px;
  }

  .upload-message {
    font-size: 0.9375rem;
  }

  .file-upload-btn {
    padding: 12px 20px;
    font-size: 0.9375rem;
    min-width: 120px;
  }

  .info-card {
    padding: 1rem;
  }
}

/* Mejoras para accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states para accesibilidad */
.file-upload-btn:focus-visible {
  outline: 2px solid #1b9963;
  outline-offset: 2px;
}

.upload-box:focus-within {
  border-color: #1b9963;
  background-color: #f0f9f4;
}
</style>