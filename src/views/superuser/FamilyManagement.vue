<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="crud-container">
      <!-- Título y estadísticas -->
      <div class="header-section">
        <h1 class="text-page-title">Gestión de Familias</h1>
      <div class="separator"></div>
        <div class="stats-container">
          <div class="stat-card">
            <h3>Padres con Hijos</h3>
            <p class="stat-number">{{ statistics.total_padres_con_hijos || 0 }}</p>
          </div>
          <div class="stat-card">
            <h3>Estudiantes Asignados</h3>
            <p class="stat-number">{{ statistics.total_estudiantes_asignados || 0 }}</p>
          </div>
          <div class="stat-card warning">
            <h3>Sin Padre Asignado</h3>
            <p class="stat-number">{{ statistics.estudiantes_sin_padre || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="separator"></div>

      <!-- Acciones: botón + búsqueda -->
      <div class="crud-actions">
        <button @click="openCreateModal" class="action-btn create">
          <Plus class="action-icon" />
          <span class="btn-text">Asignar Hijo a Padre</span>
        </button>

        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar por nombre del padre o estudiante..."
            class="search-input"
          />
          <Search class="search-icon" />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando familias...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>Error al cargar familias</h3>
          <p>{{ error }}</p>
          <button @click="fetchFamilies" class="retry-btn">Reintentar</button>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="content">
        <!-- Vista de tabla para desktop -->
        <div class="table-container desktop-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Padre/Tutor</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="family in filteredFamilies" :key="family.id">
                <td>{{ family.id }}</td>
                <td>{{ family.padre_nombre }} {{ family.padre_apellido }}</td>
                <td>{{ family.padre_email }}</td>
                <td>{{ family.padre_telefono }}</td>
                <td>{{ family.estudiante_nombre }} {{ family.estudiante_apellido }}</td>
                <td>{{ family.estudiante_grado }}</td>
                <td class="actions">
                  <div class="action-group">
                    <button
                      @click="openEditModal(family)"
                      class="action-btn edit"
                      title="Cambiar padre"
                    >
                      <Edit class="action-icon" />
                    </button>
                    <button
                      @click="confirmDelete(family)"
                      class="action-btn delete"
                      title="Eliminar relación"
                    >
                      <Trash class="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Vista de tarjetas para móvil -->
        <div class="mobile-cards">
          <div v-for="family in filteredFamilies" :key="family.id" class="family-card">
            <div class="card-header">
              <div class="card-id">ID: {{ family.id }}</div>
              <div class="card-actions">
                <button
                  @click="openEditModal(family)"
                  class="action-btn edit small"
                  title="Cambiar padre"
                >
                  <Edit class="action-icon" />
                </button>
                <button
                  @click="confirmDelete(family)"
                  class="action-btn delete small"
                  title="Eliminar relación"
                >
                  <Trash class="action-icon" />
                </button>
              </div>
            </div>
            
            <div class="card-content">
              <div class="section">
                <h4>Padre/Tutor</h4>
                <p><strong>Nombre:</strong> {{ family.padre_nombre }} {{ family.padre_apellido }}</p>
                <p><strong>Email:</strong> {{ family.padre_email }}</p>
                <p><strong>Teléfono:</strong> {{ family.padre_telefono }}</p>
              </div>
              
              <div class="section">
                <h4>Estudiante</h4>
                <p><strong>Nombre:</strong> {{ family.estudiante_nombre }} {{ family.estudiante_apellido }}</p>
                <p><strong>Grado:</strong> {{ family.estudiante_grado }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredFamilies.length === 0 && !loading" class="empty-state">
          <div class="empty-content">
            <Users class="empty-icon" />
            <h3>No hay familias registradas</h3>
            <p>Comienza creando la primera relación familiar.</p>
            <button @click="openCreateModal" class="action-btn create">
              <Plus class="action-icon" />
              Asignar Hijo a Padre
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar familia -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditing ? 'Cambiar Padre del Estudiante' : 'Asignar Hijo a Padre' }}</h2>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>
          
          <form @submit.prevent="submitForm" class="modal-body">
            <div class="form-group">
              <label for="parent">Padre/Tutor *</label>
              <SearchableSelect
                v-model="formData.id_padre"
                :options="formattedParents"
                placeholder="Seleccionar padre..."
                search-placeholder="Buscar padre por nombre o email..."
                display-field="fullName"
                value-field="id"
                :search-fields="['fullName', 'email']"
                secondary-field="email"
                @change="onParentChange"
              />
            </div>

            <div v-if="!isEditing" class="form-group">
              <label for="student">Estudiante *</label>
              <SearchableSelect
                v-model="formData.carnet_estudiante"
                :options="formattedStudents"
                placeholder="Seleccionar estudiante..."
                search-placeholder="Buscar estudiante por nombre o grado..."
                display-field="fullName"
                value-field="carnet"
                :search-fields="['fullName', 'grado']"
                secondary-field="gradeSection"
                @change="onStudentChange"
              />
            </div>

            <div v-else class="form-group">
              <label>Estudiante</label>
              <div class="readonly-field">
                {{ editingFamily.estudiante_nombre }} {{ editingFamily.estudiante_apellido }} - {{ editingFamily.estudiante_grado }}
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Procesando...' : (isEditing ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notifications -->
      <NotificationDialog />
      <ConfirmDialog ref="confirmDialog" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import SearchableSelect from '@/components/SearchableSelect.vue';
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import { familyService } from '@/services/familyService';
import { useNotifications } from '@/utils/useNotifications.js';
import { useRouter } from 'vue-router';
import { User, Settings, BookOpen, FileText, Users, UserPlus, Plus, Search, Edit, Trash } from 'lucide-vue-next';

const router = useRouter();
const { showNotification } = useNotifications();
const confirmDialog = ref(null);

// Reactive data
const loading = ref(true);
const error = ref(null);
const families = ref([]);
const availableParents = ref([]);
const availableStudents = ref([]);
const statistics = ref({});
const searchQuery = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingFamily = ref(null);
const submitting = ref(false);

// Form data
const formData = ref({
  id_padre: '',
  carnet_estudiante: ''
});

// Menu items for superuser
const menuItems = [
  { label: 'Perfil', icon: User, path: '/superuser/profile' },
  { label: 'Gestión de Usuarios', icon: Settings, path: '/superuser' },
  { label: 'Gestión de Cursos', icon: BookOpen, path: '/superuser/teacher-courses' },
  { label: 'Planificaciones', icon: FileText, path: '/superuser/planifications' },
  { label: 'Gestión de Familias', icon: Users, path: '/superuser/families' },
  { label: 'Inscripciones', icon: UserPlus, path: '/superuser/inscripciones' }
];

// Computed properties
const filteredFamilies = computed(() => {
  if (!searchQuery.value) return families.value;
  
  const query = searchQuery.value.toLowerCase();
  return families.value.filter(family => 
    family.padre_nombre.toLowerCase().includes(query) ||
    family.padre_apellido.toLowerCase().includes(query) ||
    family.estudiante_nombre.toLowerCase().includes(query) ||
    family.estudiante_apellido.toLowerCase().includes(query) ||
    family.padre_email.toLowerCase().includes(query)
  );
});

// Formatear datos para los selectores
const formattedParents = computed(() => {
  return availableParents.value.map(parent => ({
    ...parent,
    fullName: `${parent.nombre} ${parent.apellido}`
  }));
});

const formattedStudents = computed(() => {
  return availableStudents.value.map(student => ({
    ...student,
    fullName: `${student.nombre} ${student.apellido}`,
    gradeSection: student.seccion ? `${student.grado} - ${student.seccion}` : student.grado || 'Sin grado asignado'
  }));
});

// Methods
const fetchFamilies = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const [familiesResult, statisticsResult] = await Promise.all([
      familyService.getAllFamilies(),
      familyService.getFamilyStatistics()
    ]);
    
    families.value = familiesResult.data;
    statistics.value = statisticsResult.data;
    
  } catch (err) {
    console.error('Error fetching families:', err);
    error.value = err.response?.data?.error || 'Error al cargar las familias';
    showNotification('error', 'Error', error.value);
  } finally {
    loading.value = false;
  }
};

const fetchAvailableData = async () => {
  try {
    const [parentsResult, studentsResult] = await Promise.all([
      familyService.getAvailableParents(),
      familyService.getAvailableStudents()
    ]);
    
    availableParents.value = parentsResult.data;
    availableStudents.value = studentsResult.data;
    
  } catch (err) {
    console.error('Error fetching available data:', err);
    showNotification('error', 'Error', 'Error al cargar datos disponibles');
  }
};

const openCreateModal = async () => {
  await fetchAvailableData();
  isEditing.value = false;
  editingFamily.value = null;
  formData.value = {
    id_padre: '',
    carnet_estudiante: ''
  };
  showModal.value = true;
};

const openEditModal = async (family) => {
  await fetchAvailableData();
  isEditing.value = true;
  editingFamily.value = family;
  formData.value = {
    id_padre: family.id_padre,
    carnet_estudiante: family.carnet_estudiante
  };
  showModal.value = true;
};

// Métodos para manejar cambios en los selectores
const onParentChange = (selectedParent) => {
  console.log('Padre seleccionado:', selectedParent);
};

const onStudentChange = (selectedStudent) => {
  console.log('Estudiante seleccionado:', selectedStudent);
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingFamily.value = null;
  formData.value = {
    id_padre: '',
    carnet_estudiante: ''
  };
};

const submitForm = async () => {
  try {
    submitting.value = true;
    
    if (isEditing.value) {
      await familyService.updateFamily(editingFamily.value.id, {
        id_padre: formData.value.id_padre
      });
      showNotification('success', 'Éxito', 'Relación familiar actualizada correctamente');
    } else {
      await familyService.createFamily(formData.value);
      showNotification('success', 'Éxito', 'Relación familiar creada correctamente');
    }
    
    closeModal();
    await fetchFamilies();
    
  } catch (err) {
    console.error('Error submitting form:', err);
    const errorMessage = err.response?.data?.error || 'Error al procesar la solicitud';
    showNotification('error', 'Error', errorMessage);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (family) => {
  const confirmed = await confirmDialog.value.show({
    title: 'Eliminar Relación Familiar',
    message: `¿Estás seguro de que deseas eliminar la relación entre ${family.padre_nombre} ${family.padre_apellido} y ${family.estudiante_nombre} ${family.estudiante_apellido}?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  });

  if (confirmed) {
    await deleteFamily(family.id);
  }
};

const deleteFamily = async (familyId) => {
  try {
    await familyService.deleteFamily(familyId);
    showNotification('success', 'Éxito', 'Relación familiar eliminada correctamente');
    await fetchFamilies();
  } catch (err) {
    console.error('Error deleting family:', err);
    const errorMessage = err.response?.data?.error || 'Error al eliminar la relación familiar';
    showNotification('error', 'Error', errorMessage);
  }
};

const handleItemClick = (item) => {
  if (item.action === 'logout') {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/login');
  } else if (item.path) {
    router.push(item.path);
  }
};

// Lifecycle
onMounted(() => {
  fetchFamilies();
});
</script>

<style scoped>
/* Layout base */
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.crud-container {
  flex: 1;
  padding: 2rem;
  overflow-x: auto;
}

/* Header section */
.header-section {
  margin-bottom: 2rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  border-left: 4px solid #4299e1;
}

.stat-card.warning {
  border-left-color: #ed8936;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #718096;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.separator {
  height: 1px;
  background: linear-gradient(to right, #e2e8f0, #cbd5e0, #e2e8f0);
  margin: 2rem 0;
}

/* CRUD Actions */
.crud-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.action-btn.create {
  background: #4299e1;
  color: white;
}

.action-btn.create:hover {
  background: #3182ce;
}

.action-btn.edit {
  background: #ed8936;
  color: white;
}

.action-btn.edit:hover {
  background: #dd6b20;
}

.action-btn.delete {
  background: #e53e3e;
  color: white;
}

.action-btn.delete:hover {
  background: #c53030;
}

.action-btn.small {
  padding: 0.5rem;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.search-container {
  position: relative;
  max-width: 300px;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #a0aec0;
}

/* Loading and Error states */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #e53e3e;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #3182ce;
}

/* Table styles */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table tbody tr:hover {
  background: #f7fafc;
}

.actions {
  width: 120px;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Mobile cards */
.mobile-cards {
  display: none;
}

.family-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.card-header {
  background: #f7fafc;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.card-id {
  font-weight: 600;
  color: #4a5568;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  padding: 1rem;
}

.section {
  margin-bottom: 1rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #2d3748;
}

/* Empty state */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e0;
  margin: 0 auto 1rem;
}

.empty-content h3 {
  font-size: 1.25rem;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
}

.empty-content p {
  color: #718096;
  margin: 0 0 2rem 0;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.readonly-field {
  padding: 0.75rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #4a5568;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .crud-container {
    padding: 1rem;
  }

  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .crud-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }

  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .crud-container {
    padding: 0.75rem;
  }
  
  .text-page-title {
    margin-bottom: 0.8rem;
  }
}
</style>
