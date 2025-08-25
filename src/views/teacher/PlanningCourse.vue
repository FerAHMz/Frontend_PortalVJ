<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <div class="header-section">
        <h1 class="page-title" style="opacity: 1; transform: none;">
          Planificación del Curso
        </h1>
        <div class="course-subtitle" style="opacity: 1; transform: none;">
          <span class="course-info">{{ courseData?.materia || 'Materia' }}</span>
          <span class="divider">|</span>
          <span class="course-info">Grado: {{ courseData?.grado || '-' }}</span>
          <span class="divider">|</span>
          <span class="course-info">Sección: {{ courseData?.seccion || '-' }}</span>
        </div>
        <div class="separator" style="opacity: 1; transform: none;"></div>
      </div>

      <!-- Formulario para crear planificación -->
      <div class="crud-actions">
        <div class="form-container">
          <form @submit.prevent="submitPlanning" class="planning-form">
            <div class="form-row">
              <div class="form-group">
                <label for="trimestre">Trimestre</label>
                <select v-model="trimestre" class="form-input" required>
                  <option disabled value="">Selecciona un trimestre</option>
                  <option v-for="t in trimestres" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="ciclo">Ciclo escolar</label>
                <input v-model="ciclo" type="text" class="form-input" required placeholder="Ej. 2025" />
              </div>
            </div>

            <div class="form-actions">
              <button class="action-btn create" type="submit">
                <Plus class="action-icon" />
                <span class="btn-text">Crear planificación</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Mensaje cuando no hay planificaciones -->
      <div v-if="planificaciones.length === 0 && !planificacionesLoading" class="no-planning">
        <div class="no-planning-content">
          <FileText class="no-planning-icon" />
          <p>No hay planificaciones registradas para este curso.</p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="planificacionesLoading" class="loading-state">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Cargando planificaciones...</p>
        </div>
      </div>

      <!-- Tabla responsive -->
      <div v-else-if="!planificacionesLoading" class="table-section">
        <!-- Vista de tabla para desktop -->
        <div class="table-container desktop-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Trimestre</th>
                <th>Ciclo Escolar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in planificaciones" :key="plan.id">
                <td>{{ plan.id }}</td>
                <td>{{ plan.mes }}</td>
                <td>{{ plan.ciclo_escolar }}</td>
                <td>
                  <span class="badge" :class="formatEstadoClass(plan.estado)">{{ plan.estado }}</span>
                </td>
                <td class="actions">
                  <div class="action-group">
                    <button class="action-btn view" @click="goToTasks(plan.id)" title="Ver tareas">
                      <BookOpen class="action-icon" />
                    </button>
                    <button @click="deletePlanning(plan.id)" class="action-btn delete" title="Eliminar">
                      <Trash class="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista de tarjetas para móvil -->
        <div class="mobile-cards">
          <div v-for="plan in planificaciones" :key="plan.id" class="planning-card">
            <div class="card-header">
              <div class="card-id">ID: {{ plan.id }}</div>
              <span class="badge" :class="formatEstadoClass(plan.estado)">{{ plan.estado }}</span>
            </div>
            
            <div class="card-content">
              <div class="card-info">
                <div class="info-item">
                  <span class="info-label">Trimestre:</span>
                  <span class="info-value">{{ plan.mes }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Ciclo Escolar:</span>
                  <span class="info-value">{{ plan.ciclo_escolar }}</span>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="action-btn view" @click="goToTasks(plan.id)">
                  <BookOpen class="action-icon" />
                  <span>Ver tareas</span>
                </button>
                <button @click="deletePlanning(plan.id)" class="action-btn delete">
                  <Trash class="action-icon" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <NotificationDialog />
    <ConfirmDialog ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import planningService from '@/services/planningService'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare, Plus, Trash } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'

const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const confirmDialog = ref(null)

// Pre-cargar datos síncronamente antes del mount
const getCourseData = () => {
  const savedCourse = sessionStorage.getItem('currentCourse')
  if (savedCourse) {
    try {
      return JSON.parse(savedCourse)
    } catch (error) {
      console.error('Error parsing course data:', error)
    }
  }
  // Fallback más descriptivo para mobile
  return { 
    materia: 'Curso', 
    grado: 'N/A', 
    seccion: 'N/A' 
  }
}

// Asegurar que siempre tengamos datos válidos para evitar flasheo
const courseData = ref(getCourseData())

// Garantizar que nunca hay valores undefined que causen flasheo
if (!courseData.value.materia) {
  courseData.value.materia = 'Curso'
}
if (!courseData.value.grado) {
  courseData.value.grado = 'N/A'
}
if (!courseData.value.seccion) {
  courseData.value.seccion = 'N/A'
}
const planificaciones = ref([])
const planificacionesLoading = ref(true) // Estado de loading
const trimestre = ref('')
const ciclo = ref('')

const trimestres = [
  { value: 'I', label: 'I Trimestre (Enero - Abril)' },
  { value: 'II', label: 'II Trimestre (Mayo - Agosto)' },
  { value: 'III', label: 'III Trimestre (Septiembre - Diciembre)' }
]

const courseId = route.params.courseId

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const formatEstadoClass = (estado) => {
  return estado.toLowerCase().replace(/\s/g, '-');
}

const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}

const fetchPlanning = async () => {
  planificacionesLoading.value = true
  try {
    const data = await planningService.fetchByCourse(courseId)
    planificaciones.value = data
  } catch (error) {
    showNotification('error', 'Error', 'No se pudieron cargar las planificaciones')
    console.error(error)
  } finally {
    planificacionesLoading.value = false
  }
}

const submitPlanning = async () => {
  try {
    await planningService.create(courseId, { 
      mes: trimestre.value,
      ciclo_escolar: ciclo.value
    })
    showNotification('success', 'Éxito', 'Planificación creada correctamente')
    // Reset form
    trimestre.value = ''
    ciclo.value = ''
    await fetchPlanning()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo crear la planificación')
    console.error(error)
  }
}

const goToTasks = (planId) => {
  router.push({
      name: 'CoursePlanningTasks',
      params: { 
      courseId: route.params.courseId,
      planId: planId
      },
      state: { courseData: courseData.value }
    })
}

const deletePlanning = async (planId) => {
  const plan = planificaciones.value.find(p => p.id === planId)
  const confirmed = await confirmDialog.value.show({
    title: 'Eliminar planificación',
    message: `¿Estás seguro de que deseas eliminar la planificación "${plan?.mes || ''}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar'
  })
  
  if (!confirmed) return
  
  try {
    await planningService.delete(courseId, planId)
    planificaciones.value = planificaciones.value.filter(p => p.id !== planId)
    showNotification('success', 'Éxito', 'Planificación eliminada correctamente')
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la planificación')
    console.error(error)
  }
}

onMounted(async () => {
  // Verificar que tenemos datos del curso, si no redirigir
  if (!courseData.value || !courseData.value.materia || courseData.value.materia === 'Curso') {
    router.push('/teacher/courses')
    return
  }
  
  // Cargar planificaciones después
  await fetchPlanning()
})
</script>

<style scoped>
/* Estilos base */
.layout {
  display: flex;
  min-height: 100vh;
}

.planning-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  max-width: 100%;
  box-sizing: border-box;
}

/* Header section */
.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
  line-height: 1.2;
  transition: opacity 0.3s ease;
  /* Evitar reflow en mobile */
  min-height: 2.5rem;
  display: flex;
  align-items: center;
}

.loading-placeholder {
  opacity: 0.7;
}

.loading-placeholder.loaded {
  opacity: 1;
}

.course-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  /* Estabilizar layout mientras carga */
  min-height: 1.5rem;
  transition: opacity 0.3s ease;
}

.course-info {
  white-space: nowrap;
  /* Anti-flasheo: estabilizar altura */
  min-height: 1.5rem;
  display: inline-block;
}

.divider {
  color: #ccc;
  /* Anti-flasheo: tamaño fijo */
  min-height: 1rem;
  line-height: 1;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Formulario */
.crud-actions {
  margin-bottom: 2rem;
}

.form-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.planning-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1b9963;
  box-shadow: 0 0 0 2px rgba(27, 153, 99, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

/* Botones */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  font-size: 0.9rem;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
}

.action-btn.create:hover {
  background-color: #158a50;
  transform: translateY(-1px);
}

.action-btn.view {
  background-color: #1b9963;
  color: white;
  padding: 0.5rem;
}

.action-btn.view:hover {
  background-color: #158a50;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
  padding: 0.5rem;
}

.action-btn.delete:hover {
  background-color: #c9302c;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Mensaje sin planificaciones */
.no-planning {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-planning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-planning-icon {
  width: 48px;
  height: 48px;
  color: #ccc;
}

.no-planning p {
  color: #777;
  font-style: italic;
  margin: 0;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1b9963;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #777;
  margin: 0;
}

/* Tabla desktop */
.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.desktop-table {
  display: block;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  white-space: nowrap;
}

/* Vista de tarjetas móvil */
.mobile-cards {
  display: none;
  padding: 1rem;
  gap: 1rem;
  flex-direction: column;
}

.planning-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.card-id {
  font-weight: 600;
  color: #333;
}

.card-content {
  padding: 1rem;
}

.card-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  color: #333;
  text-align: right;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.card-actions .action-btn {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Badges */
.badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  line-height: 1;
  font-family: inherit;
}

.badge.en-revision {
  background-color: #ffc107;
  color: #856404;
}

.badge.aceptada {
  background-color: #1b9963;
  color: white;
}

.badge.rechazada {
  background-color: #d9534f;
  color: white;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .planning-container {
    padding: 1rem;
    margin-left: 0;
  }

  .page-title {
    font-size: 1.5rem;
    margin-top: 5.25rem;
    /* Anti-flasheo mobile */
    min-height: 2rem;
    text-align: left;
  }

  .course-subtitle {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    /* Estabilizar layout mobile */
    min-height: 4rem;
  }

  .divider {
    display: none;
  }
  
  .course-info {
    /* Estabilizar tamaño en mobile */
    min-height: 1.2rem;
    padding: 0.2rem 0;
    width: 100%;
    word-break: break-word;
  }

  .form-container {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    min-width: auto;
  }

  .action-btn.create .btn-text {
    display: none;
  }

  .action-btn.create {
    padding: 0.75rem;
    justify-content: center;
  }

  /* Ocultar tabla desktop y mostrar tarjetas móvil */
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .table-section {
    box-shadow: none;
    background: transparent;
  }
}

@media screen and (max-width: 480px) {
  .planning-container {
    padding: 0.75rem;
  }

  .form-container {
    padding: 0.75rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .action-btn {
    width: 100%;
    justify-content: center;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-value {
    text-align: left;
  }
}

/* Mejoras adicionales para tablet */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .planning-container {
    padding: 1.5rem;
  }

  .form-row {
    gap: 1rem;
  }

  .data-table th, .data-table td {
    padding: 0.75rem;
  }
}
</style>