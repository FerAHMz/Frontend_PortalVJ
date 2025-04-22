<template>
  <div class="layout">
    <Sidebar :items="menuItems" />
    <main class="control-de-pagos">
      <h1 class="page-title">Registro de Pagos</h1>
      <div class="separator"></div>
      
      <div class="crud-actions">
        <button @click="openCreateModal" class="action-btn create">
          <Plus class="action-icon" /> Nuevo Pago
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

      <div class="payments-table">
        <table>
          <thead>
            <tr>
              <th>Carnet</th>
              <th>Nombre</th>
              <th>Fecha de Pago</th>
              <th>Mes pagado</th>
              <th>Número de boleta</th>
              <th>Monto</th>
              <th>Grado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id_pago">
              <td>{{ student.id }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.fecha_pago }}</td>
              <td>{{ student.mes_solvencia }}</td>
              <td>{{ student.no_boleta }}</td>
              <td>{{ student.monto }}</td>
              <td>{{ student.grade }}</td>
              <td class="actions">
                <button @click="editPayment(student)" class="action-btn edit">
                  <Edit class="action-icon" />
                </button>
                <button @click="confirmDeletePayment(student)" class="action-btn delete">
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
          <h2>{{ editingItem ? 'Editar Pago' : 'Nuevo Pago' }}</h2>
          <form @submit.prevent="saveItem">
            
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

            <div class="form-group">
              <label for="mes_solvencia">Mes pagado</label>
              <select v-model="formData.mes_solvencia" class="form-input" required>
                <option disabled value="">Seleccione un mes</option>
                <option value="Enero">Enero</option>
                <option value="Febrero">Febrero</option>
                <option value="Marzo">Marzo</option>
                <option value="Abril">Abril</option>
                <option value="Mayo">Mayo</option>
                <option value="Junio">Junio</option>
                <option value="Julio">Julio</option>
                <option value="Agosto">Agosto</option>
                <option value="Septiembre">Septiembre</option>
                <option value="Octubre">Octubre</option>
                <option value="Noviembre">Noviembre</option>
                <option value="Diciembre">Diciembre</option>
              </select>
            </div>

            <div class="form-group">
              <label for="metodo_pago">Metodo de Pago</label>
              <select 
                v-model="formData.id_metodo_pago" 
                id="metodo_pago"
                class="form-input"
              >
                <option v-for="metodo in metodos_pago" :key="metodo.value" :value="metodo.value">
                  {{ metodo.label }}
                </option>
              </select>
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
          message="¿Estás seguro de eliminar este pago?"
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
import Sidebar from '@/components/Sidebar.vue'
import { manualPaymentService } from '@/services/manualPaymentService';
import ModalConfirmacion from '@/components/dialogs/ModalConfirmation.vue'
import { User, CreditCard } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { Plus,  Edit, Trash, Search } from 'lucide-vue-next'


const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const headers = [
  { key: 'nombre_padre', title: 'Nombre del tutor', type: 'text' },
  { key: 'apellido_padre', title: 'Apellido del tutor', type: 'text' },
  { key: 'carnet_estudiante', title: 'Carnet del estudiante', type: 'text' },
  { key: 'fecha_pago', title: 'Fecha de pago', type: 'date' },
  { key: 'no_boleta', title: 'Número de boleta', type: 'text' },
  { key: 'monto', title: 'Monto', type: 'number', step: 0.01 }
]

const metodos_pago = [
  { value: 1, label: 'Efectivo' },
  { value: 2, label: 'Tarjeta de Crédito' },
  { value: 3, label: 'Tarjeta de Débito' },
  { value: 4, label: 'Transferencia' },
  { value: 5, label: 'Cheque' },
  { value: 6, label: 'Paypal' },
  { value: 7, label: 'Bitcoin' },
  { value: 8, label: 'Apple Pay' },
  { value: 9, label: 'Google Pay' },
  { value: 10, label: 'Pago Móvil' }
]

const searchQuery = ref('')
const selectedGrade = ref(null)
const students = ref([])
const showModal = ref(false)
const editingItem = ref(null)
const itemToDelete = ref(null)
const formData = ref({})
const showConfirmModal = ref(false)
const deleting = ref(false)
const grades = ref([]);

const filteredStudents = computed(() => {
  if (!Array.isArray(students.value)) {
    return []; // O manejar de otra forma si no es un arreglo
  }
  return students.value.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         student.id.toString().includes(searchQuery.value);
    const matchesGrade = !selectedGrade.value || student.grade === selectedGrade.value;
    return matchesSearch && matchesGrade;
  });
})

const editableHeaders = computed(() => {
  return headers.filter(header => header.key !== 'id_metodo_pago')
})

const openCreateModal = () => {
  formData.value = {
    nombre_padre: '',
    apellido_padre: '',
    carnet_estudiante: '',
    mes_solvencia: '',
    fecha_pago: '',
    no_boleta: '',
    id_metodo_pago: '',
    monto: ''
  };
  editingItem.value = null;
  showModal.value = true;
};

const fetchPayments = async () => {
  try {
    const response = await manualPaymentService.getStudentsWithPayments();
    students.value = response;
  } catch (error) {
    console.error('Error fetching students:', error);
  }
}

const validateForm = () => {
  if (!formData.value.nombre_padre?.trim()) throw new Error('El nombre del padre es requerido');
  if (!formData.value.apellido_padre?.trim()) throw new Error('El apellido del padre es requerido');
  if (!formData.value.carnet_estudiante?.trim()) throw new Error('El carnet del estudiante es requerido');
  if (!formData.value.mes_solvencia?.trim()) throw new Error('El mes de la solvencia es requerido');
  if (!formData.value.fecha_pago?.trim()) throw new Error('La fecha de pago es requerida');
  if (!formData.value.no_boleta?.trim()) throw new Error('El número de boleta es requerido');
  if (!formData.value.monto?.toString().trim()) throw new Error('El monto es requerido');
}

const saveItem = async () => {
  try {

    validateForm();

    const paymentData = {
      nombre_padre: formData.value.nombre_padre.trim(),
      apellido_padre: formData.value.apellido_padre.trim(),
      carnet_estudiante: formData.value.carnet_estudiante.trim(),
      mes_solvencia: formData.value.mes_solvencia.trim(),
      fecha_pago: formData.value.fecha_pago.trim(),
      no_boleta: formData.value.no_boleta.trim(),
      id_metodo_pago: formData.value.id_metodo_pago,
      monto: parseFloat(formData.value.monto)
    };

    if (editingItem.value) {
      await manualPaymentService.editPayment(editingItem.value.id, paymentData);
      alert('Pago actualizado exitosamente');
    } else {
      await manualPaymentService.addPayment(paymentData);
      alert('Pago agregado exitosamente');
    }
    await fetchPayments();
    closeModal();
  } catch (error) {
    console.error('Error saving payment:', error);
    alert(error.message || 'Error al guardar el pago');
  }
};

const editPayment = (student) => {
  
  formData.value = {
    nombre_padre: student.nombre_padre || '',
    apellido_padre: student.apellido_padre || '',
    carnet_estudiante: String(student.id || ''),
    mes_solvencia: student.mes_solvencia || '',
    fecha_pago: student.fecha_pago ? student.fecha_pago.slice(0,10) : '',
    no_boleta: String(student.no_boleta || ''),
    id_metodo_pago: student.id_metodo_pago || '',
    monto: student.monto || ''
  };
  editingItem.value = { id: student.id_pago };
  showModal.value = true;
}

const deleteItem = async () => {
  try {
    deleting.value = true;

    if (!itemToDelete.value?.id) {
      throw new Error('Datos de pago incompletos para eliminar');
    }

    await manualPaymentService.deletePayment(itemToDelete.value.id);
    alert('Pago eliminado exitosamente');
    await fetchPayments();
    showConfirmModal.value = false;

  } catch (error) {
    console.error('Error deleting payment:', error);
    alert(error.message || 'Error al eliminar el pago');
  } finally {
    deleting.value = false;
  }
};

const confirmDeletePayment = (student) => {
  itemToDelete.value = { id: student.id_pago }; 
  showConfirmModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
}

onMounted(() => {
  fetchPayments()
})

onMounted(fetchPayments)
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  font-size: 70px;
  padding: 30px;
}

.control-de-pagos {
  flex: 1;
  padding: 20px;
}

.layout {
  display: flex;
  height: 100vh;
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
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
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

.action-btn.edit, .action-btn.delete {
  padding: 0.5rem;
  border-radius: 6px;
}

.action-btn.edit {
  background-color: #fd7e14;
  color: white;
  border: none;
}

.action-btn.edit:hover {
  background-color: #e96b00;
}

.action-btn.delete {
  background-color: #dc3545;
  color: white;
  margin-left: 0.5rem;
  border: none;
}

.action-btn.delete:hover {
  background-color: #bb2d3b;
}

.payments-table table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th, 
.payments-table td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.payments-table th {
  background-color: #f3f4f6;
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

.additional-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.additional-filters > input {
  flex: 1;
  padding: 10px;
  border-radius: 15px;
  border: 1px solid #e9e9e9;
}

.filtrado > * {
  flex: 1;
}

input[type='text'],
input[type='date'] {
  padding: 10px;
  border-radius: 15px;
  border: 1px solid #e9e9e9;
  background-color: #e5e5e5;
}

input[type='text'] {
  padding: 16px;
  border-radius: 15px;
  border: 1px solid #e9e9e9;
  background-color: #e5e5e5;
  font-size: 16px;
  height: auto;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 800px;
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
  padding: 10px;
}


/* Dropdown */
.dropbtn {
  background-color: #e5e5e5;
  color: black;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 15px;
  width: 100%;
}

.dropbtn:hover,
.dropbtn:focus {
  background-color: #b4b4b4;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #f1f1f1;
  width: 100%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 10px;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  border-radius: 10px;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 10px;
  background-color: #e5e5e5;
  font-size: 25px;
}

.student-item p {
  flex: 1;
  margin: 0;
}

.student-item span {
  margin-left: auto;
  padding: 10px 30px;
  border-radius: 50px;
  color: white;
}

.student-item.solvente span {
  background-color: #43cd5c;
}

.student-item.noSolvente span {
  background-color: #e7484b;
}

.actions {
  display: flex;
  gap: 0.5rem;
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
  
  .data-table th, .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
}

.form-input:required {
  border-left: 3px solid #1b9963;
}
</style>