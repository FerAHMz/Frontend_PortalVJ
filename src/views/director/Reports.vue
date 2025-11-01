<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="reports-container">
      <h1 class="text-page-title">Reportes Académicos</h1>
      <div class="separator"></div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="grado-filter">Grado:</label>
          <select v-model="filters.grado" id="grado-filter" class="filter-select">
            <option value="">Todos los grados</option>
            <option v-for="grado in grados" :key="grado.id" :value="grado.id">
              {{ grado.grado }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="periodo-filter">Período:</label>
          <select v-model="filters.periodo" id="periodo-filter" class="filter-select">
            <option value="">Seleccionar período</option>
            <option value="1">1er Trimestre</option>
            <option value="2">2do Trimestre</option>
            <option value="3">3er Trimestre</option>
          </select>
        </div>

        <button @click="generateReports" class="generate-btn" :disabled="loading">
          <BarChart3 class="btn-icon" />
          {{ loading ? 'Generando...' : 'Generar Reportes' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Generando reportes...</p>
      </div>

      <!-- Reports Grid -->
      <div v-else class="reports-grid">
        <!-- Reporte de Rendimiento Académico -->
        <div class="report-card">
          <div class="report-header">
            <BookOpen class="report-icon" />
            <h3>Rendimiento Académico</h3>
          </div>
          <div class="report-content">
            <p>Promedio general de calificaciones por grado y materia</p>
            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">Promedio General:</span>
                <span class="stat-value">{{ academicStats.promedio || '--' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Estudiantes Evaluados:</span>
                <span class="stat-value">{{ academicStats.estudiantes || '--' }}</span>
              </div>
            </div>
          </div>
          <div class="report-actions">
            <button @click="downloadReport('academic')" class="download-btn">
              <Download class="btn-icon" />
              Descargar PDF
            </button>
          </div>
        </div>

        <!-- Reporte de Asistencia -->
        <div class="report-card">
          <div class="report-header">
            <Users class="report-icon" />
            <h3>Reporte de Asistencia</h3>
          </div>
          <div class="report-content">
            <p>Estadísticas de asistencia por grado y período</p>
            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">Asistencia Promedio:</span>
                <span class="stat-value">{{ attendanceStats.promedio || '--' }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Días Lectivos:</span>
                <span class="stat-value">{{ attendanceStats.diasClase || '--' }}</span>
              </div>
            </div>
          </div>
          <div class="report-actions">
            <button @click="downloadReport('attendance')" class="download-btn">
              <Download class="btn-icon" />
              Descargar PDF
            </button>
          </div>
        </div>

        <!-- Reporte de Planificaciones -->
        <div class="report-card">
          <div class="report-header">
            <FileText class="report-icon" />
            <h3>Estado de Planificaciones</h3>
          </div>
          <div class="report-content">
            <p>Seguimiento del cumplimiento de planificaciones académicas</p>
            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">Completadas:</span>
                <span class="stat-value">{{ planningStats.completadas || '--' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">En Progreso:</span>
                <span class="stat-value">{{ planningStats.progreso || '--' }}</span>
              </div>
            </div>
          </div>
          <div class="report-actions">
            <button @click="downloadReport('planning')" class="download-btn">
              <Download class="btn-icon" />
              Descargar PDF
            </button>
          </div>
        </div>

        <!-- Reporte Consolidado -->
        <div class="report-card featured">
          <div class="report-header">
            <BarChart3 class="report-icon" />
            <h3>Reporte Ejecutivo</h3>
          </div>
          <div class="report-content">
            <p>Resumen ejecutivo con todas las métricas institucionales</p>
            <div class="report-stats">
              <div class="stat-item">
                <span class="stat-label">Período:</span>
                <span class="stat-value">{{ filters.periodo ? `${filters.periodo}° Trimestre` : 'Año Completo' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Última Actualización:</span>
                <span class="stat-value">{{ formatDate(lastUpdate) }}</span>
              </div>
            </div>
          </div>
          <div class="report-actions">
            <button @click="downloadReport('executive')" class="download-btn primary">
              <Download class="btn-icon" />
              Descargar Reporte Completo
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchData" class="retry-btn">Reintentar</button>
      </div>
    </main>

    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { User, BookOpen, BarChart3, Users, Download, FileText, Info } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'
import { downloadDirectorInstructivePDF } from '@/composables/useDirectorInstructivePDF.js'
import { useDirectorReportsPDF } from '@/composables/useDirectorReportsPDF.js'
import directorReportsService from '@/services/directorReportsService.js'
import gradeDirectorService from '@/services/gradeDirectorService.js'

const router = useRouter()
const { showNotification } = useNotifications()
const { 
  generateAcademicReport, 
  generateAttendanceReport, 
  generatePlanningReport, 
  generateExecutiveReport 
} = useDirectorReportsPDF()

const loading = ref(false)
const error = ref(null)
const lastUpdate = ref(new Date())

const filters = ref({
  grado: '',
  periodo: ''
})

const grados = ref([])

const academicStats = ref({
  promedio: null,
  estudiantes: null,
  cursos: null,
  materias: null
})

const attendanceStats = ref({
  promedio: null,
  diasClase: null,
  estudiantesPresentes: null,
  estudiantesAusentes: null
})

const planningStats = ref({
  total: null,
  completadas: null,
  progreso: null,
  porcentaje: null
})

const menuItems = [
  { label: 'Perfil', icon: User, path: '/director' },
  { label: 'Gestión Académica', icon: BookOpen, path: '/director/academic' },
  { label: 'Reportes', icon: BarChart3, path: '/director/reports' },
  { label: 'Personal', icon: Users, path: '/director/staff' },
  { label: 'Instructivo', icon: Info, action: 'downloadInstructive' }
]

const handleItemClick = (item) => {
  if (item.action === 'downloadInstructive') {
    downloadDirectorInstructivePDF()
  } else if (item.path) {
    router.push(item.path)
  }
}

const generateReports = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Obtener estadísticas reales del servicio
    const allStats = await directorReportsService.getAllStatistics(filters.value)
    
    // Actualizar estadísticas con datos reales
    academicStats.value = allStats.academic
    attendanceStats.value = allStats.attendance
    planningStats.value = allStats.planning
    
    lastUpdate.value = allStats.lastUpdate
    showNotification('success', 'Éxito', 'Reportes generados correctamente')
  } catch (err) {
    console.error('Error generating reports:', err)
    error.value = err.message || 'Error al generar los reportes'
    showNotification('error', 'Error', 'No se pudieron generar los reportes')
  } finally {
    loading.value = false
  }
}

const downloadReport = async (reportType) => {
  try {
    loading.value = true
    
    // Preparar filtros con nombres de grado para el PDF
    const filtersWithNames = { ...filters.value }
    if (filters.value.grado) {
      const gradoSeleccionado = grados.value.find(g => g.id == filters.value.grado)
      if (gradoSeleccionado) {
        filtersWithNames.gradoNombre = gradoSeleccionado.grado
      }
    }
    
    let result
    switch (reportType) {
      case 'academic':
        result = await generateAcademicReport(filtersWithNames)
        break
      case 'attendance':
        result = await generateAttendanceReport(filtersWithNames)
        break
      case 'planning':
        result = await generatePlanningReport(filtersWithNames)
        break
      case 'executive':
        result = await generateExecutiveReport(filtersWithNames)
        break
      default:
        throw new Error('Tipo de reporte no válido')
    }
    
    if (result.success) {
      showNotification('success', 'Descarga Completada', `${result.fileName} se ha descargado exitosamente`)
    }
  } catch (err) {
    console.error('Error downloading report:', err)
    showNotification('error', 'Error', err.message || 'No se pudo generar el reporte PDF')
  } finally {
    loading.value = false
  }
}

const fetchData = async () => {
  // Cargar grados disponibles y estadísticas iniciales
  try {
    loading.value = true
    error.value = null
    
    // Cargar grados del director
    const gradosData = await gradeDirectorService.getGradosDelDirector()
    grados.value = gradosData
    
    // Cargar estadísticas iniciales
    const allStats = await directorReportsService.getAllStatistics()
    academicStats.value = allStats.academic
    attendanceStats.value = allStats.attendance
    planningStats.value = allStats.planning
    lastUpdate.value = allStats.lastUpdate
  } catch (err) {
    console.error('Error fetching initial data:', err)
    error.value = err.message || 'Error al cargar los datos'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.reports-container {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 2rem;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 150px;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #1b9963;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background-color: #148a56;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
  transition: transform 0.2s, box-shadow 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.report-card.featured {
  border: 2px solid #1b9963;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.report-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.report-icon {
  width: 24px;
  height: 24px;
  color: #1b9963;
}

.report-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.report-content {
  padding: 1.5rem;
}

.report-content p {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.5;
}

.report-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #1b9963;
}

.report-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  width: 100%;
  justify-content: center;
}

.download-btn:hover {
  background-color: #5a6268;
}

.download-btn.primary {
  background-color: #1b9963;
}

.download-btn.primary:hover {
  background-color: #148a56;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.error-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  margin-top: 2rem;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1b9963;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .reports-container {
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .generate-btn {
    justify-content: center;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 480px) {
  .reports-container {
    padding: 0.75rem;
  }

  .filter-select {
    min-width: auto;
  }
}
</style>