<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="tasks-container">
      <!-- Header responsive -->
      <div class="header-section">
        <h1 class="page-title">Archivos de Planificación</h1>
        <div class="course-subtitle" v-if="planificationData">
          <span class="course-info">{{ planificationData.trimestre }}</span>
          <span class="course-divider">|</span>
          <span class="course-info">Ciclo: {{ planificationData.ciclo_escolar }}</span>
          <span class="course-divider">|</span>
          <span class="course-info">Estado: {{ planificationData.estado }}</span>
        </div>
      </div>
      <div class="separator"></div>

      <!-- Lista de archivos -->
      <div class="files-section">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Cargando archivos...</p>
        </div>
        <div v-else-if="files.length === 0" class="no-files">
          <div class="no-files-icon">�</div>
          <h3>No hay archivos adjuntos</h3>
          <p>Esta planificación no tiene archivos adjuntos.</p>
        </div>
        <div v-else>
          <h2 class="section-title">Archivos Adjuntos</h2>
          
          <!-- Vista de tabla para desktop -->
          <div class="table-container desktop-view">
            <table class="files-table">
              <thead>
                <tr>
                  <th>Nombre del Archivo</th>
                  <th>Tipo</th>
                  <th>Tamaño</th>
                  <th>Subido el</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in files" :key="file.id">
                  <td>
                    <div class="file-name">
                      <span class="file-icon">{{ getFileIcon(file.mime_type) }}</span>
                      {{ file.original_name }}
                    </div>
                  </td>
                  <td>
                    <div class="file-type">{{ getFileType(file.mime_type) }}</div>
                  </td>
                  <td>
                    <div class="file-size">{{ formatFileSize(file.file_size) }}</div>
                  </td>
                  <td>
                    <div class="file-date">{{ formatDate(file.uploaded_at) }}</div>
                  </td>
                  <td>
                    <div class="file-actions">
                      <button @click="downloadFile(file)" class="download-btn">
                        📥 Descargar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista de tarjetas para móvil -->
          <div class="cards-container mobile-view">
            <div v-for="file in files" :key="file.id" class="file-card">
              <div class="card-header">
                <div class="file-name-mobile">
                  <span class="file-icon">{{ getFileIcon(file.mime_type) }}</span>
                  <h3 class="card-title">{{ file.original_name }}</h3>
                </div>
                <span class="file-size-badge">{{ formatFileSize(file.file_size) }}</span>
              </div>
              
              <div class="card-body">
                <div class="card-field">
                  <label>Tipo:</label>
                  <p>{{ getFileType(file.mime_type) }}</p>
                </div>
                
                <div class="card-field">
                  <label>Subido el:</label>
                  <p>{{ formatDate(file.uploaded_at) }}</p>
                </div>
              </div>
              
              <div class="card-actions">
                <button @click="downloadFile(file)" class="download-btn mobile-btn">
                  📥 Descargar archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import {
  User,
  ClipboardList,
  BookOpen,
  CalendarDays,
  FileText,
  MessageSquare
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const planificationData = ref(null)
const files = ref([])
const loading = ref(true)

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('video')) return '🎥'
  if (mimeType.includes('audio')) return '🎵'
  return '📎'
}

const getFileType = (mimeType) => {
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word'
  if (mimeType.includes('image')) return 'Imagen'
  if (mimeType.includes('video')) return 'Video'
  if (mimeType.includes('audio')) return 'Audio'
  return 'Archivo'
}

const fetchPlanificationFiles = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    const planificationId = route.params.planId
    const response = await fetch(`http://localhost:3000/api/teacher/planning/${planificationId}/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success) {
      files.value = data.files || []
    } else {
      throw new Error(data.message || 'Error al cargar archivos')
    }
  } catch (error) {
    console.error('Error fetching planification files:', error)
    files.value = []
  } finally {
    loading.value = false
  }
}

const fetchPlanificationData = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const planificationId = route.params.planId
    const courseId = route.params.courseId
    
    const response = await fetch(`http://localhost:3000/api/teacher/courses/${courseId}/planning/${planificationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      planificationData.value = data
    }
  } catch (error) {
    console.error('Error fetching planification data:', error)
  }
}

const downloadFile = async (file) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('No se encontró token de autenticación')
      return
    }

    const response = await fetch(`http://localhost:3000/api/teacher/planning/files/${file.id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al descargar el archivo')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = file.original_name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading file:', error)
    alert('Error al descargar el archivo: ' + error.message)
  }
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

onMounted(() => {
  fetchPlanificationData()
  fetchPlanificationFiles()
})
</script>

<style scoped>
/* Layout principal */
.layout {
  display: flex;
  min-height: 100vh;
}

.tasks-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header responsive */
.header-section {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 0.5rem;
}

.course-subtitle {
  color: #555;
  font-size: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.course-info {
  white-space: nowrap;
}

.course-divider {
  color: #999;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Estados de carga y vacío */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-files {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-files-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-files h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

/* Vista de tabla para desktop */
.desktop-view {
  display: block !important;
}

.mobile-view,
.cards-container {
  display: none !important;
}

.file-card {
  display: none !important;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.files-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.files-table th,
.files-table td {
  padding: 1.25rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.files-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.files-table tbody tr {
  transition: background-color 0.2s ease;
}

.files-table tbody tr:hover {
  background-color: #f8f9fa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.file-original-name {
  font-size: 0.85rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-type {
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.file-type.pdf {
  background: #ffe6e6;
  color: #d63384;
}

.file-type.word {
  background: #e6f3ff;
  color: #0d6efd;
}

.file-size {
  color: #666;
  font-size: 0.9rem;
}

.file-date {
  color: #666;
  font-size: 0.9rem;
}

/* Botones */
.download-btn {
  background: #1b9963;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.download-btn:hover {
  background: #158a50;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 153, 99, 0.3);
}

/* Vista de tarjetas para móvil */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #1b9963 0%, #158a50 100%);
  color: white;
}

.card-file-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.card-file-info {
  flex: 1;
  min-width: 0;
}

.card-file-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-original-name {
  font-size: 0.9rem;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  padding: 1.25rem;
}

.card-field {
  margin-bottom: 1rem;
}

.card-field:last-child {
  margin-bottom: 0;
}

.card-field label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.card-field p {
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.card-info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.card-actions {
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
}

.mobile-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

/* Responsive breakpoints */
@media screen and (max-width: 1200px) {
  .table-container {
    overflow-x: auto;
  }
  
  .files-table {
    min-width: 700px;
  }
}

@media screen and (max-width: 768px) {
  .tasks-container {
    margin-left: 0;
    padding: 1rem;
    padding-top: 80px;
  }
  
  /* Header móvil */
  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .course-subtitle {
    justify-content: center;
    text-align: center;
    font-size: 1rem;
  }
  
  .course-divider {
    display: none;
  }
  
  .course-info {
    display: block;
    width: 100%;
    text-align: center;
  }
  
  /* Cambiar a vista de tarjetas en móvil */
  .desktop-view {
    display: none !important;
  }
  
  .mobile-view,
  .cards-container {
    display: block !important;
  }
  
  .file-card {
    display: block !important;
  }
  
  /* Tarjetas móvil */
  .card-info-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

@media screen and (max-width: 480px) {
  .tasks-container {
    padding: 0.75rem;
    padding-top: 75px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .course-subtitle {
    font-size: 0.9rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .card-file-name {
    font-size: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-actions {
    padding: 0.75rem 1rem;
  }
}

/* Scroll suave para tabla */
.table-container {
  scrollbar-width: thin;
  scrollbar-color: #1b9963 #f1f1f1;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #1b9963;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #158a50;
}

/* Animaciones suaves */
@media (prefers-reduced-motion: no-preference) {
  .file-card,
  .download-btn {
    transition: all 0.3s ease;
  }
}
</style>