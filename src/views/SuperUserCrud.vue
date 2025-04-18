<template>
  <div class="layout">
    <Sidebar :items="menuItems" />
    <main class="crud-container">
      <h1 class="page-title">Panel de Super Usuario</h1>
      <div class="separator"></div>
      
      <div class="crud-actions">
        <button @click="openCreateModal" class="action-btn create">
          <Plus class="action-icon" /> Nuevo Registro
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
              <td v-for="header in headers" :key="header.key">
                {{ item[header.key] }}
              </td>
              <td class="actions">
                <button @click="editItem(item)" class="action-btn edit">
                  <Edit class="action-icon" />
                </button>
                <button @click="confirmDelete(item)" class="action-btn delete">
                  <Trash class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Modal para crear/editar -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>{{ editingItem ? 'Editar Registro' : 'Nuevo Registro' }}</h2>
          <form @submit.prevent="saveItem">
            <div v-if="!editingItem" class="form-group">
              <label for="rol">Rol</label>
              <select 
                v-model="formData.rol" 
                id="rol"
                class="form-input"
              >
                <option v-for="role in roles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
            </div>
            
            <div v-for="header in editableHeaders" :key="header.key" class="form-group">
              <label :for="header.key">{{ header.title }}</label>
              <input 
                :type="header.type || 'text'" 
                v-model="formData[header.key]" 
                :id="header.key"
                class="form-input"
                :required="true"
              />
            </div>
            
            <div v-if="!editingItem" class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-input-container">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="formData.password" 
                  id="password"
                  class="form-input"
                  required
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="action-icon" />
                  <EyeOff v-else class="action-icon" />
                </button>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="modal-btn cancel">
                Cancelar
              </button>
              <button type="submit" class="modal-btn save">
                {{ editingItem ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <ModalConfirmacion
          v-if="showConfirmModal"
          :visible="showConfirmModal"
          title="Confirmar Eliminación"
          message="¿Estás seguro de eliminar este registro?"
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
import Sidebar from '@/components/Sidebar.vue'
import { Settings, Plus, Search, Edit, Trash, Eye, EyeOff } from 'lucide-vue-next'
import ModalConfirmacion from '@/components/dialogs/ModalConfirmation.vue'
import { userService } from '@/services/userService'

const menuItems = [
  { label: 'Super Usuario', icon: Settings, path: '/superuser' }
]

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'nombre', title: 'Nombre' },
  { key: 'apellido', title: 'Apellido' },
  { key: 'email', title: 'Email' },
  { key: 'telefono', title: 'Teléfono' },
  { key: 'rol', title: 'Rol' }
]

const items = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingItem = ref(null)
const itemToDelete = ref(null)
const formData = ref({})
const deleting = ref(false)
const showPassword = ref(false)

const roles = [
  { value: 'SUP', label: 'Super Usuario' },
  { value: 'Administrativo', label: 'Administrativo' },
  { value: 'Maestro', label: 'Maestro' },
  { value: 'Padre', label: 'Padre' }
]

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    const data = await userService.getAllUsers();
    items.value = data;
  } catch (error) {
    console.error('Error fetching users:', error.message)
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data.error);
    }
  }
}

const validateForm = () => {
  if (!formData.value.nombre?.trim()) throw new Error('El nombre es requerido');
  if (!formData.value.apellido?.trim()) throw new Error('El apellido es requerido');
  if (!formData.value.email?.trim()) throw new Error('El email es requerido');
  if (!formData.value.telefono?.trim()) throw new Error('El teléfono es requerido');
  if (!editingItem.value && !formData.value.password?.trim()) {
    throw new Error('La contraseña es requerida');
  }
}

const deleteItem = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró token de autenticación');
      return;
    }
    deleting.value = true;

    if (!itemToDelete.value?.id || !itemToDelete.value?.rol) {
      throw new Error('Datos de usuario incompletos para eliminar');
    }

    await userService.deleteUser(itemToDelete.value.id, itemToDelete.value.rol);
    alert('Usuario eliminado exitosamente');
    await fetchUsers();
    showConfirmModal.value = false;
  } catch (error) {
    console.error('Error deleting user:', error);
    alert(error.message || 'Error al eliminar el usuario');
  } finally {
    deleting.value = false;
  }
};

const editableHeaders = computed(() => headers.filter(h => 
  !['id', 'rol'].includes(h.key)
))

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(query)
    )
  )
})

const openCreateModal = () => {
  formData.value = {
    rol: 'Administrativo',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
  };
  editingItem.value = null;
  showModal.value = true;
};

const saveItem = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró token de autenticación');
      return;
    }

    validateForm();

    const userData = {
      nombre: formData.value.nombre.trim(),
      apellido: formData.value.apellido.trim(),
      email: formData.value.email.trim().toLowerCase(),
      telefono: formData.value.telefono.trim(),
      password: formData.value.password?.trim(),
      rol: formData.value.rol
    };

    console.log('Sending data:', userData); // For debugging

    if (editingItem.value) {
      await userService.updateUser(editingItem.value.id, userData);
      alert('Usuario actualizado exitosamente');
    } else {
      await userService.createUser(userData);
      alert('Usuario creado exitosamente');
    }
    await fetchUsers();
    closeModal();
  } catch (error) {
    console.error('Error saving user:', error);
    alert(error.message || 'Error al guardar el usuario');
  }
};

const editItem = (item) => {
  formData.value = { ...item }
  editingItem.value = item
  showModal.value = true
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  showConfirmModal.value = true
}

const closeModal = () => {
  showModal.value = false
  showPassword.value = false
}

onMounted(() => {
  fetchUsers()
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

.action-btn.edit, .action-btn.delete {
  padding: 0.5rem;
  border-radius: 6px;
}

.action-btn.edit {
  background-color: #f0ad4e;
  color: white;
  border: none;
}

.action-btn.delete {
  background-color: #d9534f;
  color: white;
  border: none;
}

/* Modales */
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

.modal-content.confirm {
  max-width: 400px;
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
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

.modal-btn.delete {
  background-color: #d9534f;
  color: white;
  border: none;
}

/* Responsive */
@media (max-width: 768px) {
  .crud-container {
    padding: 1rem;
    margin-left: 0;
  }
  
  .sidebar {
    display: none;
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
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
}

.password-toggle:hover {
  color: #333;
}

.form-input:required {
  border-left: 3px solid #1b9963;
}
</style>