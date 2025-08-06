<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-upload"></i>
          Carga Masiva de Inscripciones
        </h3>
        <button class="modal-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Paso 1: Instrucciones y descarga de plantilla -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="step-header">
            <div class="step-indicator">
              <span class="step-number active">1</span>
              <span class="step-number">2</span>
              <span class="step-number">3</span>
            </div>
            <h4 class="step-title">Preparar archivo Excel</h4>
          </div>

          <div class="instructions">
            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-download"></i>
              </div>
              <div class="instruction-content">
                <h5>1. Descargar plantilla</h5>
                <p>Descarga la plantilla oficial con el formato correcto</p>
                <button class="btn btn-outline" @click="downloadTemplate">
                  <i class="fas fa-file-excel"></i>
                  Descargar Plantilla
                </button>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-edit"></i>
              </div>
              <div class="instruction-content">
                <h5>2. Completar información</h5>
                <p>Llena los datos de los estudiantes siguiendo el formato</p>
                <div class="format-info">
                  <h6>Campos requeridos:</h6>
                  <ul>
                    <li><strong>Carnet:</strong> Identificador único del estudiante</li>
                    <li><strong>Nombres:</strong> Nombres completos</li>
                    <li><strong>Apellidos:</strong> Apellidos completos</li>
                    <li><strong>Fecha_Nacimiento:</strong> Formato YYYY-MM-DD</li>
                    <li><strong>ID_Grado_Seccion:</strong> Ver tabla de referencia</li>
                    <li><strong>SIRE:</strong> Código SIRE del estudiante</li>
                    <li><strong>Correo_Padres:</strong> Email de contacto</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-icon">
                <i class="fas fa-table"></i>
              </div>
              <div class="instruction-content">
                <h5>3. Referencia de Grados y Secciones</h5>
                <p>Utiliza estos IDs para el campo ID_Grado_Seccion</p>
                <div class="grades-reference">
                  <div class="grades-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Grado - Sección</th>
                          <th>Capacidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          v-for="grade in gradosYSecciones" 
                          :key="grade.id_grado_seccion"
                        >
                          <td class="grade-id">{{ grade.id_grado_seccion }}</td>
                          <td class="grade-name">{{ grade.display_name }}</td>
                          <td class="grade-capacity">
                            {{ grade.capacidad_maxima || 'Sin límite' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 2: Subir archivo -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="step-header">
            <div class="step-indicator">
              <span class="step-number completed">1</span>
              <span class="step-number active">2</span>
              <span class="step-number">3</span>
            </div>
            <h4 class="step-title">Subir archivo Excel</h4>
          </div>

          <div class="upload-section">
            <div 
              class="upload-area"
              :class="{ 
                'dragover': isDragOver,
                'has-file': selectedFile
              }"
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
            >
              <div v-if="!selectedFile" class="upload-prompt">
                <i class="fas fa-cloud-upload-alt"></i>
                <h5>Arrastra tu archivo aquí</h5>
                <p>o haz clic para seleccionar</p>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  @change="handleFileSelect"
                  style="display: none"
                />
                <div class="center-btn-wrapper">
                  <button class="btn btn-outline" @click="$refs.fileInput.click()">
                    Seleccionar Archivo
                  </button>
                </div>
              </div>

              <div v-else class="file-info">
                <div class="file-icon">
                  <i class="fas fa-file-excel"></i>
                </div>
                <div class="file-details">
                  <h6>{{ selectedFile.name }}</h6>
                  <p>{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <button class="btn-remove" @click="removeFile">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div v-if="fileErrors.length > 0" class="file-errors">
              <h6>Errores en el archivo:</h6>
              <ul>
                <li v-for="error in fileErrors" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Paso 3: Resultados -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="step-header">
            <div class="step-indicator">
              <span class="step-number completed">1</span>
              <span class="step-number completed">2</span>
              <span class="step-number active">3</span>
            </div>
            <h4 class="step-title">Resultados del procesamiento</h4>
          </div>

          <div class="results-section">
            <!-- Resumen -->
            <div class="results-summary">
              <div class="summary-card success">
                <div class="summary-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="summary-content">
                  <div class="summary-number">{{ uploadResults.exitosos.length }}</div>
                  <div class="summary-label">Inscripciones Creadas</div>
                </div>
              </div>

              <div class="summary-card error">
                <div class="summary-icon">
                  <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="summary-content">
                  <div class="summary-number">{{ uploadResults.errores.length }}</div>
                  <div class="summary-label">Errores</div>
                </div>
              </div>

              <div class="summary-card total">
                <div class="summary-icon">
                  <i class="fas fa-file"></i>
                </div>
                <div class="summary-content">
                  <div class="summary-number">{{ uploadResults.total }}</div>
                  <div class="summary-label">Total Procesadas</div>
                </div>
              </div>
            </div>

            <!-- Detalles de éxitos -->
            <div v-if="uploadResults.exitosos.length > 0" class="results-section-detail">
              <h5>
                <i class="fas fa-check text-success"></i>
                Inscripciones creadas exitosamente
              </h5>
              <div class="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Carnet</th>
                      <th>Nombres</th>
                      <th>Apellidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in uploadResults.exitosos" :key="item.fila">
                      <td>{{ item.fila }}</td>
                      <td>{{ item.carnet }}</td>
                      <td>{{ item.nombres }}</td>
                      <td>{{ item.apellidos }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detalles de errores -->
            <div v-if="uploadResults.errores.length > 0" class="results-section-detail">
              <h5>
                <i class="fas fa-exclamation-triangle text-error"></i>
                Errores encontrados
              </h5>
              <div class="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Carnet</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="error in uploadResults.errores" :key="error.fila">
                      <td>{{ error.fila }}</td>
                      <td>{{ error.carnet }}</td>
                      <td class="error-message">{{ error.error }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <!-- Paso 1: Solo siguiente -->
        <template v-if="currentStep === 1">
          <button class="btn btn-secondary" @click="$emit('close')">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="nextStep">
            <i class="fas fa-arrow-right"></i>
            Siguiente
          </button>
        </template>

        <!-- Paso 2: Anterior, procesar -->
        <template v-if="currentStep === 2">
          <button class="btn btn-secondary" @click="previousStep">
            <i class="fas fa-arrow-left"></i>
            Anterior
          </button>
          <button 
            class="btn btn-primary"
            :disabled="!selectedFile || processing"
            @click="processFile"
          >
            <i v-if="processing" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-upload"></i>
            {{ processing ? 'Procesando...' : 'Procesar Archivo' }}
          </button>
        </template>

        <!-- Paso 3: Cerrar, nuevo -->
        <template v-if="currentStep === 3">
          <button class="btn btn-outline" @click="resetUpload">
            <i class="fas fa-plus"></i>
            Nueva Carga
          </button>
          <button class="btn btn-primary" @click="handleComplete">
            <i class="fas fa-check"></i>
            Completar
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { inscripcionesService } from '@/services/inscripcionesService'

export default {
  name: 'UploadExcelModal',
  props: {
    gradosYSecciones: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'upload-success'],
  setup(props, { emit }) {
    // Estado reactivo
    const currentStep = ref(1)
    const selectedFile = ref(null)
    const isDragOver = ref(false)
    const processing = ref(false)
    const fileErrors = ref([])
    const uploadResults = ref({
      exitosos: [],
      errores: [],
      total: 0
    })

    // Métodos de navegación
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const resetUpload = () => {
      currentStep.value = 1
      selectedFile.value = null
      fileErrors.value = []
      uploadResults.value = {
        exitosos: [],
        errores: [],
        total: 0
      }
    }

    // Métodos de archivo
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        validateAndSetFile(file)
      }
    }

    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      
      const files = event.dataTransfer.files
      if (files.length > 0) {
        validateAndSetFile(files[0])
      }
    }

    const validateAndSetFile = (file) => {
      fileErrors.value = []

      // Validar tipo de archivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ]

      if (!allowedTypes.includes(file.type)) {
        fileErrors.value.push('El archivo debe ser un Excel (.xlsx o .xls)')
        return
      }

      // Validar tamaño (10MB máximo)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        fileErrors.value.push('El archivo no puede superar los 10MB')
        return
      }

      selectedFile.value = file
    }

    const removeFile = () => {
      selectedFile.value = null
      fileErrors.value = []
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Métodos de procesamiento
    const processFile = async () => {
      if (!selectedFile.value) return

      try {
        processing.value = true

        const formData = new FormData()
        formData.append('excelFile', selectedFile.value)

        const response = await inscripcionesService.uploadExcel(formData)
        
        uploadResults.value = response.data
        nextStep()

      } catch (error) {
        console.error('Error al procesar archivo:', error)
        fileErrors.value = [
          error.response?.data?.message || 'Error al procesar el archivo'
        ]
      } finally {
        processing.value = false
      }
    }

    const downloadTemplate = () => {
      // Crear CSV template para descarga
      const csvContent = `Carnet,Nombres,Apellidos,Fecha_Nacimiento,ID_Grado_Seccion,SIRE,Correo_Padres
12345,Juan Carlos,Pérez García,2010-03-15,1,SIRE001,padres.juan@email.com
67890,María Elena,López Martínez,2009-07-22,2,SIRE002,padres.maria@email.com
11111,Carlos Alberto,Rodríguez Hernández,2011-01-10,3,SIRE003,padres.carlos@email.com`

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'Plantilla_Inscripciones.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const handleOverlayClick = () => {
      emit('close')
    }

    const handleComplete = () => {
      emit('upload-success', uploadResults.value)
    }

    return {
      // Estado
      currentStep,
      selectedFile,
      isDragOver,
      processing,
      fileErrors,
      uploadResults,
      
      // Métodos
      nextStep,
      previousStep,
      resetUpload,
      handleFileSelect,
      handleDrop,
      removeFile,
      formatFileSize,
      processFile,
      downloadTemplate,
      handleOverlayClick,
      handleComplete
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 900px;
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

.step-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-header {
  text-align: center;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  background: #e2e8f0;
  color: #718096;
  transition: all 0.3s;
}

.step-number.active {
  background: #4299e1;
  color: white;
}

.step-number.completed {
  background: #38a169;
  color: white;
}

.step-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

/* Paso 1: Instrucciones */
.instructions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.instruction-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.instruction-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.instruction-content {
  flex: 1;
}

.instruction-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.instruction-content p {
  margin: 0 0 1rem 0;
  color: #718096;
}

.format-info {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.format-info h6 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.format-info ul {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
}

.format-info li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.grades-reference {
  margin-top: 1rem;
}

.grades-table {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.grades-table table {
  width: 100%;
  border-collapse: collapse;
}

.grades-table th,
.grades-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.grades-table th {
  background: #f7fafc;
  font-weight: 600;
  font-size: 0.9rem;
  color: #4a5568;
  position: sticky;
  top: 0;
}

.grade-id {
  font-weight: 600;
  color: #2d3748;
}

.grade-name {
  color: #2d3748;
}

.grade-capacity {
  color: #718096;
}

/* Paso 2: Upload */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area.dragover {
  border-color: #4299e1;
  background: #ebf8ff;
}

.upload-area.has-file {
  border-color: #38a169;
  background: #f0fff4;
  cursor: default;
}

.upload-prompt i {
  font-size: 3rem;
  color: #4299e1;
  margin-bottom: 1rem;
}

.upload-prompt h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.upload-prompt p {
  margin: 0 0 1.5rem 0;
  color: #718096;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.file-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #38a169;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.file-details {
  flex: 1;
}

.file-details h6 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.file-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #718096;
}

.btn-remove {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: #fed7d7;
  color: #c53030;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fbb6ce;
}

.file-errors {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 1rem;
}

.file-errors h6 {
  margin: 0 0 0.5rem 0;
  color: #c53030;
  font-weight: 600;
}

.file-errors ul {
  margin: 0;
  padding-left: 1.5rem;
}

.file-errors li {
  color: #c53030;
  margin-bottom: 0.25rem;
}

/* Paso 3: Resultados */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.summary-card.success .summary-icon {
  background: #38a169;
}

.summary-card.error .summary-icon {
  background: #e53e3e;
}

.summary-card.total .summary-icon {
  background: #4299e1;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.summary-label {
  font-size: 0.9rem;
  color: #718096;
}

.results-section-detail {
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.results-section-detail h5 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-success {
  color: #38a169;
}

.text-error {
  color: #e53e3e;
}

.results-table {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.results-table table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.results-table th {
  background: #f7fafc;
  font-weight: 600;
  font-size: 0.9rem;
  color: #4a5568;
  position: sticky;
  top: 0;
}

.error-message {
  color: #e53e3e;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
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

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover {
  border-color: #4299e1;
  color: #4299e1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
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

  .instruction-item {
    flex-direction: column;
    text-align: center;
  }

  .upload-area {
    padding: 2rem 1rem;
  }

  .results-summary {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

<style scoped>
.center-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 1rem;
}
</style>
