<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick"/>
      <main class="crud-container">
        <h1 class="page-title">Gestión de Cursos - Profesores</h1>
        <div class="separator"></div>
        
        <div class="crud-actions">
          <button @click="openCreateModal" class="action-btn create">
            <Plus class="action-icon" /> Asignar Curso
          </button>
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar..." 
              class="search-input"
            >
            <Search class="search-icon" />
          </div>
        </div>
        
        <div class="table-container">
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
                  <button @click="confirmDelete(item)" class="action-btn delete">
                    <Trash class="action-icon" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Modal para asignar curso -->
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
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.nombre }} {{ teacher.apellido }}
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
                  <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                    {{ subject.nombre }}
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
                  <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                    {{ grade.grado }}
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
                  <option v-for="section in sections" :key="section.id" :value="section.id">
                    {{ section.seccion }}
                  </option>
                </select>
              </div>
  
              <div class="modal-actions">
                <button type="button" @click="closeModal" class="modal-btn cancel">
                  Cancelar
                </button>
                <button type="submit" class="modal-btn save">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
        
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
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import { Settings, Plus, Search, Trash, BookOpen } from 'lucide-vue-next'
  import ModalConfirmacion from '@/components/dialogs/ModalConfirmation.vue'
  import { courseService } from '@/services/courseService'
  
  const router = useRouter()
  
  const handleItemClick = (item) => {
    if (item.path) {
      router.push(item.path)
    }
  }
  
  const menuItems = [
    { label: 'Gestión de Usuarios', icon: Settings, path: '/superuser' },
    { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' }
    ]
  
  const headers = [
    { key: 'id', title: 'ID' },
    { key: 'maestro', title: 'Profesor' },
    { key: 'materia', title: 'Materia' },
    { key: 'grado', title: 'Grado' },
    { key: 'seccion', title: 'Sección' }
  ]
  
  const items = ref([])
  const teachers = ref([])
  const subjects = ref([])
  const grades = ref([])
  const sections = ref([])
  const searchQuery = ref('')
  const showModal = ref(false)
  const showConfirmModal = ref(false)
  const itemToDelete = ref(null)
  const formData = ref({
    id_maestro: '',
    id_materia: '',
    id_grado: '',
    id_seccion: '',
    id_grado_seccion: ''
  })
  const deleting = ref(false)
  
  const filteredItems = computed(() => {
    let result = items.value;
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = items.value.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }
    return result.sort((a, b) => a.id - b.id);
  })
  
  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses()
      items.value = response.data
    } catch (error) {
      console.error('Error al obtener cursos:', error)
      alert('Error al cargar los cursos')
    }
  }
  
  const fetchTeachers = async () => {
    try {
      const response = await courseService.getTeachers()
      teachers.value = response.data
    } catch (error) {
      console.error('Error al obtener profesores:', error)
    }
  }
  
  const fetchSubjects = async () => {
    try {
      const response = await courseService.getSubjects()
      subjects.value = response.data
    } catch (error) {
      console.error('Error al obtener materias:', error)
    }
  }
  
  const fetchGrades = async () => {
    try {
      const response = await courseService.getGrades()
      grades.value = response.data
    } catch (error) {
      console.error('Error al obtener grados:', error)
    }
  }
  
  const fetchSections = async () => {
    try {
      const response = await courseService.getSections()
      sections.value = response.data
    } catch (error) {
      console.error('Error al obtener secciones:', error)
    }
  }
  
  const openCreateModal = () => {
    formData.value = {
      id_maestro: '',
      id_materia: '',
      id_grado: '',
      id_seccion: ''
    }
    showModal.value = true
  }
  
  const closeModal = () => {
    showModal.value = false
  }
  
  const saveItem = async () => {
    try {
      // Primero crear el registro en grado_seccion
      const gradoSeccionData = {
        id_grado: formData.value.id_grado,
        id_seccion: formData.value.id_seccion
      }
      
      // Hacer la petición para crear o obtener el id_grado_seccion
      const gradoSeccionResponse = await courseService.createGradoSeccion(gradoSeccionData)
      
      // Crear el objeto de datos para el curso
      const courseData = {
        id_maestro: formData.value.id_maestro,
        id_materia: formData.value.id_materia,
        id_grado_seccion: gradoSeccionResponse.data.id // Usar el ID obtenido
      }
      
      await courseService.createCourse(courseData)
      await fetchCourses()
      closeModal()
      alert('Curso asignado exitosamente')
    } catch (error) {
      console.error('Error al guardar curso:', error)
      alert('Error al asignar el curso')
    }
  }
  
  const confirmDelete = (item) => {
    itemToDelete.value = item
    showConfirmModal.value = true
  }
  
  const deleteItem = async () => {
    try {
      deleting.value = true
      await courseService.deleteCourse(itemToDelete.value.id)
      await fetchCourses()
      showConfirmModal.value = false
      alert('Curso eliminado exitosamente')
    } catch (error) {
      console.error('Error eliminando curso:', error)
      alert('Error al eliminar el curso')
    } finally {
      deleting.value = false
    }
  }
  
  onMounted(() => {
    fetchCourses()
    fetchTeachers()
    fetchSubjects()
    fetchGrades()
    fetchSections()
  })
  </script>
  
  <style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
  }
  
  .crud-container {
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
  
  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
  }
  
  .crud-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 1rem;
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
  }
  
  .action-btn.create {
    background-color: #1b9963;
    color: white;
    border: none;
  }
  
  .action-btn.create:hover {
    background-color: #158a50;
  }
  
  .action-icon {
    width: 18px;
    height: 18px;
  }
  
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
  
  .action-btn.delete {
    background-color: #d9534f;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 6px;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
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
  }
  
  .modal-btn.cancel {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
  }
  
  .modal-btn.save {
    background-color: #1b9963;
    color: white;
    border: none;
  }
  
  @media (max-width: 768px) {
    .crud-container {
      padding: 1rem;
      margin-left: 0;
    }
    
    .crud-actions {
      flex-direction: column;
    }
    
    .search-container {
      max-width: 100%;
    }
    
    .data-table th, .data-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.9rem;
    }
  }
  </style>