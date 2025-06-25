<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="observations-view-container">
      <h1 class="page-title">Observaciones de {{ studentData?.nombre }} {{ studentData?.apellido }}</h1>
      <div class="course-subtitle">{{ courseData?.materia }} | Grado: {{ courseData?.grado }} | Sección: {{ courseData?.seccion }}</div>
      <div class="separator"></div>

      <div v-if="observations.length === 0" class="no-observations">
        No hay observaciones registradas.
      </div>

      <table v-else class="observations-table">
        <thead>
          <tr>
            <th>Observaciones</th>
            <th>Puntos de Acción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="obs in observations" :key="obs.id">
            <td>
              <textarea 
                v-if="obs.editing" 
                v-model="obs.observaciones_edit" 
                class="form-input"
              ></textarea>
              <span v-else>{{ obs.observaciones }}</span>
            </td>
            <td>
              <textarea 
                v-if="obs.editing" 
                v-model="obs.puntos_de_accion_edit" 
                class="form-input"
              ></textarea>
              <span v-else>{{ obs.puntos_de_accion }}</span>
            </td>
            <td class="actions-cell">
              <template v-if="obs.editing">
                <button @click="saveObservation(obs)" class="btn primary">Guardar</button>
                <button @click="cancelEdit(obs)" class="btn secondary">Cancelar</button>
              </template>
              <template v-else>
                <button @click="editObservation(obs)" class="btn primary">Editar</button>
                <button @click="deleteObservation(obs.id)" class="btn danger">Eliminar</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import observationsService from '@/services/observationsService'
import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const courseData = ref(null)
const studentData = ref(null)
const observations = ref([])

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

const fetchObservations = async () => {
  try {
    console.log('courseId:', route.params.courseId)
    console.log('carnet_estudiante:', route.params.carnet_estudiante)
    const observationsData = await observationsService.fetchObservations(
      route.params.courseId,
      route.params.carnet_estudiante
    )
    // Agregamos propiedades para el modo edición
    observations.value = observationsData.map(obs => ({
      id: obs.id,
      carnet_estudiante: obs.carnet_estudiante,
      id_curso: obs.id_curso,
      observaciones: obs.observaciones,
      puntos_de_accion: obs.puntos_de_accion,
      id_calificacion: obs.id_calificacion,
      editing: false,
      observaciones_edit: obs.observaciones,
      puntos_de_accion_edit: obs.puntos_de_accion
    }))

  } catch (error) {
    console.error('Error fetching observations:', {
      error: error.message,
      response: error.response?.data
    })
    observations.value = []
    alert('Error al obtener las observaciones')
  }
}

const editObservation = (obs) => {
  obs.editing = true
  obs.observaciones_edit = obs.observaciones
  obs.puntos_de_accion_edit = obs.puntos_de_accion
}

const cancelEdit = (obs) => {
  obs.editing = false
}

const saveObservation = async (obs) => {
  try {
    await observationsService.updateObservation(obs.id, {
      observaciones: obs.observaciones_edit, 
      puntos_de_accion: obs.puntos_de_accion_edit,
      id_calificacion: obs.id_calificacion 
    })
    
    await fetchObservations();
    
    alert('Observación actualizada correctamente')
  } catch (error) {
    alert('Error al actualizar la observación')
    console.error(error)
  }
}

const deleteObservation = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta observación?')) return

  try {
    await observationsService.deleteObservation(id)
    observations.value = observations.value.filter(obs => obs.id !== id)
    alert('Observación eliminada correctamente')
  } catch (error) {
    alert('Error al eliminar observación')
    console.error(error)
  }
}

onMounted(async () => {
  const student = sessionStorage.getItem('studentData')
  if (student) {
    studentData.value = JSON.parse(student)
  }

  const course = sessionStorage.getItem('currentCourse')
  if (course) {
    courseData.value = JSON.parse(course)
  }

  await fetchObservations()
})
</script>

<style scoped>
.observations-view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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

.no-observations {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  text-align: center;
  color: #666;
}

.observations-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.observations-table th, .observations-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.observations-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.observations-table tr:hover {
  background-color: #f5f5f5;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.actions-cell {
  white-space: nowrap;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 8px;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn.danger {
  background-color: #f44336;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
</style>