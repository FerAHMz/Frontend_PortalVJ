<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="planifications-container">
      <div class="header-section">
        <h1 class="text-page-title">Planificaciones por Grado</h1>
        <div class="separator"></div>
        <div class="header-stats">
          <div class="stat-card">
            <h3>Total Planificaciones</h3>
            <p class="stat-number">{{ statistics.totalPlanifications }}</p>
          </div>
          <div class="stat-card">
            <h3>Grados con Planificaciones</h3>
            <p class="stat-number">{{ statistics.totalGrades }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando planificaciones...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>Error al cargar planificaciones</h3>
          <p>{{ error }}</p>
          <button @click="fetchPlanifications" class="retry-btn">Reintentar</button>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="planifications-content">
        <!-- Statistics Overview -->
        <div class="statistics-section">
          <h2>Estadísticas Generales</h2>
          <div class="stats-grid">
            <div class="stat-item pending">
              <span class="stat-label">En Revisión</span>
              <span class="stat-value">{{ getStatisticByStatus('en_revision') }}</span>
            </div>
            <div class="stat-item approved">
              <span class="stat-label">Aceptadas</span>
              <span class="stat-value">{{ getStatisticByStatus('aceptadas') }}</span>
            </div>
            <div class="stat-item rejected">
              <span class="stat-label">Rechazadas</span>
              <span class="stat-value">{{ getStatisticByStatus('rechazadas') }}</span>
            </div>
          </div>
        </div>

        <!-- Planifications by Grade -->
        <div class="grades-section">
          <h2>Planificaciones por Grado</h2>
          <div v-if="planificationsByGrade.length === 0" class="no-data">
            <p>No se encontraron planificaciones.</p>
          </div>
          <div v-else class="grades-grid">
            <div 
              v-for="grade in planificationsByGrade" 
              :key="grade.grado_id"
              class="grade-card"
            >
              <div class="grade-header">
                <h3>{{ grade.grado_nombre }}</h3>
                <span class="planifications-count">
                  {{ grade.planificaciones.length }} planificaciones
                </span>
              </div>
              
              <div class="grade-stats">
                <div class="mini-stat pending">
                  <span>En Revisión: {{ getGradeStatByStatus(grade, 'en revision') }}</span>
                </div>
                <div class="mini-stat approved">
                  <span>Aceptadas: {{ getGradeStatByStatus(grade, 'aceptada') }}</span>
                </div>
                <div class="mini-stat rejected">
                  <span>Rechazadas: {{ getGradeStatByStatus(grade, 'rechazada') }}</span>
                </div>
              </div>

              <div class="planifications-list">
                <div 
                  v-for="planification in grade.planificaciones.slice(0, showAllPlanifications[grade.grado_id] ? undefined : 3)" 
                  :key="planification.planificacion_id"
                  class="planification-item"
                  :class="getStatusClass(planification.estado)"
                  @click="viewPlanificationDetail(planification.planificacion_id)"
                >
                  <div class="planification-header">
                    <h4>{{ planification.materia_nombre }}</h4>
                    <span class="status-badge" :class="getStatusClass(planification.estado)">
                      {{ getStatusText(planification.estado) }}
                    </span>
                  </div>
                  <div class="planification-info">
                    <p><strong>Maestro:</strong> {{ planification.maestro.nombre }} {{ planification.maestro.apellido }}</p>
                    <p><strong>Mes:</strong> {{ planification.mes }}</p>
                    <p><strong>Ciclo:</strong> {{ planification.ciclo_escolar }}</p>
                  </div>
                </div>
              </div>

              <div v-if="grade.planificaciones.length > 3" class="show-more-section">
                <button 
                  @click="toggleShowAll(grade.grado_id)"
                  class="show-more-btn"
                >
                  {{ showAllPlanifications[grade.grado_id] ? 'Mostrar menos' : `Ver todas (${grade.planificaciones.length})` }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Planification Detail Modal -->
      <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Detalle de Planificación</h2>
            <button @click="closeDetailModal" class="close-btn">&times;</button>
          </div>
          
          <div v-if="loadingDetail" class="modal-loading">
            <div class="loading-spinner"></div>
            <p>Cargando detalle...</p>
          </div>
          
          <div v-else-if="selectedPlanification" class="modal-body">
            <div class="detail-header">
              <h3>{{ selectedPlanification.curso.materia_nombre }}</h3>
              <span class="status-badge" :class="getStatusClass(selectedPlanification.estado)">
                {{ getStatusText(selectedPlanification.estado) }}
              </span>
            </div>
            
            <div class="detail-info">
              <div class="info-grid">
                <div class="info-item">
                  <label>Grado:</label>
                  <span>{{ selectedPlanification.curso.grado.nombre }}</span>
                </div>
                <div class="info-item">
                  <label>Maestro:</label>
                  <span>{{ selectedPlanification.maestro.nombre }} {{ selectedPlanification.maestro.apellido }}</span>
                </div>
                <div class="info-item">
                  <label>Mes:</label>
                  <span>{{ selectedPlanification.mes }}</span>
                </div>
                <div class="info-item">
                  <label>Ciclo Escolar:</label>
                  <span>{{ selectedPlanification.ciclo_escolar }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedPlanification.revisiones.length > 0" class="reviews-section">
              <h4>Revisiones y Observaciones</h4>
              <div class="reviews-list">
                <div 
                  v-for="review in selectedPlanification.revisiones" 
                  :key="review.id"
                  class="review-item"
                >
                  <div class="review-header">
                    <span class="reviewer">{{ review.director.nombre }} {{ review.director.apellido }}</span>
                    <span class="review-date">{{ formatDate(review.fecha) }}</span>
                  </div>
                  <div class="review-content">
                    <p>{{ review.observaciones }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Files Section -->
            <div class="files-section">
              <h4>Archivos de la Planificación</h4>
              <div v-if="loadingFiles" class="files-loading">
                <div class="loading-spinner small"></div>
                <p>Cargando archivos...</p>
              </div>
              <div v-else-if="planificationFiles.length === 0" class="no-files">
                <File class="no-files-icon" />
                <p>No hay archivos asociados a esta planificación.</p>
              </div>
              <div v-else class="files-list">
                <div 
                  v-for="file in planificationFiles" 
                  :key="file.id"
                  class="file-item"
                >
                  <div class="file-info">
                    <div class="file-icon">{{ getFileIcon(file.mime_type) }}</div>
                    <div class="file-details">
                      <h5>{{ file.original_name }}</h5>
                      <div class="file-meta">
                        <span class="file-type" :class="getFileType(file.mime_type).toLowerCase()">
                          {{ getFileType(file.mime_type) }}
                        </span>
                        <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
                      </div>
                      <span class="file-upload-info">
                        Subido por {{ file.uploaded_by_name || file.uploaded_by_email }} 
                        el {{ formatDate(file.uploaded_at) }}
                      </span>
                    </div>
                  </div>
                  <button @click="downloadFile(file)" class="download-btn">
                    <Download class="download-icon" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <NotificationDialog />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue';
import { superUserPlanificationService } from '@/services/superUserPlanificationService';
import superUserFileService from '@/services/superUserFileService';
import { useNotifications } from '@/utils/useNotifications.js';
import { useRouter } from 'vue-router';
import { User, Settings, BookOpen, FileText, Users, UserPlus, Download, File } from 'lucide-vue-next';

const router = useRouter();
const { showNotification } = useNotifications();

// Reactive data
const loading = ref(true);
const error = ref(null);
const planificationsByGrade = ref([]);
const statistics = ref({
  totalPlanifications: 0,
  totalGrades: 0
});
const detailedStatistics = ref({});
const showAllPlanifications = ref({});
const showDetailModal = ref(false);
const selectedPlanification = ref(null);
const loadingDetail = ref(false);
const planificationFiles = ref([]);
const loadingFiles = ref(false);

// Menu items for superuser
const menuItems = [
  { label: 'Perfil', icon: User, path: '/superuser/profile' },
  { label: 'Gestión de Usuarios', icon: Settings, path: '/superuser' },
  { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' },
  { label: 'Planificaciones', icon: FileText, path: '/superuser/planifications' },
  { label: 'Gestión de Familias', icon: Users, path: '/superuser/families' },
  { label: 'Inscripciones', icon: UserPlus, path: '/superuser/inscripciones' }
];

// Computed properties
const getStatisticByStatus = computed(() => {
  return (status) => {
    if (!detailedStatistics.value.general_statistics || detailedStatistics.value.general_statistics.length === 0) {
      return 0;
    }
    return detailedStatistics.value.general_statistics.reduce((sum, stat) => sum + (parseInt(stat[status]) || 0), 0);
  };
});

// Methods
const fetchPlanifications = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const [planificationsResult, statisticsResult] = await Promise.all([
      superUserPlanificationService.getAllPlanificationsByGrade(),
      superUserPlanificationService.getPlanificationsStatistics()
    ]);
    
    planificationsByGrade.value = planificationsResult.data;
    statistics.value = {
      totalPlanifications: planificationsResult.total_planificaciones,
      totalGrades: planificationsResult.total_grados
    };
    detailedStatistics.value = statisticsResult.data;
    
  } catch (err) {
    console.error('Error fetching planifications:', err);
    error.value = err.response?.data?.error || 'Error al cargar las planificaciones';
    showNotification('error', 'Error', error.value);
  } finally {
    loading.value = false;
  }
};

const getGradeStatByStatus = (grade, status) => {
  return grade.planificaciones.filter(p => p.estado === status).length;
};

const getStatusClass = (status) => {
  const statusClasses = {
    'en revision': 'pending',
    'aceptada': 'approved',
    'rechazada': 'rejected'
  };
  return statusClasses[status] || '';
};

const getStatusText = (status) => {
  const statusTexts = {
    'en revision': 'En Revisión',
    'aceptada': 'Aceptada',
    'rechazada': 'Rechazada'
  };
  return statusTexts[status] || status;
};

const toggleShowAll = (gradeId) => {
  showAllPlanifications.value[gradeId] = !showAllPlanifications.value[gradeId];
};

const viewPlanificationDetail = async (planificationId) => {
  try {
    showDetailModal.value = true;
    loadingDetail.value = true;
    loadingFiles.value = true;
    
    // Fetch planification detail and files in parallel
    const [detailResult, filesResult] = await Promise.all([
      superUserPlanificationService.getPlanificationDetail(planificationId),
      superUserFileService.getPlanificationFiles(planificationId).catch(err => {
        console.warn('Files not available for this planification:', err);
        return { files: [] };
      })
    ]);
    
    selectedPlanification.value = detailResult.data;
    planificationFiles.value = filesResult.files || [];
    
  } catch (err) {
    console.error('Error fetching planification detail:', err);
    showNotification('error', 'Error', 'Error al cargar el detalle de la planificación');
    closeDetailModal();
  } finally {
    loadingDetail.value = false;
    loadingFiles.value = false;
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedPlanification.value = null;
  loadingDetail.value = false;
  planificationFiles.value = [];
  loadingFiles.value = false;
};

const downloadFile = async (file) => {
  try {
    await superUserFileService.downloadFile(file);
    showNotification('success', 'Éxito', 'Archivo descargado correctamente');
  } catch (error) {
    console.error('Error downloading file:', error);
    showNotification('error', 'Error', 'Error al descargar el archivo: ' + (error.message || 'Error desconocido'));
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  return '📎';
};

const getFileType = (mimeType) => {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
  if (mimeType.includes('image')) return 'Imagen';
  if (mimeType.includes('video')) return 'Video';
  if (mimeType.includes('audio')) return 'Audio';
  return 'Archivo';
};

const handleItemClick = (item) => {
  if (item.action === 'logout') {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/login');
  } else if (item.path) {
    router.push(item.path);
  }
};

// Lifecycle
onMounted(() => {
  fetchPlanifications();
});
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.planifications-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  min-width: 150px;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #e53e3e;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #3182ce;
}

.statistics-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.statistics-section h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.stat-item.pending {
  background: #fef5e7;
  border: 1px solid #f6ad55;
}

.stat-item.approved {
  background: #f0fff4;
  border: 1px solid #68d391;
}

.stat-item.rejected {
  background: #fed7d7;
  border: 1px solid #fc8181;
}

.stat-label {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
}

.grades-section h2 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
}

.grades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.grade-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.grade-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.grade-header {
  background: #4299e1;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grade-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.planifications-count {
  font-size: 0.875rem;
  opacity: 0.9;
}

.grade-stats {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  background: #f7fafc;
  font-size: 0.875rem;
}

.mini-stat.pending { color: #d69e2e; }
.mini-stat.approved { color: #38a169; }
.mini-stat.rejected { color: #e53e3e; }

.planifications-list {
  padding: 0 1rem;
}

.planification-item {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.planification-item:hover {
  background: #f7fafc;
}

.planification-item:last-child {
  border-bottom: none;
}

.planification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.planification-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef5e7;
  color: #d69e2e;
}

.status-badge.approved {
  background: #f0fff4;
  color: #38a169;
}

.status-badge.rejected {
  background: #fed7d7;
  color: #e53e3e;
}

.planification-info {
  margin-bottom: 0.5rem;
}

.planification-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #4a5568;
}

.show-more-section {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.show-more-btn {
  padding: 0.5rem 1rem;
  background: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.show-more-btn:hover {
  background: #e2e8f0;
}

.no-data {
  text-align: center;
  padding: 4rem;
  color: #718096;
}

/* Modal Styles */
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

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-loading {
  padding: 3rem;
  text-align: center;
}

.modal-body {
  padding: 1.5rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: bold;
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #2d3748;
}

.reviews-section, .files-section {
  margin-top: 2rem;
}

.reviews-section h4, .files-section h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  border-bottom: 2px solid #4299e1;
  padding-bottom: 0.5rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #ed8936;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reviewer {
  font-weight: bold;
  color: #2d3748;
}

.review-date {
  font-size: 0.875rem;
  color: #718096;
}

.review-content p {
  margin: 0;
  color: #4a5568;
  line-height: 1.5;
}

/* Files Section Styles */
.files-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #718096;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.no-files {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
}

.no-files-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-item {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #38a169;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #edf2f7;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.file-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details h5 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 0.875rem;
  font-weight: 600;
  word-break: break-word;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0;
}

.file-type {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.file-type.pdf {
  background: #fef2f2;
  color: #dc2626;
}

.file-type.word {
  background: #eff6ff;
  color: #2563eb;
}

.file-type.imagen {
  background: #f0fdf4;
  color: #16a34a;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-upload-info {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
}

.download-btn {
  background: #38a169;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.download-btn:hover {
  background: #2f855a;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.download-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .planifications-container {
    padding: 1rem;
  }
  
  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .header-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .grades-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .grade-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

@media (max-width: 480px) {
  .planifications-container {
    padding: 0.75rem;
  }
  
  .text-page-title {
    margin-bottom: 0.8rem;
  }
}
</style>
