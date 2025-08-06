<template>
  <div class="attendance-section">
    <div class="attendance-header">
      <h3>Registro de Asistencia</h3>
      <div class="attendance-filters">
        <div class="filter-group">
          <label>Materia:</label>
          <select v-model="selectedSubject" @change="fetchAttendanceData">
            <option value="">Todas las materias</option>
            <option 
              v-for="subject in subjects" 
              :key="subject.id" 
              :value="subject.id"
            >
              {{ subject.materia }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Periodo:</label>
          <select v-model="selectedPeriod" @change="fetchAttendanceData">
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="semester">Semestre actual</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Cargando información de asistencia...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="attendance-content">
      <!-- Resumen de asistencia -->
      <div class="attendance-summary">
        <div class="summary-card present">
          <div class="summary-icon">
            <CircleCheck />
          </div>
          <div class="summary-info">
            <span class="summary-number">{{ attendanceSummary.present }}</span>
            <span class="summary-label">Presente</span>
          </div>
        </div>

        <div class="summary-card late">
          <div class="summary-icon">
            <ClockAlert />
          </div>
          <div class="summary-info">
            <span class="summary-number">{{ attendanceSummary.late }}</span>
            <span class="summary-label">Llegadas tarde</span>
          </div>
        </div>

        <div class="summary-card absent">
          <div class="summary-icon">
            <CircleX />
          </div>
          <div class="summary-info">
            <span class="summary-number">{{ attendanceSummary.absent }}</span>
            <span class="summary-label">Ausente</span>
          </div>
        </div>

        <div class="summary-card percentage">
          <div class="summary-icon">
            <BarChart3 />
          </div>
          <div class="summary-info">
            <span class="summary-number">{{ attendancePercentage }}%</span>
            <span class="summary-label">Asistencia</span>
          </div>
        </div>
      </div>

      <!-- Registro detallado por materia -->
      <div v-if="attendanceBySubject.length" class="attendance-details">
        <h4>Detalle por Materia</h4>
        <div class="subject-attendance-list">
          <div 
            v-for="subjectData in attendanceBySubject" 
            :key="subjectData.subjectId"
            class="subject-attendance-card"
          >
            <div class="subject-header">
              <h5>{{ subjectData.subjectName }}</h5>
              <span class="subject-percentage">{{ subjectData.percentage }}% asistencia</span>
            </div>
            
            <div class="subject-stats">
              <div class="stat present">
                <CircleCheck class="stat-icon" />
                <span>{{ subjectData.present }} presente</span>
              </div>
              <div class="stat late">
                <ClockAlert class="stat-icon" />
                <span>{{ subjectData.late }} tarde</span>
              </div>
              <div class="stat absent">
                <CircleX class="stat-icon" />
                <span>{{ subjectData.absent }} ausente</span>
              </div>
            </div>

            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${subjectData.percentage}%` }"
                :class="getProgressClass(subjectData.percentage)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registro reciente -->
      <div v-if="recentAttendance.length" class="recent-attendance">
        <h4>Registro Reciente</h4>
        <div class="recent-list">
          <div 
            v-for="record in recentAttendance" 
            :key="`${record.date}-${record.subjectId}`"
            class="recent-item"
          >
            <div class="recent-date">
              {{ formatDate(record.date) }}
            </div>
            <div class="recent-subject">
              {{ record.subjectName }}
            </div>
            <div class="recent-status" :class="record.status">
              <component :is="getStatusIcon(record.status)" class="status-icon" />
              <span>{{ getStatusText(record.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!attendanceBySubject.length && !loading" class="no-data">
        No hay registros de asistencia para el periodo seleccionado.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { CircleCheck, CircleX, ClockAlert, BarChart3 } from 'lucide-vue-next'
import attendanceService from '@/services/attendanceService'

const props = defineProps({
  student: {
    type: Object,
    required: true
  }
})

const selectedSubject = ref('')
const selectedPeriod = ref('month')
const loading = ref(false)
const error = ref(null)
const subjects = ref([])
const attendanceData = ref([])
const recentAttendance = ref([])

// Computed para el resumen de asistencia
const attendanceSummary = computed(() => {
  const summary = { present: 0, late: 0, absent: 0, total: 0 }
  
  attendanceData.value.forEach(record => {
    summary[record.status]++
    summary.total++
  })
  
  return summary
})

// Computed para el porcentaje de asistencia
const attendancePercentage = computed(() => {
  if (attendanceSummary.value.total === 0) return '0.0'
  
  const weights = { present: 1, late: 0.5, absent: 0 }
  const total = (attendanceSummary.value.present * weights.present) +
                (attendanceSummary.value.late * weights.late) +
                (attendanceSummary.value.absent * weights.absent)
                
  const percentage = (total / attendanceSummary.value.total) * 100
  return Math.min(100, Math.max(0, percentage)).toFixed(1)
})

// Computed para asistencia agrupada por materia
const attendanceBySubject = computed(() => {
  const subjectMap = new Map()
  
  attendanceData.value.forEach(record => {
    if (!subjectMap.has(record.subjectId)) {
      subjectMap.set(record.subjectId, {
        subjectId: record.subjectId,
        subjectName: record.subjectName,
        present: 0,
        late: 0,
        absent: 0,
        total: 0
      })
    }
    
    const subject = subjectMap.get(record.subjectId)
    subject[record.status]++
    subject.total++
  })
  
  return Array.from(subjectMap.values()).map(subject => ({
    ...subject,
    percentage: subject.total > 0 ? 
      ((subject.present + (subject.late * 0.5)) / subject.total * 100).toFixed(1) : 
      '0.0'
  }))
})

// Watchers
watch([selectedSubject, selectedPeriod], fetchAttendanceData)
watch(() => props.student, fetchAttendanceData, { deep: true })

// Methods
async function fetchAttendanceData() {
  if (!props.student?.carnet) return
  
  loading.value = true
  error.value = null
  
  try {
    const dateRange = getDateRange(selectedPeriod.value)
    const response = await attendanceService.getStudentAttendance(
      props.student.carnet,
      dateRange.startDate,
      dateRange.endDate,
      selectedSubject.value
    )
    
    if (response.success) {
      attendanceData.value = response.attendance || []
      recentAttendance.value = response.recent || []
      subjects.value = response.subjects || []
    } else {
      throw new Error(response.message || 'Error al cargar asistencia')
    }
  } catch (err) {
    console.error('Error fetching attendance:', err)
    error.value = err.message || 'Error al cargar la información de asistencia'
  } finally {
    loading.value = false
  }
}

function getDateRange(period) {
  const today = new Date()
  let startDate = new Date()
  
  switch (period) {
    case 'week':
      startDate.setDate(today.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(today.getMonth() - 1)
      break
    case 'semester':
      const currentMonth = today.getMonth()
      if (currentMonth >= 1 && currentMonth <= 6) {
        startDate = new Date(today.getFullYear(), 1, 1)
      } else {
        startDate = new Date(today.getFullYear(), 7, 1)
      }
      break
  }
  
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10)
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'present': return CircleCheck
    case 'late': return ClockAlert
    case 'absent': return CircleX
    default: return CircleX
  }
}

function getStatusText(status) {
  switch (status) {
    case 'present': return 'Presente'
    case 'late': return 'Llegada tarde'
    case 'absent': return 'Ausente'
    default: return 'Desconocido'
  }
}

function getProgressClass(percentage) {
  const percent = parseFloat(percentage)
  if (percent >= 90) return 'excellent'
  if (percent >= 80) return 'good'
  if (percent >= 70) return 'fair'
  return 'poor'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-GT', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchAttendanceData()
})
</script>

<style scoped>
.attendance-section {
  margin-top: 2rem;
}

.attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.attendance-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.attendance-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1rem;
}

.loading {
  color: #1b9963;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.attendance-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Resumen de asistencia */
.attendance-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-card.present {
  border-left-color: #198754;
}

.summary-card.late {
  border-left-color: #fd7e14;
}

.summary-card.absent {
  border-left-color: #dc3545;
}

.summary-card.percentage {
  border-left-color: #0d6efd;
}

.summary-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
}

.summary-card.present .summary-icon {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
}

.summary-card.late .summary-icon {
  color: #fd7e14;
  background-color: rgba(253, 126, 20, 0.1);
}

.summary-card.absent .summary-icon {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

.summary-card.percentage .summary-icon {
  color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.summary-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* Detalle por materia */
.attendance-details h4,
.recent-attendance h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.subject-attendance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-attendance-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.subject-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.subject-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1b9963;
}

.subject-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
}

.stat.present {
  color: #198754;
}

.stat.late {
  color: #fd7e14;
}

.stat.absent {
  color: #dc3545;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.excellent {
  background-color: #198754;
}

.progress-fill.good {
  background-color: #20c997;
}

.progress-fill.fair {
  background-color: #fd7e14;
}

.progress-fill.poor {
  background-color: #dc3545;
}

/* Registro reciente */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
}

.recent-date {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
}

.recent-subject {
  flex: 1;
  color: #6c757d;
}

.recent-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  font-size: 0.8rem;
}

.recent-status.present {
  color: #198754;
}

.recent-status.late {
  color: #fd7e14;
}

.recent-status.absent {
  color: #dc3545;
}

.status-icon {
  width: 1rem;
  height: 1rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .attendance-header {
    flex-direction: column;
    align-items: stretch;
  }

  .attendance-filters {
    justify-content: stretch;
  }

  .filter-group {
    flex: 1;
  }

  .filter-group select {
    min-width: 100%;
  }

  .attendance-summary {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .summary-card {
    padding: 0.75rem;
  }

  .summary-icon {
    width: 2rem;
    height: 2rem;
  }

  .summary-number {
    font-size: 1.25rem;
  }

  .subject-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .subject-stats {
    justify-content: space-between;
  }

  .recent-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .recent-date {
    min-width: auto;
    text-align: center;
  }

  .recent-status {
    justify-content: center;
  }
}
</style>