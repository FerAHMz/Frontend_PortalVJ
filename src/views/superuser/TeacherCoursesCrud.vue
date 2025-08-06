<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="crud-container">
      <!-- Título y separador -->
      <h1 class="page-title">Gestión de Cursos ‑ Profesores</h1>
      <div class="separator"></div>

      <!-- Acciones: botón + búsqueda -->
      <div class="crud-actions">
        <button @click="openCreateModal" class="action-btn create">
          <Plus class="action-icon" />
          <span class="btn-text">Asignar Curso</span>
        </button>

        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar..."
            class="search-input"
          />
          <Search class="search-icon" />
        </div>
      </div>

      <!-- Tabla (sólo escritorio/tablet) -->
      <div class="table-container desktop-table">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.key">
                {{ header.title }}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.nombre_maestro }} {{ item.apellido_maestro }}</td>
              <td>{{ item.materia }}</td>
              <td>{{ item.grado }}</td>
              <td>{{ item.seccion }}</td>
              <td class="actions">
                <button
                  @click="confirmDelete(item)"
                  class="action-btn delete"
                >
                  <Trash class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tarjetas (sólo móvil) -->
      <div class="mobile-cards">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="course-card"
        >
          <div class="card-header">
            <h3 class="course-title">
              {{ item.materia }}
            </h3>
            <span class="course-id">#{{ item.id }}</span>
          </div>

          <div class="card-body">
            <p><strong>Profesor:</strong> {{ item.nombre_maestro }} {{ item.apellido_maestro }}</p>
            <p><strong>Grado:</strong> {{ item.grado }}</p>
            <p><strong>Sección:</strong> {{ item.seccion }}</p>
          </div>

          <div class="card-actions">
            <button
              @click="confirmDelete(item)"
              class="action-btn delete"
            >
              <Trash class="action-icon" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de creación/edición -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>Asignar Curso a Profesor</h2>
          <form @submit.prevent="saveItem">
            <div class="form-group">
              <label for="maestro">Profesor</label>
              <select
                v-model="formData.id_maestro"
                id="maestro"
                class="form-input"
                required
              >
                <option
                  v-for="t in teachers"
                  :key="t.id"
                  :value="t.id"
                >
                  {{ t.nombre }} {{ t.apellido }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="materia">Materia</label>
              <select
                v-model="formData.id_materia"
                id="materia"
                class="form-input"
                required
              >
                <option
                  v-for="s in subjects"
                  :key="s.id"
                  :value="s.id"
                >
                  {{ s.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="grado">Grado</label>
              <select
                v-model="formData.id_grado"
                id="grado"
                class="form-input"
                required
              >
                <option
                  v-for="g in grades"
                  :key="g.id"
                  :value="g.id"
                >
                  {{ g.grado }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="seccion">Sección</label>
              <select
                v-model="formData.id_seccion"
                id="seccion"
                class="form-input"
                required
              >
                <option
                  v-for="sec in sections"
                  :key="sec.id"
                  :value="sec.id"
                >
                  {{ sec.seccion }}
                </option>
              </select>
            </div>

            <div class="modal-actions">
              <button
                type="button"
                @click="closeModal"
                class="modal-btn cancel"
              >
                Cancelar
              </button>
              <button type="submit" class="modal-btn save">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Confirmación y notificaciones -->
      <ModalConfirmacion
        v-if="showConfirmModal"
        :visible="showConfirmModal"
        title="Confirmar Eliminación"
        message="¿Estás seguro de eliminar este curso?"
        confirm-text="Eliminar"
        cancel-text="Cancelar"
        confirm-button-class="delete"
        :loading="deleting"
        @confirm="deleteItem"
        @cancel="showConfirmModal = false"
      />
      <NotificationDialog />
    </main>
  </div>
</template>

<script setup>

/*  Importaciones y configuración  */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import {
  Settings, Plus, Search, Trash, BookOpen, User, FileText, Users, UserPlus
} from 'lucide-vue-next'
import ModalConfirmacion from '@/components/dialogs/ModalConfirmation.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { courseService } from '@/services/courseService'
import { useNotifications } from '@/utils/useNotifications'

const { showNotification } = useNotifications()
const router = useRouter()

/*  Navegación lateral  */
const menuItems = [
  { label: 'Perfil',               icon: User,     path: '/superuser/profile' },
  { label: 'Gestión de Usuarios',  icon: Settings, path: '/superuser' },
  { label: 'Gestión de Cursos',    icon: BookOpen, path: '/superuser/teacher-courses' },
  { label: 'Planificaciones',      icon: FileText, path: '/superuser/planifications' },
  { label: 'Gestión de Familias',  icon: Users,    path: '/superuser/families' },
  { label: 'Inscripciones',        icon: UserPlus, path: '/superuser/inscripciones' }
]

const handleItemClick = item => {
  if (item.path) router.push(item.path)
}

/*  Encabezados de tabla  */
const headers = [
  { key: 'id',      title: 'ID' },
  { key: 'maestro', title: 'Profesor' },
  { key: 'materia', title: 'Materia' },
  { key: 'grado',   title: 'Grado' },
  { key: 'seccion', title: 'Sección' }
]

/*  Estado reactivo   */
const items           = ref([])
const teachers        = ref([])
const subjects        = ref([])
const grades          = ref([])
const sections        = ref([])
const searchQuery     = ref('')
const showModal       = ref(false)
const showConfirmModal= ref(false)
const itemToDelete    = ref(null)
const deleting        = ref(false)

const formData = ref({
  id_maestro : '',
  id_materia : '',
  id_grado   : '',
  id_seccion : ''
})

/*  Filtros  */
const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const data = q
    ? items.value.filter(it =>
        Object.values(it).some(v =>
          String(v).toLowerCase().includes(q)
        )
      )
    : items.value
  return data.sort((a, b) => a.id - b.id)
})


/*  Peticiones API   */
const fetchCourses  = async () => {
  try {
    const { data } = await courseService.getCourses()
    items.value = data
  } catch (e) {
    console.error('Error al obtener cursos:', e)
    showNotification('Error al cargar los cursos', 'error')
  }
}

const fetchTeachers = async () => {
  try {
    const { data } = await courseService.getTeachers()
    teachers.value = data
  } catch (e) { console.error('Error al obtener profesores:', e) }
}

const fetchSubjects = async () => {
  try {
    const { data } = await courseService.getSubjects()
    subjects.value = data
  } catch (e) { console.error('Error al obtener materias:', e) }
}

const fetchGrades   = async () => {
  try {
    const { data } = await courseService.getGrades()
    grades.value = data
  } catch (e) { console.error('Error al obtener grados:', e) }
}

const fetchSections = async () => {
  try {
    const { data } = await courseService.getSections()
    sections.value = data
  } catch (e) { console.error('Error al obtener secciones:', e) }
}

/*  CRUD  */
const openCreateModal = () => {
  formData.value = {
    id_maestro : '',
    id_materia : '',
    id_grado   : '',
    id_seccion : ''
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const saveItem = async () => {
  try {
    // Crear (o recuperar) grado_seccion
    const gradoSeccion = {
      id_grado  : formData.value.id_grado,
      id_seccion: formData.value.id_seccion
    }
    const { data: gs } = await courseService.createGradoSeccion(gradoSeccion)

    // Crear curso
    const courseData = {
      id_maestro       : formData.value.id_maestro,
      id_materia       : formData.value.id_materia,
      id_grado_seccion : gs.id
    }
    await courseService.createCourse(courseData)
    await fetchCourses()
    closeModal()
    showNotification('Curso asignado exitosamente', 'success')
  } catch (e) {
    console.error('Error al guardar curso:', e)
    showNotification('Error al asignar el curso', 'error')
  }
}

const confirmDelete = item => {
  itemToDelete.value = item
  showConfirmModal.value = true
}

const deleteItem = async () => {
  try {
    deleting.value = true
    await courseService.deleteCourse(itemToDelete.value.id)
    await fetchCourses()
    showConfirmModal.value = false
    showNotification('Curso eliminado exitosamente', 'success')
  } catch (e) {
    console.error('Error eliminando curso:', e)
    showNotification('Error al eliminar el curso', 'error')
  } finally {
    deleting.value = false
  }
}

/*  Montaje  */
onMounted(() => {
  fetchCourses()
  fetchTeachers()
  fetchSubjects()
  fetchGrades()
  fetchSections()
})
</script>

<style scoped>
/*  Estructura base  */
.layout {
  display: flex;
  min-height: 100vh;
}

.crud-container {
  flex: 1;
  padding: 2rem;
  max-width: 100%;
  overflow-x: hidden;
}

/* Evita que el título quede tapado por el sidebar fijo */
.page-title {
  margin-top: 3.5rem;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: bold;
  color: #000;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/*  Acciones   */
.crud-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.create {
  background: #1b9963;
  color: #fff;
}

.action-btn.create:hover { background: #158a50; }

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Botón eliminar */
.action-btn.delete {
  background: #d9534f;
  color: #fff;
  padding: 0.5rem;
  border-radius: 6px;
}

/*  Buscador  */
.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #666;
}

/*  Tabla (escritorio)  */
.table-container {
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.data-table tr:hover { background: #f9f9f9; }

.actions { display: flex; gap: 0.5rem; }

/*  Tarjetas (móvil)  */
.mobile-cards      { display: none; }
.course-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.course-title { font-weight: 600; margin: 0; }
.course-id    {
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
}
.card-body  { font-size: 0.9rem; line-height: 1.4; margin-bottom: 0.75rem; }
.card-actions {
  display: flex;
  justify-content: flex-end;
}

/*  Modal   */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-input{
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.modal-btn.cancel {
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.modal-btn.save {
  background: #1b9963;
  color: #fff;
}

/*  Breakpoints   */

/*  Tablets ≤ 1023 px */
@media (max-width: 1023px) {
  .crud-container { padding: 1.5rem; }
  .page-title     { font-size: 1.75rem; }
  .data-table th,
  .data-table td  { padding: 0.75rem; font-size: 0.95rem; }
}

/*  Portátiles pequeños/Tablets ≤ 991 px */
@media (max-width: 991px) {
  .crud-actions { flex-direction: column; align-items: stretch; }
  .search-container { max-width: 100%; }
  .action-btn.create { width: auto; justify-content: center; }
}

/*  Móviles ≤ 767 px */
@media (max-width: 767px) {
  .crud-container { padding: 0.75rem; }
  .page-title     { font-size: 1.5rem; margin-top: 4.75rem; margin-bottom: 0.75rem; }
  .separator      { margin-bottom: 1rem; }

  /* Ocultar tabla y mostrar tarjetas */
  .desktop-table  { display: none; }
  .mobile-cards   { display: block; }

  /* Botón “Asignar Curso” → icono circular  */
  .btn-text       { display: none; }
  .action-btn.create {
    width: 48px; height: 48px;
    padding: 0;
    border-radius: 50%;
    aspect-ratio: 1;
  }

  /* Modal ajustes */
  .modal-content  {
    padding: 1.5rem;
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
  .modal-actions  {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  .modal-btn      { width: 100%; text-align: center; }
}

/*  Móviles muy pequeños ≤ 480 px */
@media (max-width: 480px) {
  .page-title   { font-size: 1.25rem; }
  .search-input,
  .form-input   { font-size: 16px; } 
  .course-card  { padding: 1rem; }
  .card-body p  { margin: 0.25rem 0; }
}
</style>
