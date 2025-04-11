<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      
      <main class="upload-container">
        <h1 class="page-title">Información de los pagos</h1>
        <div class="separator"></div>
        
        <h2 class="section-title">Archivo de Excel</h2>
        
        <div class="upload-box" 
             :class="{ 'uploading': isUploading, 'dragging': isDragging }"
             @dragover.prevent="isDragging = true"
             @dragleave.prevent="isDragging = false"
             @drop.prevent="handleDrop">
          <div class="upload-box-content">
            <FileUp class="upload-icon" v-if="!isUploading" />
            <Loader2 class="upload-icon animate-spin" v-else />
            <p>{{ isUploading ? 'Procesando archivo...' : 'Arrastra archivo o' }}</p>
            <label for="file-upload" class="file-upload-btn" :class="{ 'disabled': isUploading }">
              {{ isUploading ? 'Procesando...' : 'Subir' }}
            </label>
            <input type="file" id="file-upload" accept=".xlsx, .xls, .csv" 
              @change="handleFileUpload" :disabled="isUploading" />
          </div>
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

const handleFileUpload = (event) => {
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

const resetForm = () => {
  selectedFile.value = null
  showConfirmation.value = false
  showError.value = false
  validationErrors.value = []
  isUploading.value = false
  isDragging.value = false
}

const processFile = async () => {
  try {
    isUploading.value = true
    showConfirmation.value = false  
    const response = await uploadPaymentFile(selectedFile.value)
    validationErrors.value = [`Se procesaron ${response.count} pagos exitosamente`]
    showError.value = true
    resetForm()
  } catch (error) {
    validationErrors.value = [error.message]
    showError.value = true
    isUploading.value = false
    showConfirmation.value = false  
  }
}

const cancelUpload = () => {
  showConfirmation.value = false  
  resetForm()
}

const handleDrop = (event) => {
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
.layout {
    display: flex;
    min-height: 100vh;
    width: 100%;
  }
  
  .upload-container {
    flex: 1;
    padding: 2rem;
    background: white;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 1rem;
    width: 100%;
    text-align: left;
  }
  
  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
    width: 100%;
  }
  
  .section-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 2rem;
    text-align: left;
  }
  
  .upload-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    border-radius: 20px;
    width: 450px;
    margin: 0 auto;
    border: 4px solid #000;
    background-color: white;
  }
  
  .upload-box-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .upload-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
    transition: opacity 0.3s ease;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
    opacity: 1;
  }
  
  .upload-box p {
    font-size: 1rem;
    color: #555;
  }
  
  .file-upload-btn {
    background-color: #1b9963;
    color: white;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-align: center;
    font-size: 1rem;
    border: none;
  }
  
  .file-upload-btn:hover {
    background-color: #158a50;
  }
  
  input[type="file"] {
    display: none;
  }
  
  .uploading {
    opacity: 0.7;
    pointer-events: none;
  }
  
  .file-upload-btn.disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .dragging {
    border-style: dashed;
    background-color: #f5f5f5;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>