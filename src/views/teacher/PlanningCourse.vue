<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <h1 class="page-title">Planificación del Curso</h1>
      <div class="course-subtitle">{{ courseData?.materia }} | Grado: {{ courseData?.grado }} | Sección: {{ courseData?.seccion }}</div>
      <div class="separator"></div>

      <!-- Formulario para crear planificación -->
      <div class="crud-actions">
        <div class="form-container">
          <form @submit.prevent="submitPlanning" class="planning-form">
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

            <div class="form-actions">
              <button class="action-btn create" type="submit">
                <Plus class="action-icon" />
                Crear planificación
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="planificaciones.length === 0" class="no-planning">
        No hay planificaciones registradas para este curso.
      </div>

      <div class="table-container">
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
                    <button class="action-btn view" @click="goToTasks(plan.id)">
                      <BookOpen class="action-icon" />
                    </button>
                    <button @click="deletePlanning(plan.id)" class="action-btn delete">
                      <Trash class="action-icon" />
                    </button>
                  </div>
              </td>
            </tr>
          </tbody>
        </table>
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
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare, Plus } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'
import { Trash } from 'lucide-vue-next'
const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const confirmDialog = ref(null)
const courseData = ref(null)
const planificaciones = ref([])
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
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
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
  try {
    const data = await planningService.fetchByCourse(courseId)
    planificaciones.value = data
  } catch (error) {
    showNotification('error', 'Error', 'No se pudieron cargar las planificaciones')
    console.error(error)
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
  const course = sessionStorage.getItem('currentCourse')
  if (course) {
    courseData.value = JSON.parse(course)
  }
  await fetchPlanning()
})
</script>

<style scoped>
.planning-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1rem;
}

.course-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

.crud-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-container {
  flex: 1;
}

.planning-form {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
  padding: 0.75rem 1.5rem;
}

.action-btn.create:hover {
  background-color: #158a50;
}

.action-btn.view {
  background-color: #1b9963;
  color: white;
}

.action-btn.view:hover {
  background-color: #158a50;
}

.action-btn.edit {
  background-color: #f0ad4e;
  color: white;
}

.action-btn.edit:hover {
  background-color: #ec971f;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
}

.action-btn.delete:hover {
  background-color: #c9302c;
}

.action-btn.cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.action-btn.cancel:hover {
  background-color: #e6e6e6;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
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

.no-planning {
  text-align: center;
  color: #777;
  font-style: italic;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .planning-container {
    padding: 1rem;
    margin-left: 0;
  }

  .planning-form {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group {
    min-width: auto;
  }

  .data-table th, .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>