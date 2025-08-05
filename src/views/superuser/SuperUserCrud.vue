<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="crud-container">
      <!-- Título -->
      <h1 class="page-title">Panel de Super Usuario</h1>
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
                <template v-else>
                  {{ item[header.key] }}
                </template>
              </td>
              <td class="actions">
                <button
                  @click="editItem(item)"
                  class="action-btn edit"
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
            <span class="user-role">{{ item.rol }}</span>
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
              <input
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

      <!-- Confirmación -->
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

    <!-- Notificaciones -->
    <NotificationDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { Settings, Plus, Search, Edit, Trash, Eye, EyeOff, BookOpen, User, Check, FileText, Users } from 'lucide-vue-next'
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
    { label: 'Gestión de Familias', icon: Users, path: '/superuser/families' }
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
/*  Estructura base   */
.layout { display: flex; min-height: 100vh; }

.crud-container {
  flex: 1;
  padding: 2rem;
  max-width: 100%;
  overflow-x: hidden;
}

.page-title {
  margin-top: 3.5rem;          /* evita que lo tape el menú */
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: bold;
  color: #000;
}

.separator { border-bottom: 2px solid #000; margin-bottom: 1.5rem; }

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
  .page-title     { font-size: 1.75rem; }
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
  .page-title     { font-size: 1.5rem; margin-top: 5.25rem; margin-bottom: 0.75rem; }
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
  .page-title   { font-size: 1.25rem; }
  .search-input,
  .form-input   { font-size: 16px; } 
  .user-card    { padding: 1rem; }
  .card-body p  { margin: 0.25rem 0; }
}
</style>
