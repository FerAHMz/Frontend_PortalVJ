<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="crud-container">
      <!-- Título -->
      <h1 class="text-page-title">Panel de Super Usuario</h1>
      <div class="separator"></div>

      <!-- Acciones (botón + buscador) -->
      <div class="crud-actions">
        <button @click="openCreateModal" class="action-btn create">
          <Plus class="action-icon" />
          <span class="btn-text">Nuevo Registro</span>
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

      <!-- Tabla (escritorio / tablet) -->
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
                >
                  <Trash class="action-icon" />
                </button>
                <button
                  v-else
                  @click="confirmActivate(item)"
                  class="action-btn activate"
                >
                  <Check class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tarjetas (móvil) -->
      <div class="mobile-cards">
        <div
          v-for="item in filteredItems"
          :key="`${item.id}-${item.rol}`"
          class="user-card"
        >
          <div class="card-header">
            <h3 class="user-name">
              {{ item.nombre }} {{ item.apellido }}
            </h3>
            <span class="role-badge" :class="getRoleClass(item.rol)">{{ getRoleDisplayName(item.rol) }}</span>
          </div>

          <div class="card-body">
            <p><strong>ID:</strong> {{ item.id }}</p>
            <p><strong>Email:</strong> {{ item.email }}</p>
            <p><strong>Teléfono:</strong> {{ item.telefono }}</p>
            <p>
              <strong>Estado:</strong>
              <span
                :class="[
                  'status-badge',
                  item.activo ? 'active' : 'inactive'
                ]"
              >
                {{ item.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </p>
          </div>

          <div class="card-actions">
            <button
              @click="viewProfile(item)"
              class="action-btn view"
            >
              <Eye class="action-icon" />
              <span>Ver Perfil</span>
            </button>

            <button
              @click="editItem(item)"
              class="action-btn edit"
            >
              <Edit class="action-icon" />
              <span>Editar</span>
            </button>

            <button
              v-if="item.activo"
              @click="confirmDeactivate(item)"
              class="action-btn delete"
            >
              <Trash class="action-icon" />
              <span>Desactivar</span>
            </button>

            <button
              v-else
              @click="confirmActivate(item)"
              class="action-btn activate"
            >
              <Check class="action-icon" />
              <span>Activar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de creación/edición -->
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
                <option
                  v-for="role in roles"
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
              <button
                type="button"
                @click="closeModal"
                class="modal-btn cancel"
              >
                Cancelar
              </button>
              <button type="submit" class="modal-btn save">
                {{ editingItem ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Confirmación -->
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

      <!-- Modal de Perfil -->
      <div v-if="showProfileModal" class="modal-overlay" @click="showProfileModal = false">
        <div class="modal-content profile-modal" @click.stop>
          <div class="profile-header">
            <h2>Perfil de Usuario</h2>
            <button @click="showProfileModal = false" class="close-btn">
              <X class="icon" />
            </button>
          </div>

          <div v-if="selectedUser" class="profile-content">
            <div class="profile-section">
              <h3>Información Personal</h3>
              <div class="profile-grid">
                <div class="profile-item">
                  <strong>Nombre:</strong>
                  <span>{{ selectedUser.nombre }}</span>
                </div>
                <div class="profile-item">
                  <strong>Apellido:</strong>
                  <span>{{ selectedUser.apellido }}</span>
                </div>
                <div class="profile-item">
                  <strong>Email:</strong>
                  <span>{{ selectedUser.email }}</span>
                </div>
                <div class="profile-item">
                  <strong>Teléfono:</strong>
                  <span>{{ selectedUser.telefono || 'No especificado' }}</span>
                </div>
              </div>
            </div>

            <div class="profile-section">
              <h3>Información del Sistema</h3>
              <div class="profile-grid">
                <div class="profile-item">
                  <strong>ID de Usuario:</strong>
                  <span>{{ selectedUser.id }}</span>
                </div>
                <div class="profile-item">
                  <strong>Rol:</strong>
                  <span class="role-badge" :class="getRoleClass(selectedUser.rol)">
                    {{ getRoleDisplayName(selectedUser.rol) }}
                  </span>
                </div>
                <div class="profile-item">
                  <strong>Estado:</strong>
                  <span :class="selectedUser.activo ? 'status-active' : 'status-inactive'">
                    {{ selectedUser.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="profile-item">
                  <strong>Fecha de Registro:</strong>
                  <span>{{ formatDate(selectedUser.fecha_creacion) || 'No disponible' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Notificaciones -->
    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { Settings, Plus, Search, Edit, Trash, Eye, EyeOff, BookOpen, User, Check, FileText, Users, UserPlus, Info, X } from 'lucide-vue-next'
import { downloadSuperUserInstructivePDF } from '@/composables/useSuperUserInstructivePDF'
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
    { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' },
    { label: 'Planificaciones', icon: FileText, path: '/superuser/planifications' },
    { label: 'Gestión de Familias', icon: Users, path: '/superuser/families' },
    { label: 'Inscripciones', icon: UserPlus, path: '/superuser/inscripciones' },
    { label: 'Instructivo', icon: Info, action: 'downloadInstructive' }
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
const showProfileModal = ref(false)
const selectedUser = ref(null)

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

const activateUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('error', 'Error', 'No se encontró token de autenticación');
      return;
    }

    if (!itemToDelete.value?.id || !itemToDelete.value?.rol) {
      throw new Error('Datos de usuario incompletos para activar');
    }

    await userService.activateUser(itemToDelete.value.id, itemToDelete.value.rol);
    showNotification('success', 'Éxito', 'Usuario activado exitosamente');
    await fetchUsers();
  } catch (error) {
    console.error('Error activando usuario:', error);
    showNotification('error', 'Error', error.message || 'Error al activar el usuario');
  }
};

const editableHeaders = computed(() => {
  if (editingItem.value) {
    // En edición, mostrar todos los campos excepto ID y rol
    return headers.filter(h => !['id', 'rol'].includes(h.key))
  } else {
    // En creación, ocultar el campo activo además de ID y rol
    return headers.filter(h => !['id', 'rol', 'activo'].includes(h.key))
  }
})

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
    password: '',
    // No incluir activo en creación - se establecerá por defecto en backend
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

    // Agregar activo solo si estamos editando
    if (editingItem.value && formData.value.activo !== undefined) {
      userData.activo = formData.value.activo;
    }

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

const confirmDeactivate = (item) => {
  itemToDelete.value = item
  showConfirmModal.value = true
}

const confirmActivate = (item) => {
  itemToDelete.value = item
  activateUser()
}

const closeModal = () => {
  showModal.value = false
  showPassword.value = false
}

// Profile modal functions
const viewProfile = (user) => {
  selectedUser.value = user
  showProfileModal.value = true
}

const getRoleClass = (role) => {
  const roleClasses = {
    'SUP': 'superuser',
    'Director': 'director',
    'Administrativo': 'administrative',
    'Maestro': 'teacher',
    'Padre': 'parent'
  }
  return roleClasses[role] || 'default'
}

const getRoleDisplayName = (role) => {
  const roleNames = {
    'SUP': 'Super Usuario',
    'Director': 'Director',
    'Administrativo': 'Administrativo',
    'Maestro': 'Maestro',
    'Padre': 'Padre'
  }
  return roleNames[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

const debugToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/debug/token`, {
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
  if (item.action === 'downloadInstructive') {
    downloadSuperUserInstructivePDF()
  } else if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped>
/*  Estructura base   */
.layout { display: flex; min-height: 100vh; }

.crud-container {
  flex: 1;
  padding: 2rem;
  max-width: 100%;
  overflow-x: hidden;
}

/*  Acciones  */
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

.action-btn.create { background: #1b9963; color: #fff; }
.action-btn.create:hover { background: #158a50; }

.action-icon { width: 18px; height: 18px; flex-shrink: 0; }

.action-btn.edit     { background: #f0ad4e; color: #fff; }
.action-btn.delete   { background: #d9534f; color: #fff; }
.action-btn.activate { background: #5cb85c; color: #fff; }

.action-btn.edit,
.action-btn.delete,
.action-btn.activate { padding: 0.5rem; border-radius: 6px; }

/*  Buscador  */
.search-container { position: relative; flex: 1; max-width: 400px; }

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

/*  Tabla (desktop)  */
.desktop-table { display: block; }

.table-container {
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-table { width: 100%; border-collapse: collapse; }

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th { background: #f5f5f5; font-weight: 600; }

.data-table tr:hover { background: #f9f9f9; }

.actions { display: flex; gap: 0.5rem; }

/*  Tarjetas (móvil)  */
.mobile-cards    { display: none; }
.user-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.user-name  { font-weight: 600; margin: 0; }
.user-role  {
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
}
.card-body   { font-size: 0.9rem; line-height: 1.4; margin-bottom: 0.75rem; }
.card-actions{
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/*  Badge de estado  */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}
.status-badge.active   { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #fee2e2; color: #991b1b; }

/*  Modal  */
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

.form-group  { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }

.form-input  {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.password-input-container { position: relative; display: flex; align-items: center; }
.password-toggle {
  position: absolute; right: 10px;
  background: none; border: none; cursor: pointer; color: #666; padding: 5px;
}
.password-toggle:hover { color: #333; }

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

.modal-btn.cancel  { background: #f5f5f5; border: 1px solid #ddd; }
.modal-btn.save    { background: #1b9963; color: #fff; }
.modal-btn.delete  { background: #d9534f; color: #fff; }

/*  Breakpoints  */

/* Tablets ≤ 1023 px */
@media (max-width: 1023px) {
  .crud-container { padding: 1.5rem; }
  .text-page-title     { font-size: 1.75rem; }
  .data-table th,
  .data-table td  { padding: 0.75rem; font-size: 0.95rem; }
}

/* Portátiles pequeños / Tablets ≤ 991 px */
@media (max-width: 991px) {
  .crud-actions      { flex-direction: column; align-items: stretch; }
  .search-container  { max-width: 100%; }
  .action-btn.create { width: auto; justify-content: center; }
}

/* Móviles ≤ 767 px */
@media (max-width: 767px) {
  .crud-container { padding: 0.75rem; }
  .text-page-title     { margin-top: 5.25rem; margin-bottom: 0.75rem; text-align: center; }
  .separator      { margin-bottom: 1rem; }

  /* Ocultar tabla → mostrar tarjetas */
  .desktop-table  { display: none; }
  .mobile-cards   { display: block; }

  /* Botón “Nuevo Registro” redondo */
  .btn-text            { display: none; }
  .action-btn.create   {
    width: 48px; height: 48px;
    padding: 0;
    border-radius: 50%;
    aspect-ratio: 1;
  }

  /* Modal más compacto */
  .modal-content {
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

/* Móviles muy pequeños ≤ 480 px */
@media (max-width: 480px) {
  .text-page-title   { margin-bottom: 0.8rem; }
  .search-input,
  .form-input   { font-size: 16px; } 
  .user-card    { padding: 1rem; }
  .card-body p  { margin: 0.25rem 0; }
}

/* Role badge styles */
.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.superuser {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.role-badge.director {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.role-badge.administrative {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.role-badge.teacher {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.role-badge.parent {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.role-badge.default {
  background: #6c757d;
  color: white;
}

/* Action button view style */
.action-btn.view {
  background: #17a2b8;
  color: #fff;
}

.action-btn.view:hover {
  background: #138496;
}

/* Profile modal styles */
.profile-modal {
  max-width: 600px;
  width: 90%;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.profile-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.close-btn .icon {
  width: 20px;
  height: 20px;
  color: #666;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-section h3 {
  margin: 0 0 1rem 0;
  color: #444;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-item strong {
  color: #555;
  font-size: 0.9rem;
  font-weight: 600;
}

.profile-item span {
  color: #333;
  font-size: 1rem;
}

.status-active {
  color: #28a745;
  font-weight: 600;
}

.status-inactive {
  color: #dc3545;
  font-weight: 600;
}

/* Mobile profile modal responsiveness */
@media (max-width: 768px) {
  .profile-modal {
    max-width: 95%;
    margin: 1rem;
  }
  
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    margin-bottom: 1rem;
  }
}
</style>
