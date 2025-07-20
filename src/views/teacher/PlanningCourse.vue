<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-container">
      <h1 class="page-title">Planificación del Curso</h1>
      <div class="course-subtitle">{{ courseData?.materia }} | Grado: {{ courseData?.grado }} | Sección: {{ courseData?.seccion }}</div>
      <div class="separator"></div>

      <!-- Formulario para crear planificación -->
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

        <button class="btn primary" type="submit">
            {{ isEditing ? 'Actualizar planificación' : 'Crear planificación' }}
        </button>
        <button v-if="isEditing" @click="cancelEdit" type="button" class="btn secondary">
          Cancelar
        </button>
      </form>

      <div v-if="planificaciones.length === 0" class="no-planning">
        No hay planificaciones registradas para este curso.
      </div>

      <table v-else class="planning-table">
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
            <td>
               <div class="action-group">
                  <button class="action-btn add" @click="goToTasks(plan.id)">Agregar tareas</button>
                  <button @click="editPlanning(plan)" class="action-btn edit">
                    <Edit class="action-icon" />
                  </button>
                  <button @click="deletePlanning(plan.id)" class="action-btn delete">
                    <Trash class="action-icon" />
                  </button>
                </div>
            </td>
          </tr>
        </tbody>
      </table>
    </main>

    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import planningService from '@/services/planningService'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'
import { Edit, Trash } from 'lucide-vue-next'
const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
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
const isEditing = ref(false)
const editingId = ref(null)
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
    if (isEditing.value) {
      await planningService.update(courseId, editingId.value, {
        mes: trimestre.value,
        ciclo_escolar: ciclo.value
      })
      showNotification('success', 'Actualizado', 'Planificación actualizada')
    } else {
      await planningService.create(courseId, { 
        mes: trimestre.value,
        ciclo_escolar: ciclo.value
      })
      showNotification('success', 'Creado', 'Planificación creada')
    }
    trimestre.value = ''
    ciclo.value = ''
    isEditing.value = false
    editingId.value = null
    await fetchPlanning()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo guardar la planificación')
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
const editPlanning = (plan) => {
  trimestre.value = plan.mes
  ciclo.value = plan.ciclo_escolar
  editingId.value = plan.id
  isEditing.value = true
}

const cancelEdit = () => {
  trimestre.value = ''
  ciclo.value = ''
  isEditing.value = false
  editingId.value = null
}
const deletePlanning = async (planId) => {
  if (!confirm('¿Estás seguro de eliminar esta planificación?')) return
  try {
    await planningService.delete(courseId, planId)
    planificaciones.value = planificaciones.value.filter(p => p.id !== planId)
    showNotification('success', 'Eliminado', 'Planificación eliminada')
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
  padding: 2rem;
  margin-left: 150px; /* Compensar el sidebar */
  margin-right: 2rem; /* Margen derecho para balance */
  width: calc(100vw - 170px); /* Usar todo el espacio disponible */
  box-sizing: border-box;
}
.page-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}
.course-subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}
.separator {
  height: 1px;
  background-color: #eee;
  margin: 1.5rem 0;
}
.planning-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  width: 250px;
  padding-top: 0.5rem;
}
.form-input {
  padding: 8px 10px;
  margin-top: 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}
.form-actions {
  align-self: flex-end; 
}
.planning-table {
  width: 100%;
  border-collapse: collapse;
}
.planning-table th, .planning-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
.planning-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.badge {
  padding: 6px 12px;
  border-radius: 6px; 
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  line-height: 1;
  font-family: inherit;
}

.badge.en-revision {
  background-color: #f9e723;
  color: #333;
}

.badge.aceptada {
  background-color: #5cc30d;
  color: white;
}

.badge.rechazada {
  background-color: #f00b0b;
  color: white;
}
.btn {
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-right: 8px;
  cursor: pointer;
}
.btn.primary {
  background-color: #1b9963;
  margin-top: 20px;
  height: 40px;
  color: white;
}
.btn.danger {
  background-color: #f44336;
  color: white;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}
.action-icon {
  width: 18px;
  height: 18px;
}
.action-btn.add {
  background-color:  #70c873;; 
  color: white;
  border: none;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  height: 35px;
}
.action-btn.mustard:hover {
  background-color: #469e49;
}
.action-btn.edit {
  background-color: #fd7e14;
  color: white;
  border: none;
}
.action-btn.edit:hover {
  background-color: #e96b00;
}
.action-btn.delete {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
  border: none;
}
.action-btn.delete:hover {
  background-color: #bb2d3b;
}
.action-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap; 
}
</style>