<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick"/>
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
            <tr v-for="item in filteredItems" :key="`${item.id}-${item.rol}`">
              <td v-for="header in headers" :key="header.key">
                <template v-if="header.key === 'activo'">
                  <span :class="['status-badge', item[header.key] ? 'active' : 'inactive']">
                    {{ item[header.key] ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>
                <template v-else>
                  {{ item[header.key] }}
                </template>
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
            <div class="form-group">
              <label for="rol">Rol</label>
              <select
                v-model="formData.rol"
                id="rol"
                class="form-input"
                required
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
          title="Confirmar Desactivación"
          message="¿Estás seguro de desactivar este usuario?"
          confirm-text="Desactivar"
          cancel-text="Cancelar"
          confirm-button-class="delete"
          :loading="deleting"
          @confirm="deleteItem"
          @cancel="showConfirmModal = false"
      />
    </main>

    <!-- Notificaciones -->
    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { Settings, Plus, Search, Edit, Trash, Eye, EyeOff, BookOpen, User } from 'lucide-vue-next'
import ModalConfirmacion from '@/components/dialogs/ModalConfirmation.vue'
import { userService } from '@/services/userService'
import { useNotifications } from '@/utils/useNotifications.js'
import { useRouter } from 'vue-router'
import { getCurrentUser, isAuthenticated } from '@/utils/auth.js'
import axios from 'axios'

const { showNotification } = useNotifications();
const router = useRouter()

const menuItems = [
    { label: 'Perfil', icon: User, path: '/superuser/profile' },
    { label: 'Gestión de Usuarios', icon: Settings, path: '/superuser' },
    { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' }
]

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'nombre', title: 'Nombre' },
  { key: 'apellido', title: 'Apellido' },
  { key: 'email', title: 'Email' },
  { key: 'telefono', title: 'Teléfono' },
  { key: 'rol', title: 'Rol' },
  { key: 'activo', title: 'Estado' }
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
  { value: 'Director', label: 'Director' },
  { value: 'Administrativo', label: 'Administrativo' },
  { value: 'Maestro', label: 'Maestro' },
  { value: 'Padre', label: 'Padre' }
]

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('error', 'Error', 'No se encontró token de autenticación');
      return;
    }
    const data = await userService.getAllUsers();
    
    // Mapear los datos y eliminar duplicados
    const mappedData = data.map(user => ({
      ...user,
      activo: user.activo === undefined ? true : user.activo
    }));
    
    // Eliminar duplicados usando una clave única compuesta (id + rol)
    const seenKeys = new Set();
    const uniqueData = mappedData.filter(user => {
      const uniqueKey = `${user.id}-${user.rol}`;
      if (seenKeys.has(uniqueKey)) {
        return false;
      }
      seenKeys.add(uniqueKey);
      return true;
    });
    
    // Ordenar por rol y luego por ID para garantizar consistencia
    const roleOrder = { 'SUP': 1, 'Director': 2, 'Administrativo': 3, 'Maestro': 4, 'Padre': 5 };
    uniqueData.sort((a, b) => {
      const aOrder = roleOrder[a.rol] || 999;
      const bOrder = roleOrder[b.rol] || 999;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      return a.id - b.id;
    });
    
    items.value = uniqueData;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    let errorMessage = 'Error al cargar usuarios';
    
    if (error.message.includes('No tiene permisos')) {
      errorMessage = 'No tiene permisos para acceder a esta información';
    } else if (error.response?.status === 401) {
      errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente';
    } else if (error.response?.status === 500) {
      errorMessage = 'Error en el servidor: ' + (error.response.data.error || 'Error desconocido');
    }
    
    showNotification('error', 'Error', errorMessage);
  }
}

const validateForm = () => {
  if (!formData.value.nombre || !formData.value.apellido || !formData.value.email || !formData.value.telefono) {
    throw new Error('Todos los campos son obligatorios');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    throw new Error('El formato del email no es válido');
  }

  const phoneRegex = /^\d{8}$/;
  if (!phoneRegex.test(formData.value.telefono)) {
    throw new Error('El teléfono debe contener exactamente 8 dígitos');
  }

  if (!editingItem.value && (!formData.value.password || formData.value.password.length < 8)) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
};

const deleteItem = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('error', 'Error', 'No se encontró token de autenticación');
      return;
    }
    deleting.value = true;

    if (!itemToDelete.value?.id || !itemToDelete.value?.rol) {
      throw new Error('Datos de usuario incompletos para desactivar');
    }

    await userService.deleteUser(itemToDelete.value.id, itemToDelete.value.rol);
    showNotification('success', 'Éxito', 'Usuario desactivado exitosamente');
    await fetchUsers();
    showConfirmModal.value = false;
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    showNotification('error', 'Error', error.message || 'Error al desactivar el usuario');
  } finally {
    deleting.value = false;
  }
};

const editableHeaders = computed(() => headers.filter(h =>
  !['id', 'rol'].includes(h.key)
))

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
  
  // Eliminar duplicados adicionales que puedan surgir durante el filtrado
  const seenKeys = new Set();
  result = result.filter(item => {
    const uniqueKey = `${item.id}-${item.rol}`;
    if (seenKeys.has(uniqueKey)) {
      return false;
    }
    seenKeys.add(uniqueKey);
    return true;
  });
  
  // Mantener el ordenamiento: primero por rol, luego por ID
  return result.sort((a, b) => {
    // Definir el orden de roles
    const roleOrder = { 'SUP': 1, 'Director': 2, 'Administrativo': 3, 'Maestro': 4, 'Padre': 5 };
    const aOrder = roleOrder[a.rol] || 999;
    const bOrder = roleOrder[b.rol] || 999;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Si el rol es el mismo, ordenar por ID
    return a.id - b.id;
  });
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
      showNotification('error', 'Error', 'No se encontró token de autenticación');
      return;
    }

    // Validar formulario
    try {
      validateForm();
    } catch (validationError) {
      showNotification('error', 'Error de Validación', validationError.message);
      return;
    }

    const userData = {
      nombre: formData.value.nombre.trim(),
      apellido: formData.value.apellido.trim(),
      email: formData.value.email.trim().toLowerCase(),
      telefono: formData.value.telefono.trim(),
      password: formData.value.password?.trim(),
      rol: formData.value.rol,
      rolAnterior: editingItem.value?.rol
    };

    console.log('Sending data:', userData);

    if (editingItem.value) {
      userData.rolAnterior = editingItem.value.rol;
      await userService.updateUser(editingItem.value.id, userData);
      showNotification('success', 'Éxito', 'Usuario actualizado exitosamente');
    } else {
      await userService.createUser(userData);
      showNotification('success', 'Éxito', 'Usuario creado exitosamente');
    }
    await fetchUsers();
    closeModal();
  } catch (error) {
    console.error('Error saving user:', error);
    let errorMessage = 'Error al guardar el usuario';

    // Manejo específico de errores
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message && error.message.includes('duplicate key')) {
      if (error.message.includes('telefono_key')) {
        errorMessage = 'El número de teléfono ya está registrado';
      } else if (error.message.includes('maestros_pkey')) {
        errorMessage = 'Ya existe un maestro con este identificador';
      }
    } else if (error.message && error.message.includes('not-null constraint')) {
      errorMessage = 'Todos los campos requeridos deben ser completados';
    }

    showNotification('error', 'Error', errorMessage);
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

const debugToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }
    
    const response = await axios.get('http://localhost:3000/api/debug/token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Debug token response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Debug token error:', error.response?.data || error.message);
    return null;
  }
}

onMounted(async () => {
  // Verificar autenticación y permisos antes de cargar usuarios
  console.log('=== Debug información de autenticación ===');
  
  // Primero, verificar el token en el backend
  const tokenDebug = await debugToken();
  if (!tokenDebug) {
    showNotification('error', 'Error', 'Token inválido o expirado. Por favor, inicie sesión nuevamente.');
    router.push('/login');
    return;
  }
  
  if (!isAuthenticated()) {
    console.log('Usuario no autenticado');
    showNotification('error', 'Error', 'Sesión expirada. Por favor, inicie sesión nuevamente.');
    router.push('/login');
    return;
  }
  
  const currentUser = getCurrentUser();
  console.log('Usuario actual:', currentUser);
  
  if (!currentUser) {
    console.log('No se pudo obtener información del usuario');
    showNotification('error', 'Error', 'No se pudo verificar la información del usuario');
    router.push('/login');
    return;
  }
  
  if (currentUser.role !== 'SUP') {
    console.log(`Rol incorrecto: ${currentUser.role} - Se requiere: SUP`);
    showNotification('error', 'Error', `Acceso denegado. Su rol es "${currentUser.role}" pero se requiere "SUP"`);
    return;
  }
  
  console.log('Verificación de permisos exitosa, cargando usuarios...');
  fetchUsers();
})

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>
