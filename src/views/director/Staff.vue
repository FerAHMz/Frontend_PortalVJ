<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="staff-container">
      <h1 class="text-page-title">Gestión de Personal</h1>
      <div class="separator"></div>

      <!-- Acciones (botón + buscador + filtros) -->
      <div class="staff-actions">
        <button @click="openCreateModal" class="action-btn create">
          <Plus class="action-icon" />
          <span class="btn-text">Nuevo Personal</span>
        </button>

        <div class="filters-container">
          <select v-model="roleFilter" class="filter-select">
            <option value="">Todos los roles</option>
            <option value="maestro">Maestros</option>
            <option value="director">Directores</option>
          </select>

          <div class="search-container">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar personal..."
              class="search-input"
            />
            <Search class="search-icon" />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando personal...</p>
      </div>

      <!-- Tabla (escritorio / tablet) -->
      <div v-else class="table-container desktop-table">
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
            <tr
              v-for="item in filteredItems"
              :key="`${item.id}-${item.rol}`"
            >
              <td v-for="header in headers" :key="header.key">
                <template v-if="header.key === 'activo'">
                  <span
                    :class="[
                      'status-badge',
                      item[header.key] ? 'active' : 'inactive'
                    ]"
                  >
                    {{ item[header.key] ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>
                <template v-else-if="header.key === 'rol'">
                  <span class="role-badge" :class="getRoleClass(item[header.key])">
                    {{ getRoleDisplayName(item[header.key]) }}
                  </span>
                </template>
                <template v-else>
                  {{ item[header.key] }}
                </template>
              </td>
              <td class="actions">
                <button
                  @click="viewProfile(item)"
                  class="action-btn view"
                  title="Ver perfil"
                >
                  <Eye class="action-icon" />
                </button>
                <button
                  @click="editItem(item)"
                  class="action-btn edit"
                  title="Editar"
                >
                  <Edit class="action-icon" />
                </button>
                <button
                  v-if="item.activo"
                  @click="confirmDeactivate(item)"
                  class="action-btn delete"
                  title="Desactivar"
                >
                  <UserX class="action-icon" />
                </button>
                <button
                  v-else
                  @click="confirmActivate(item)"
                  class="action-btn activate"
                  title="Activar"
                >
                  <UserCheck class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tarjetas (móvil) -->
      <div class="mobile-cards">
        <div
          v-for="item in filteredItems"
          :key="`${item.id}-${item.rol}`"
          class="staff-card"
        >
          <div class="card-header">
            <div class="user-info">
              <h3 class="user-name">
                {{ item.nombre }} {{ item.apellido }}
              </h3>
              <span class="role-badge" :class="getRoleClass(item.rol)">
                {{ getRoleDisplayName(item.rol) }}
              </span>
            </div>
            <span
              :class="[
                'status-badge',
                item.activo ? 'active' : 'inactive'
              ]"
            >
              {{ item.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="card-body">
            <p><strong>ID:</strong> {{ item.id }}</p>
            <p><strong>Email:</strong> {{ item.email }}</p>
            <p><strong>Teléfono:</strong> {{ item.telefono || 'No especificado' }}</p>
          </div>

          <div class="card-actions">
            <button
              @click="viewProfile(item)"
              class="action-btn view mobile"
            >
              <Eye class="action-icon" />
              <span>Ver</span>
            </button>

            <button
              @click="editItem(item)"
              class="action-btn edit mobile"
            >
              <Edit class="action-icon" />
              <span>Editar</span>
            </button>

            <button
              v-if="item.activo"
              @click="confirmDeactivate(item)"
              class="action-btn delete mobile"
            >
              <UserX class="action-icon" />
              <span>Desactivar</span>
            </button>

            <button
              v-else
              @click="confirmActivate(item)"
              class="action-btn activate mobile"
            >
              <UserCheck class="action-icon" />
              <span>Activar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de creación/edición -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>{{ editingItem ? 'Editar Personal' : 'Nuevo Personal' }}</h2>

          <form @submit.prevent="saveItem">
            <div class="form-group">
              <label for="rol">Rol</label>
              <select
                v-model="formData.rol"
                id="rol"
                class="form-input"
                required
              >
                <option
                  v-for="role in allowedRoles"
                  :key="role.value"
                  :value="role.value"
                >
                  {{ role.label }}
                </option>
              </select>
            </div>

            <div
              v-for="header in editableHeaders"
              :key="header.key"
              class="form-group"
            >
              <label :for="header.key">{{ header.title }}</label>
              <!-- Campo Estado para edición -->
              <select
                v-if="header.key === 'activo' && editingItem"
                v-model="formData[header.key]"
                :id="header.key"
                class="form-input"
                required
              >
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
              <!-- Campos normales (excluyendo activo en creación) -->
              <input
                v-else-if="header.key !== 'activo' || editingItem"
                :type="header.type || 'text'"
                v-model="formData[header.key]"
                :id="header.key"
                class="form-input"
                required
              />
            </div>

            <div v-if="!editingItem" class="form-group">
              <label for="password">Contraseña</label>
              <input
                type="password"
                v-model="formData.password"
                id="password"
                class="form-input"
                required
                minlength="6"
              />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="modal-btn cancel">
                Cancelar
              </button>
              <button type="submit" class="modal-btn save" :disabled="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de confirmación -->
      <div v-if="showConfirmDialog" class="modal-overlay">
        <div class="modal-content confirm">
          <h3>{{ confirmAction === 'deactivate' ? 'Confirmar Desactivación' : 'Confirmar Activación' }}</h3>
          <p>
            ¿Estás seguro de que deseas {{ confirmAction === 'deactivate' ? 'desactivar' : 'activar' }} 
            a {{ itemToConfirm?.nombre }} {{ itemToConfirm?.apellido }}?
          </p>
          <div class="modal-actions">
            <button @click="cancelAction" class="modal-btn cancel">
              Cancelar
            </button>
            <button 
              @click="executeAction" 
              class="modal-btn" 
              :class="confirmAction === 'deactivate' ? 'delete' : 'save'"
            >
              {{ confirmAction === 'deactivate' ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { User, BookOpen, BarChart3, Users, Plus, Search, Edit, Eye, UserX, UserCheck } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'

const router = useRouter()
const { showNotification } = useNotifications()

// Reactive state
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const items = ref([])
const showModal = ref(false)
const showConfirmDialog = ref(false)
const editingItem = ref(null)
const itemToConfirm = ref(null)
const confirmAction = ref('')

// Form data
const formData = ref({
  rol: 'maestro',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  activo: true
})

// Configuration
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Apellido', key: 'apellido' },
  { title: 'Email', key: 'email', type: 'email' },
  { title: 'Teléfono', key: 'telefono' },
  { title: 'Rol', key: 'rol' },
  { title: 'Estado', key: 'activo' }
]

const editableHeaders = computed(() => 
  headers.filter(h => h.key !== 'id' && h.key !== 'rol')
)

const allowedRoles = [
  { label: 'Maestro', value: 'maestro' },
  { label: 'Director', value: 'director' }
]

const menuItems = [
  { label: 'Perfil', icon: User, path: '/director' },
  { label: 'Gestión Académica', icon: BookOpen, path: '/director/academic' },
  { label: 'Reportes', icon: BarChart3, path: '/director/reports' },
  { label: 'Personal', icon: Users, path: '/director/staff' }
]

// Computed properties
const filteredItems = computed(() => {
  let filtered = items.value

  // Filter by role
  if (roleFilter.value) {
    filtered = filtered.filter(item => item.rol === roleFilter.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.nombre.toLowerCase().includes(query) ||
      item.apellido.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.rol.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

const getRoleClass = (role) => {
  const roleClasses = {
    maestro: 'teacher',
    director: 'director'
  }
  return roleClasses[role] || 'default'
}

const getRoleDisplayName = (role) => {
  const roleNames = {
    maestro: 'Maestro',
    director: 'Director'
  }
  return roleNames[role] || role
}

const openCreateModal = () => {
  editingItem.value = null
  formData.value = {
    rol: 'maestro',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    activo: true
  }
  showModal.value = true
}

const editItem = (item) => {
  editingItem.value = item
  formData.value = {
    ...item,
    password: '' // Don't pre-fill password for security
  }
  showModal.value = true
}

const viewProfile = (item) => {
  showNotification('info', 'Perfil', `Viendo perfil de ${item.nombre} ${item.apellido}`)
  // Implement profile view logic
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const saveItem = async () => {
  try {
    saving.value = true

    // Validate required fields
    const requiredFields = ['nombre', 'apellido', 'email']
    if (!editingItem.value) {
      requiredFields.push('password')
    }

    for (const field of requiredFields) {
      if (!formData.value[field]?.trim()) {
        throw new Error(`El campo ${field} es requerido`)
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (editingItem.value) {
      // Update existing item
      const index = items.value.findIndex(item => item.id === editingItem.value.id)
      if (index !== -1) {
        items.value[index] = { ...formData.value, id: editingItem.value.id }
      }
      showNotification('success', 'Éxito', 'Personal actualizado correctamente')
    } else {
      // Create new item
      const newId = Math.max(...items.value.map(item => item.id), 0) + 1
      items.value.push({
        ...formData.value,
        id: newId,
        activo: true
      })
      showNotification('success', 'Éxito', 'Nuevo personal creado correctamente')
    }

    closeModal()
  } catch (error) {
    console.error('Error saving item:', error)
    showNotification('error', 'Error', error.message || 'Error al guardar los datos')
  } finally {
    saving.value = false
  }
}

const confirmDeactivate = (item) => {
  itemToConfirm.value = item
  confirmAction.value = 'deactivate'
  showConfirmDialog.value = true
}

const confirmActivate = (item) => {
  itemToConfirm.value = item
  confirmAction.value = 'activate'
  showConfirmDialog.value = true
}

const cancelAction = () => {
  showConfirmDialog.value = false
  itemToConfirm.value = null
  confirmAction.value = ''
}

const executeAction = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const index = items.value.findIndex(item => item.id === itemToConfirm.value.id)
    if (index !== -1) {
      items.value[index].activo = confirmAction.value === 'activate'
      
      const actionText = confirmAction.value === 'activate' ? 'activado' : 'desactivado'
      showNotification('success', 'Éxito', `Personal ${actionText} correctamente`)
    }

    cancelAction()
  } catch (error) {
    console.error('Error executing action:', error)
    showNotification('error', 'Error', 'No se pudo completar la acción')
  }
}

const fetchStaff = async () => {
  try {
    loading.value = true

    // Simulate API call to fetch staff data
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock data
    items.value = [
      {
        id: 1,
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@vanguardia.edu',
        telefono: '+504 9876-5432',
        rol: 'maestro',
        activo: true
      },
      {
        id: 2,
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@vanguardia.edu',
        telefono: '+504 8765-4321',
        rol: 'maestro',
        activo: true
      },
      {
        id: 3,
        nombre: 'Ana',
        apellido: 'López',
        email: 'ana.lopez@vanguardia.edu',
        telefono: '+504 7654-3210',
        rol: 'director',
        activo: false
      }
    ]
  } catch (error) {
    console.error('Error fetching staff:', error)
    showNotification('error', 'Error', 'No se pudo cargar la información del personal')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStaff()
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.staff-container {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 2rem;
}

.staff-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.filters-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn.create {
  background-color: #1b9963;
  color: white;
}

.action-btn.create:hover {
  background-color: #148a56;
}

.action-btn.edit {
  background-color: #ffc107;
  color: #000;
}

.action-btn.edit:hover {
  background-color: #e0a800;
}

.action-btn.view {
  background-color: #17a2b8;
  color: white;
}

.action-btn.view:hover {
  background-color: #138496;
}

.action-btn.delete {
  background-color: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background-color: #c82333;
}

.action-btn.activate {
  background-color: #28a745;
  color: white;
}

.action-btn.activate:hover {
  background-color: #218838;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  width: 20px;
  height: 20px;
  color: #666;
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

.desktop-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions .action-btn {
  padding: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.role-badge.teacher {
  background-color: #cce7ff;
  color: #004085;
}

.role-badge.director {
  background-color: #d1ecf1;
  color: #0c5460;
}

.role-badge.default {
  background-color: #e2e6ea;
  color: #6c757d;
}

.mobile-cards {
  display: none;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.staff-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.card-body {
  padding: 1rem;
}

.card-body p {
  margin: 0.5rem 0;
  color: #666;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.card-actions .action-btn.mobile {
  flex: 1;
  justify-content: center;
  font-size: 0.9rem;
  padding: 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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

.modal-content.confirm {
  max-width: 400px;
}

.modal-content h2,
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input {
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
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.modal-btn.cancel {
  background-color: #6c757d;
  color: white;
}

.modal-btn.cancel:hover {
  background-color: #5a6268;
}

.modal-btn.save {
  background-color: #1b9963;
  color: white;
}

.modal-btn.save:hover {
  background-color: #148a56;
}

.modal-btn.delete {
  background-color: #dc3545;
  color: white;
}

.modal-btn.delete:hover {
  background-color: #c82333;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media screen and (max-width: 1024px) {
  .staff-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-container {
    justify-content: space-between;
  }
}

@media screen and (max-width: 768px) {
  .staff-container {
    padding: 1rem;
  }

  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: grid;
  }

  .filters-container {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    min-width: auto;
  }

  .filter-select {
    min-width: auto;
  }
}

@media screen and (max-width: 480px) {
  .staff-container {
    padding: 0.75rem;
  }

  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>