<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="inscripciones-management">
      <!-- Header con título -->
      <h1 class="text-page-title">Gestión de Inscripciones</h1>
      <div class="separator"></div>

      <!-- Acciones principales -->
      <div class="crud-actions">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <button 
            class="action-btn create"
            @click="showUploadModal = true"
            :disabled="loading"
          >
            <Upload class="action-icon" />
            <span class="btn-text">Carga Masiva</span>
          </button>
          <button 
            class="action-btn create"
            @click="openCreateModal"
            :disabled="loading"
          >
            <Plus class="action-icon" />
            <span class="btn-text">Nueva Inscripción</span>
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filters-section">
        <div class="search-container">
          <Search class="search-icon" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por carnet, nombre o apellido..."
            class="search-input"
          />
          <button v-if="searchTerm" @click="resetFilters" class="clear-search-btn">
            <X class="clear-icon" />
          </button>
        </div>
        
        <select v-model="statusFilter" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="inscrito">Inscrito</option>
          <option value="estudiante_activo">Estudiante Activo</option>
        </select>
        
        <select v-model="gradeFilter" class="filter-select">
          <option value="">Todos los grados</option>
          <option 
            v-for="grade in gradosYSecciones" 
            :key="grade.id_grado_seccion"
            :value="grade.id_grado_seccion"
          >
            {{ grade.display_name }}
          </option>
        </select>

        <button class="clear-filters-btn" @click="resetFilters">
          <X class="clear-icon" />
        </button>
      </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-section" v-if="statistics">
      <div class="stat-card">
        <div class="stat-icon inscrito">
          <Clock class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.inscritos }}</div>
          <div class="stat-label">Inscritos</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon activo">
          <UserCheck class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.activos }}</div>
          <div class="stat-label">Estudiantes Activos</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon total">
          <Users class="stat-icon-svg" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
    </div>

    <!-- Tabla de inscripciones -->
    <div class="table-section">
      <div class="table-header">
        <h3>
          <List class="section-icon" />
          Lista de Inscripciones
          <span class="count" v-if="filteredInscripciones.length">
            ({{ filteredInscripciones.length }})
          </span>
        </h3>
      </div>
      
      <div class="table-container">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando inscripciones...</p>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="filteredInscripciones.length === 0" class="empty-state">
          <Inbox class="empty-icon" />
          <h3>No hay inscripciones</h3>
          <p v-if="searchTerm || statusFilter || gradeFilter">
            No se encontraron inscripciones con los filtros aplicados.
          </p>
          <p v-else>
            Aún no hay inscripciones registradas. Crea la primera o carga un archivo Excel.
          </p>
        </div>
        
        <!-- Tabla con datos -->
        <table v-else class="inscripciones-table">
          <thead>
            <tr>
              <th @click="sortBy('carnet')" class="sortable">
                Carnet
                <ArrowUpDown class="sort-icon" />
              </th>
              <th @click="sortBy('nombre')" class="sortable">
                Nombre
                <ArrowUpDown class="sort-icon" />
              </th>
              <th @click="sortBy('apellido')" class="sortable">
                Apellido
                <ArrowUpDown class="sort-icon" />
              </th>
              <th>Grado - Sección</th>
              <th>SIRE</th>
              <th @click="sortBy('estado_inscripcion')" class="sortable">
                Estado
                <ArrowUpDown class="sort-icon" />
              </th>
              <th @click="sortBy('fecha_inscripcion')" class="sortable">
                Fecha Inscripción
                <ArrowUpDown class="sort-icon" />
              </th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="inscripcion in paginatedInscripciones" 
              :key="inscripcion.id_inscripcion"
              class="inscripcion-row"
            >
              <td class="carnet">{{ inscripcion.carnet }}</td>
              <td class="nombre">{{ inscripcion.nombre }}</td>
              <td class="apellido">{{ inscripcion.apellido }}</td>
              <td class="grado-seccion">
                {{ inscripcion.grado_seccion_display || 'No asignado' }}
              </td>
              <td class="sire">
                <span v-if="inscripcion.sire" class="sire-code">
                  {{ inscripcion.sire }}
                </span>
                <span v-else class="no-data">-</span>
              </td>
              <td class="estado">
                <span 
                  class="status-badge" 
                  :class="inscripcion.estado_inscripcion"
                >
                  {{ getStatusText(inscripcion.estado_inscripcion) }}
                </span>
              </td>
              <td class="fecha">
                {{ formatDate(inscripcion.fecha_inscripcion) }}
              </td>
              <td class="actions">
                <div class="action-buttons">
                  <button
                    class="btn-icon btn-view"
                    @click="viewInscripcion(inscripcion)"
                    title="Ver detalles"
                  >
                    <Eye class="action-icon" />
                  </button>
                  
                  <button
                    class="btn-icon btn-edit"
                    @click="editInscripcion(inscripcion)"
                    title="Editar"
                    :disabled="inscripcion.estado_inscripcion === 'estudiante_activo'"
                  >
                    <Edit class="action-icon" />
                  </button>
                  
                  <button
                    v-if="inscripcion.estado_inscripcion === 'inscrito'"
                    class="btn-icon btn-activate"
                    @click="activateStudent(inscripcion)"
                    title="Activar como estudiante"
                  >
                    <UserCheck class="action-icon" />
                  </button>
                  
                  <button
                    class="btn-icon btn-delete"
                    @click="deleteInscripcion(inscripcion)"
                    title="Eliminar"
                    :disabled="inscripcion.estado_inscripcion === 'estudiante_activo'"
                  >
                    <Trash class="action-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="btn-page"
            @click="currentPage = 1"
            :disabled="currentPage === 1"
          >
            <ChevronsLeft class="page-icon" />
          </button>
          
          <button 
            class="btn-page"
            @click="currentPage--"
            :disabled="currentPage === 1"
          >
            <ChevronLeft class="page-icon" />
          </button>
          
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          
          <button 
            class="btn-page"
            @click="currentPage++"
            :disabled="currentPage === totalPages"
          >
            <ChevronRight class="page-icon" />
          </button>
          
          <button 
            class="btn-page"
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
          >
            <ChevronsRight class="page-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar inscripción -->
    <InscripcionModal
      v-if="showModal"
      :inscripcion="selectedInscripcion"
      :grados-y-secciones="gradosYSecciones"
      :is-editing="isEditing"
      @close="closeModal"
      @save="handleSaveInscripcion"
    />

    <!-- Modal para subir archivo Excel -->
    <UploadExcelModal
      v-if="showUploadModal"
      :gradosYSecciones="gradosYSecciones"
      @close="showUploadModal = false"
      @upload-success="handleUploadSuccess"
    />

    <!-- Modal de confirmación -->
    <ConfirmationModal
      v-if="showConfirmation"
      :title="confirmationTitle"
      :message="confirmationMessage"
      :confirm-text="confirmationConfirmText"
      :cancel-text="confirmationCancelText"
      :type="confirmationType"
      @confirm="handleConfirmation"
      @cancel="closeConfirmation"
    />

    <!-- Sistema de notificaciones -->
    <NotificationDialog />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/utils/useNotifications'
import { useConfirmation } from '@/composables/useConfirmation'
import { inscripcionesService } from '@/services/inscripcionesService'
import Sidebar from '@/components/Sidebar.vue'
import InscripcionModal from '@/components/superuser/InscripcionModal.vue'
import UploadExcelModal from '@/components/superuser/UploadExcelModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { 
  User, Settings, BookOpen, FileText, Users,
  Plus, Upload, Search, Edit, Trash, CheckCircle, XCircle,
  X, Clock, UserCheck, List, Inbox, ArrowUpDown, Eye,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-vue-next'

const router = useRouter()

// Menu items for superuser
const menuItems = [
  { label: 'Perfil', icon: User, path: '/superuser/profile' },
  { label: 'Gestión de Usuarios', icon: Settings, path: '/superuser' },
  { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' },
  { label: 'Planificaciones', icon: FileText, path: '/superuser/planifications' },
  { label: 'Gestión de Familias', icon: Users, path: '/superuser/families' },
  { label: 'Inscripciones', icon: Users, path: '/superuser/inscripciones' }
]

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}
    // Estado reactivo
    const inscripciones = ref([])
    const gradosYSecciones = ref([])
    const loading = ref(false)
    const searchTerm = ref('')
    const statusFilter = ref('')
    const gradeFilter = ref('')
    const sortField = ref('fecha_inscripcion')
    const sortDirection = ref('desc')
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // Modales
    const showModal = ref(false)
    const showUploadModal = ref(false)
    const selectedInscripcion = ref(null)
    const isEditing = ref(false)
    
    // Composables
    const { showSuccess, showError, showWarning } = useNotifications()
    const { 
      showConfirmation, 
      confirmationTitle, 
      confirmationMessage,
      confirmationConfirmText,
      confirmationCancelText,
      confirmationType,
      showConfirmationDialog,
      closeConfirmation,
      handleConfirmation
    } = useConfirmation()

    // Computed properties
    const statistics = computed(() => {
      if (!inscripciones.value.length) return null
      
      const inscritos = inscripciones.value.filter(i => i.estado_inscripcion === 'inscrito').length
      const activos = inscripciones.value.filter(i => i.estado_inscripcion === 'estudiante_activo').length
      
      return {
        inscritos,
        activos,
        total: inscripciones.value.length
      }
    })

    const filteredInscripciones = computed(() => {
      let filtered = [...inscripciones.value]
      
      // Filtro por búsqueda
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(inscripcion => 
          inscripcion.carnet.toLowerCase().includes(term) ||
          inscripcion.nombre.toLowerCase().includes(term) ||
          inscripcion.apellido.toLowerCase().includes(term)
        )
      }
      
      // Filtro por estado
      if (statusFilter.value) {
        filtered = filtered.filter(inscripcion => 
          inscripcion.estado_inscripcion === statusFilter.value
        )
      }
      
      // Filtro por grado
      if (gradeFilter.value) {
        filtered = filtered.filter(inscripcion => 
          inscripcion.id_grado_seccion === parseInt(gradeFilter.value)
        )
      }
      
      // Ordenamiento
      filtered.sort((a, b) => {
        let aVal = a[sortField.value]
        let bVal = b[sortField.value]
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (sortDirection.value === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
      
      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredInscripciones.value.length / pageSize.value)
    })

    const paginatedInscripciones = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredInscripciones.value.slice(start, end)
    })

    // Métodos
    const loadInscripciones = async () => {
      try {
        loading.value = true
        const response = await inscripcionesService.getInscripciones()
        inscripciones.value = response.data
      } catch (error) {
        console.error('Error al cargar inscripciones:', error)
        showError('Error', 'No se pudieron cargar las inscripciones')
      } finally {
        loading.value = false
      }
    }

    const loadGradosYSecciones = async () => {
      try {
        const response = await inscripcionesService.getGradosYSecciones()
        gradosYSecciones.value = response.data
      } catch (error) {
        console.error('Error al cargar grados y secciones:', error)
        showError('Error', 'No se pudieron cargar los grados y secciones')
      }
    }

    const openCreateModal = () => {
      selectedInscripcion.value = null
      isEditing.value = false
      showModal.value = true
    }

    const editInscripcion = (inscripcion) => {
      selectedInscripcion.value = { ...inscripcion }
      isEditing.value = true
      showModal.value = true
    }

    const viewInscripcion = (inscripcion) => {
      selectedInscripcion.value = { ...inscripcion }
      isEditing.value = false
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedInscripcion.value = null
      isEditing.value = false
    }

    const handleSaveInscripcion = async (inscripcionData) => {
      try {
        loading.value = true
        
        if (isEditing.value) {
          await inscripcionesService.updateInscripcion(
            selectedInscripcion.value.id_inscripcion, 
            inscripcionData
          )
          showSuccess('Éxito', 'Inscripción actualizada exitosamente')
        } else {
          await inscripcionesService.createInscripcion(inscripcionData)
          showSuccess('Éxito', 'Inscripción creada exitosamente')
        }
        
        await loadInscripciones()
        closeModal()
      } catch (error) {
        console.error('Error al guardar inscripción:', error)
        showError(
          'Error',
          error.response?.data?.message || 'Error al guardar la inscripción'
        )
      } finally {
        loading.value = false
      }
    }

    const deleteInscripcion = (inscripcion) => {
      showConfirmationDialog({
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que deseas eliminar la inscripción de ${inscripcion.nombre} ${inscripcion.apellido}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger',
        onConfirm: async () => {
          try {
            loading.value = true
            await inscripcionesService.deleteInscripcion(inscripcion.id_inscripcion)
            await loadInscripciones()
            showSuccess('Éxito', 'Inscripción eliminada exitosamente')
          } catch (error) {
            console.error('Error al eliminar inscripción:', error)
            showError(
              'Error',
              error.response?.data?.message || 'Error al eliminar la inscripción'
            )
          } finally {
            loading.value = false
          }
        }
      })
    }

    const activateStudent = (inscripcion) => {
      showConfirmationDialog({
        title: 'Activar Estudiante',
        message: `¿Confirmas que deseas activar a ${inscripcion.nombre} ${inscripcion.apellido} como estudiante activo?`,
        confirmText: 'Activar',
        cancelText: 'Cancelar',
        type: 'success',
        onConfirm: async () => {
          try {
            loading.value = true
            await inscripcionesService.convertirAEstudiante(inscripcion.id_inscripcion)
            await loadInscripciones()
            showSuccess('Éxito', 'Estudiante activado exitosamente')
          } catch (error) {
            console.error('Error al activar estudiante:', error)
            showError(
              'Error',
              error.response?.data?.message || 'Error al activar el estudiante'
            )
          } finally {
            loading.value = false
          }
        }
      })
    }

    const handleUploadSuccess = async (result) => {
      showUploadModal.value = false
      await loadInscripciones()
      
      const message = `Carga completada: ${result.exitosos.length} inscripciones creadas`
      const errorMessage = result.errores.length > 0 ? `, ${result.errores.length} errores` : ''
      
      if (result.errores.length === 0) {
        showSuccess('Carga Exitosa', message)
      } else {
        showWarning('Carga Completada', message + errorMessage)
      }
    }

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    const resetFilters = () => {
      searchTerm.value = ''
      statusFilter.value = ''
      gradeFilter.value = ''
      currentPage.value = 1
    }

    const getStatusText = (status) => {
      const statusMap = {
        'inscrito': 'Inscrito',
        'estudiante_activo': 'Estudiante Activo',
        'eliminado': 'Eliminado'
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // Watchers
    watch([searchTerm, statusFilter, gradeFilter], () => {
      currentPage.value = 1
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadInscripciones(),
        loadGradosYSecciones()
      ])
    })
</script>

<style scoped>
/* Layout principal */
.layout {
  display: flex;
  min-height: 100vh;
}

.inscripciones-management {
  flex: 1;
  margin-left: 130px; /* Espacio para sidebar en escritorio */
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header y título */
/* Acciones principales */
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
  white-space: nowrap;
}

.action-btn.create {
  background: #1b9963;
  color: #fff;
}

.action-btn.create:hover {
  background: #158a50;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.stat-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.sort-icon {
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
  opacity: 0.6;
}

.page-icon {
  width: 1rem;
  height: 1rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

/* Filtros */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  height: 44px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
}

/* Botón X para limpiar búsqueda */
.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #fee2e2;
}

.clear-icon {
  width: 16px;
  height: 16px;
  color: #dc2626;
}

.filter-select {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  height: 44px;
  min-width: 180px;
  box-sizing: border-box;
}

/* Botón de limpiar filtros */
.clear-filters-btn {
  background: none;
  border: 2px solid #fca5a5;
  color: #dc2626;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-filters-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

/* Estadísticas */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.inscrito {
  background: linear-gradient(135deg, #f6ad55, #ed8936);
}

.stat-icon.activo {
  background: linear-gradient(135deg, #68d391, #38a169);
}

.stat-icon.total {
  background: linear-gradient(135deg, #63b3ed, #3182ce);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

/* Tabla */
.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.table-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 400;
}

.table-container {
  max-height: 600px;
  overflow-y: auto;
}

.inscripciones-table {
  width: 100%;
  border-collapse: collapse;
}

.inscripciones-table th,
.inscripciones-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.inscripciones-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.inscripciones-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.inscripciones-table th.sortable:hover {
  background: #edf2f7;
}

.inscripciones-table th.sortable i {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.inscripcion-row:hover {
  background: #f7fafc;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.inscrito {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.estudiante_activo {
  background: #c6f6d5;
  color: #2f855a;
}

.sire-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.no-data {
  color: #a0aec0;
  font-style: italic;
}

.actions-column {
  width: 150px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.btn-view {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-view:hover {
  background: #cbd5e0;
}

.btn-edit {
  background: #bee3f8;
  color: #2b6cb0;
}

.btn-edit:hover {
  background: #90cdf4;
}

.btn-edit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-activate {
  background: #c6f6d5;
  color: #2f855a;
}

.btn-activate:hover {
  background: #9ae6b4;
}

.btn-delete {
  background: #fed7d7;
  color: #c53030;
}

.btn-delete:hover {
  background: #fbb6ce;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estados especiales */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.loading-state .spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-page {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: #4299e1;
  color: #4299e1;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 1rem;
  font-size: 0.9rem;
  color: #4a5568;
}

/* Botones generales */
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
  white-space: nowrap;
}

.action-btn.create {
  background: #1b9963;
  color: #fff;
}

.action-btn.create:hover {
  background: #158a50;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .inscripciones-management {
    margin-left: 0; /* Remover margen del sidebar en móvil */
    padding: 1rem; /* Padding normalizado */
  }

  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .crud-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    justify-content: center;
  }

  .btn-text {
    display: inline;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    min-width: auto;
  }

  .filter-select {
    min-width: auto;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .table-container {
    overflow-x: auto;
  }

  .inscripciones-table {
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .inscripciones-management {
    padding: 0.75rem;
  }
  
  .text-page-title {
    margin-bottom: 0.8rem;
  }
}
</style>
