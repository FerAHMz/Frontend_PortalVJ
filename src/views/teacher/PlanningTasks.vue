<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planning-tasks-container">
      <h1 class="page-title">Tareas Planificadas</h1>
      <div class="course-subtitle" v-if="planificacion">
        {{ planificacion.mes }} | Ciclo: {{ planificacion.ciclo_escolar }} |
        Estado:
        <span class="badge" :class="planificacion.estado">{{ planificacion.estado }}</span>
       </div>
      <div class="separator"></div>

      <!-- Formulario para agregar tarea (si editable) -->
      <div v-if="planificacion?.estado === 'en revision'" class="crud-actions">
        <form @submit.prevent="handleSubmit" class="task-form">
          <div class="form-group">
            <label>Tema de la tarea</label>
            <input v-model="tema" placeholder="Tema de la tarea" class="form-input" required />
          </div>
          <div class="form-group">
            <label>Puntaje</label>
            <input v-model.number="puntos" type="number" min="0" step="0.5" placeholder="Puntaje" class="form-input" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="action-btn create">
              <Plus class="action-icon" />
              Agregar tarea
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de tareas -->
        <div v-if="tareas.length" class="table-container">
          <table class="data-table">
            <thead>
                <tr>
                <th>#</th>
                <th>Tema</th>
                <th>Puntaje</th>
                <th v-if="planificacion.estado === 'en revision'">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(tarea, index) in tareas" :key="tarea.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <input 
                    v-if="taskBeingEdited?.id === tarea.id" 
                    v-model="inlineEditTema" 
                    class="inline-edit-input" 
                    @keyup.enter="handleSubmit"
                    @keyup.escape="cancelEdit"
                  />
                  <span v-else>{{ tarea.tema_tarea }}</span>
                </td>
                <td>
                  <input 
                    v-if="taskBeingEdited?.id === tarea.id" 
                    v-model.number="inlineEditPuntos" 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    class="inline-edit-input" 
                    @keyup.enter="handleSubmit"
                    @keyup.escape="cancelEdit"
                  />
                  <span v-else>{{ tarea.puntos_tarea }}</span>
                </td>
                <td v-if="planificacion.estado === 'en revision'" class="actions">
                    <div v-if="taskBeingEdited?.id === tarea.id" class="inline-actions">
                      <button @click="handleSubmit" class="action-btn create">
                        <Check class="action-icon" />
                      </button>
                      <button @click="cancelEdit" class="action-btn cancel">
                        <X class="action-icon" />
                      </button>
                    </div>
                    <div v-else class="normal-actions">
                      <button @click="editTask(tarea)" class="action-btn edit">
                        <Edit class="action-icon" />
                      </button>
                      <button @click="deleteTask(tarea.id)" class="action-btn delete">
                        <Trash class="action-icon" />
                      </button>
                    </div>
                </td>
                </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="no-tasks">No hay tareas planificadas.</div>


      <!-- Observaciones del director -->
      <div class="observations-section">
        <h2 class="observations-title"> Observaciones del director</h2>

        <div v-if="observaciones.length">
          <div
            v-for="obs in observaciones"
            :key="obs.id"
            class="observation-card"
          >
            <p class="obs-text"> <strong>{{ obs.observaciones }}</strong></p>
            <p class="obs-meta"> <em>{{ formatDate(obs.fecha) }}</em></p>
          </div>
        </div>

        <div v-else class="no-observations">
          No hay retroalimentación registrada para esta planificación.
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
import { useNotifications } from '@/utils/useNotifications.js'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare, Plus } from 'lucide-vue-next'
import { Edit, Trash, Check, X } from 'lucide-vue-next'
const route = useRoute()
const router = useRouter()
const { showNotification } = useNotifications()
const confirmDialog = ref(null)
const tareas = ref([])
const observaciones = ref([])
const planificacion = ref(null)
const tema = ref('')
const puntos = ref(null)
const courseId = route.params.courseId
const planId = route.params.planId
const isEditing = ref(false)
const taskBeingEdited = ref(null)
const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario de Tareas', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]
const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}
const fetchPlanningData = async () => {
  try {
    planificacion.value = await planningService.fetchById(courseId, planId)
    tareas.value = await planningService.fetchTasks(courseId, planId)
    observaciones.value = await planningService.fetchObservations(courseId, planId)
    console.log('Observaciones:', observaciones.value) 
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo cargar la planificación')
    console.error(error)
  }
}
const handleSubmit = async () => {
  try {
    if (isEditing.value && taskBeingEdited.value) {
      // EDITAR usando variables inline
      if (!inlineEditTema.value || inlineEditPuntos.value === null) return
      await planningService.updateTask(courseId, planId, taskBeingEdited.value.id, {
        tema_tarea: inlineEditTema.value,
        puntos_tarea: inlineEditPuntos.value
      })
      showNotification('success', 'Éxito', 'Tarea actualizada correctamente')
      // Reset inline edit
      isEditing.value = false
      taskBeingEdited.value = null
      inlineEditTema.value = ''
      inlineEditPuntos.value = null
    } else {
      // CREAR NUEVA usando variables del formulario
      if (!tema.value || puntos.value === null) return
      await planningService.createTask(courseId, planId, {
        tema_tarea: tema.value,
        puntos_tarea: puntos.value
      })
      showNotification('success', 'Éxito', 'Tarea agregada correctamente')
      // Reset form
      tema.value = ''
      puntos.value = null
    }
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo guardar la tarea')
    console.error(error)
  }
}
const deleteTask = async (taskId) => {
  const confirmed = await confirmDialog.value.show({
    title: 'Eliminar tarea',
    message: '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar'
  })
  
  if (!confirmed) return
  
  try {
    await planningService.deleteTask(courseId, planId, taskId)
    showNotification('success', 'Éxito', 'Tarea eliminada correctamente')
    await fetchPlanningData()
  } catch (error) {
    showNotification('error', 'Error', 'No se pudo eliminar la tarea')
    console.error(error)
  }
}
// Variables separadas para edición inline
const inlineEditTema = ref('')
const inlineEditPuntos = ref(null)

const editTask = (tarea) => {
  // SOLO preparar para edición inline, NO llenar el formulario superior
  taskBeingEdited.value = tarea
  isEditing.value = true
  // Llenar los valores temporales para la edición inline (NO afecta el formulario)
  inlineEditTema.value = tarea.tema_tarea
  inlineEditPuntos.value = tarea.puntos_tarea
}
const cancelEdit = () => {
  isEditing.value = false
  taskBeingEdited.value = null
  // Limpiar solo las variables de edición inline
  inlineEditTema.value = ''
  inlineEditPuntos.value = null
}
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}
onMounted(() => {
  fetchPlanningData()
  console.log('Curso:', courseId)
  console.log('Planificación:', planId)
})
</script>

<style scoped>
.planning-tasks-container {
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

.task-form {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  flex: 1;
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
  margin-bottom: 2rem;
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

.no-tasks {
  text-align: center;
  color: #777;
  font-style: italic;
  margin: 2rem 0;
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

@media (max-width: 768px) {
  .planning-tasks-container {
    padding: 1rem;
    margin-left: 0;
  }

  .task-form {
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
.observations-box {
  background-color: #f1f1f1;
  padding: 1.5rem;
  border-radius: 8px;
}
.observations-box h2 {
  margin-bottom: 1rem;
  color: #333;
}
.obs-text {
  margin: 0;
  color: #444;
}
.observations-title {
  padding-bottom: 1rem;
}
.obs-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}
.task-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  min-width: 600px; /* Mínimo ancho para evitar compresión excesiva */
}

.task-table th,
.task-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
  word-wrap: break-word;
}

.task-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Responsive table */
@media screen and (max-width: 768px) {
  .task-table {
    font-size: 0.9rem;
    min-width: auto;
  }
  
  .task-table th,
  .task-table td {
    padding: 8px;
  }
}
.btn.small {
  font-size: 0.8rem;
  padding: 4px 8px;
  margin-right: 4px;
}
.observations-section {
  margin-top: 2rem;
  background: #fdfdfd;
  padding: 1.3rem 1rem;
  border-left: 5px solid #4a90e2;
  border-radius: 6px;
}
.observation-card {
  margin-bottom: 1rem;
  padding: 1rem 1rem;
  background-color: #eef6fc;
  border-left: 4px solid #2c82c9;
  border-radius: 4px;
}
.no-observations {
  font-style: italic;
  color: #777;
  padding: 0.75rem;
}
.obs-text {
  font-size: 1rem;
  margin: 0;
  padding-block: 0.3rem;
}
.obs-meta {
  font-size: 0.85rem;
  color: #555;
  padding-block: 0.3rem;
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
  font-size: 0.9rem;
}
.action-icon {
  width: 18px;
  height: 18px;
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

/* Inline editing styles */
.inline-edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #1b9963;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #f8fff8;
}

.inline-edit-input:focus {
  outline: none;
  border-color: #158a50;
  background-color: #fff;
}

.inline-actions {
  display: flex;
  gap: 0.25rem;
}

.inline-actions .action-btn {
  padding: 0.75rem 1.5rem;
}

.normal-actions {
  display: flex;
  gap: 0.25rem;
}

.normal-actions .action-btn {
  padding: 0.5rem;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
  padding: 0.75rem 1.5rem;
}

.action-btn.create:hover {
  background-color: #158a50;
}

.action-btn.cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.action-btn.cancel:hover {
  background-color: #e6e6e6;
}
</style>