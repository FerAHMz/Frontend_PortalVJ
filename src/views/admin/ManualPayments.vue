<template>
  <div class="layout">
    <Sidebar :items="menuItems" />

    <main class="control-de-pagos">
      <!-- Título de la página -->
      <h1 class="text-page-title">Registro de Pagos</h1>
      <div class="separator"></div>

      <!-- Zona superior: acciones y búsqueda -->
      <div class="crud-actions">
        <button @click="openCreateModal" class="action-btn create text-button">
          <Plus class="action-icon" />
          <span class="btn-text">Nuevo Pago</span>
        </button>

        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar..."
            class="search-input text-body"
          />
          <Search class="search-icon" />
        </div>
      </div>

      <!-- Vista de tabla para escritorio -->
      <div class="payments-table desktop-table">
        <table>
          <thead>
            <tr>
              <th class="text-small">Carnet</th>
              <th class="text-small">Nombre</th>
              <th class="text-small">Fecha de Pago</th>
              <th class="text-small">Mes pagado</th>
              <th class="text-small">Número de boleta</th>
              <th class="text-small">Monto</th>
              <th class="text-small">Grado</th>
              <th class="text-small">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id_pago">
              <td class="text-body">{{ student.id }}</td>
              <td class="text-body">{{ student.name }}</td>
              <td class="text-body">{{ student.fecha_pago }}</td>
              <td class="text-body">{{ student.mes_solvencia }}</td>
              <td class="text-body">{{ student.no_boleta }}</td>
              <td class="text-body">{{ student.monto }}</td>
              <td class="text-body">{{ student.grade }}</td>
              <td class="actions">
                <button @click="editPayment(student)" class="action-btn edit text-button">
                  <Edit class="action-icon" />
                </button>
                <button
                  @click="confirmInvalidatePayment(student)"
                  class="action-btn delete text-button"
                >
                  <Trash class="action-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vista de tarjetas para móvil -->
      <div class="mobile-cards">
        <div
          v-for="student in filteredStudents"
          :key="student.id_pago"
          class="payment-card"
        >
          <div class="card-header">
            <h3 class="student-name text-subsection-title">{{ student.name }}</h3>
            <span class="student-id text-small">{{ student.id }}</span>
          </div>

          <div class="card-body">
            <div class="card-row">
              <span class="label text-small">Fecha:</span>
              <span class="value text-body">{{ student.fecha_pago }}</span>
            </div>
            <div class="card-row">
              <span class="label text-small">Mes:</span>
              <span class="value text-body">{{ student.mes_solvencia }}</span>
            </div>
            <div class="card-row">
              <span class="label text-small">Boleta:</span>
              <span class="value text-body">{{ student.no_boleta }}</span>
            </div>
            <div class="card-row">
              <span class="label text-small">Monto:</span>
              <span class="value amount text-body">{{ student.monto }}</span>
            </div>
            <div class="card-row">
              <span class="label text-small">Grado:</span>
              <span class="value text-body">{{ student.grade }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button
              @click="editPayment(student)"
              class="action-btn edit mobile text-button"
            >
              <Edit class="action-icon" />
              <span>Editar</span>
            </button>
            <button
              @click="confirmInvalidatePayment(student)"
              class="action-btn delete mobile text-button"
            >
              <Trash class="action-icon" />
              <span>Invalidar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de creación/edición -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h2>{{ editingItem ? 'Editar Pago' : 'Nuevo Pago' }}</h2>
          <form @submit.prevent="saveItem">
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

            <div class="form-group">
              <label for="mes_solvencia">Mes pagado</label>
              <select v-model="formData.mes_solvencia" class="form-input" required>
                <option disabled value="">Seleccione un mes</option>
                <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="metodo_pago">Método de Pago</label>
              <select v-model="formData.id_metodo_pago" id="metodo_pago" class="form-input">
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

      <!-- Diálogo de confirmación con campo de razón -->
      <ConfirmationDialogInput
        v-if="showConfirmModal"
        :title="'Confirmar Invalidación'"
        :message="'¿Está seguro de invalidar este pago?'"
        :confirm-text="'Invalidar'"
        :cancel-text="'Cancelar'"
        :confirm-button-class="'delete'"
        :loading="deleting"
        @confirm="invalidateItem"
        @cancel="showConfirmModal = false"
      >
        <div class="form-group">
          <label for="razon">Razón de invalidación:</label>
          <textarea
            id="razon"
            v-model="razonInvalidacion"
            placeholder="Ingrese la razón"
            rows="3"
            class="form-input"
            required
          ></textarea>
        </div>
      </ConfirmationDialogInput>
    </main>

    <ErrorDialog
      :show="showTokenAlert"
      :errors="tokenErrors"
      @close="showTokenAlert = false"
    />
  </div>
</template>

<script setup>
/*  Importaciones y configuraciones  */
import Sidebar from '@/components/Sidebar.vue'
import ArrowBack from '@/components/common/ArrowBack.vue'
import { manualPaymentService } from '@/services/manualPaymentService'
import ErrorDialog from '@/components/dialogs/ErrorDialog.vue'
import ConfirmationDialogInput from '@/components/dialogs/ConfirmationDialogInput.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { User, CreditCard } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Trash, Search } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useNotifications } from '@/utils/useNotifications.js'

const { showNotification } = useNotifications()
const route = useRoute()

/*  Menú lateral  */
const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

/*  Datos para formularios   */
const headers = [
  { key: 'nombre_padre', title: 'Nombre del tutor', type: 'text' },
  { key: 'apellido_padre', title: 'Apellido del tutor', type: 'text' },
  { key: 'carnet_estudiante', title: 'Carnet del estudiante', type: 'text' },
  { key: 'fecha_pago', title: 'Fecha de pago', type: 'date' },
  { key: 'no_boleta', title: 'Número de boleta', type: 'text' },
  { key: 'monto', title: 'Monto', type: 'number', step: 0.01 }
]

const meses = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
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

/*  Estado reactivo   */
const searchQuery        = ref('')
const selectedGrade      = ref(null)
const students           = ref([])
const showModal          = ref(false)
const editingItem        = ref(null)
const formData           = ref({})
const showConfirmModal   = ref(false)
const itemToDelete       = ref(null)
const deleting           = ref(false)
const showTokenAlert     = ref(false)
const tokenErrors        = ref([])
const razonInvalidacion  = ref('')

/*  Computados  */
const filteredStudents = computed(() => {
  if (!Array.isArray(students.value)) return []
  return students.value.filter(s => {
    const q = searchQuery.value.toLowerCase()
    const coincideTexto =
      s.name.toLowerCase().includes(q) || s.id.toString().includes(q)
    const coincideGrado =
      !selectedGrade.value || s.grade === selectedGrade.value
    return coincideTexto && coincideGrado
  })
})

const editableHeaders = computed(() =>
  headers.filter(h => h.key !== 'id_metodo_pago')
)

/*  Funciones auxiliares  */
const getAuthToken = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    tokenErrors.value = ['No está autenticado']
    showTokenAlert.value = true
    return null
  }
  return token
}

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
  }
  editingItem.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

/* ------------- Peticiones ------------- */
const fetchPayments = async () => {
  const token = getAuthToken()
  if (!token) return

  try {
    const data = await manualPaymentService.getStudentsWithPayments()
    const carnetFilter = route.query.carnet
    students.value = carnetFilter
      ? data.filter(s => s.id.toString() === carnetFilter)
      : data
  } catch (e) {
    console.error('Error obteniendo pagos:', e)
  }
}

const saveItem = async () => {
  const token = getAuthToken()
  if (!token) return

  const validar = () => {
    const f = formData.value
    if (!f.nombre_padre?.trim())        throw new Error('Nombre del padre requerido')
    if (!f.apellido_padre?.trim())      throw new Error('Apellido del padre requerido')
    if (!f.carnet_estudiante?.trim())   throw new Error('Carnet requerido')
    if (!f.mes_solvencia?.trim())       throw new Error('Mes de solvencia requerido')
    if (!f.fecha_pago?.trim())          throw new Error('Fecha de pago requerida')
    if (!f.no_boleta?.trim())           throw new Error('Número de boleta requerido')
    if (!f.monto?.toString().trim())    throw new Error('Monto requerido')
  }

  try {
    validar()

    const pago = {
      nombre_padre      : formData.value.nombre_padre.trim(),
      apellido_padre    : formData.value.apellido_padre.trim(),
      carnet_estudiante : formData.value.carnet_estudiante.trim(),
      mes_solvencia     : formData.value.mes_solvencia.trim(),
      fecha_pago        : formData.value.fecha_pago.trim(),
      no_boleta         : formData.value.no_boleta.trim(),
      id_metodo_pago    : formData.value.id_metodo_pago,
      monto             : parseFloat(formData.value.monto)
    }

    if (editingItem.value) {
      await manualPaymentService.editPayment(editingItem.value.id, pago)
      showNotification('success', 'Éxito', 'Pago actualizado exitosamente')
    } else {
      await manualPaymentService.addPayment(pago)
      showNotification('success', 'Éxito', 'Pago agregado exitosamente')
    }

    await fetchPayments()
    closeModal()
  } catch (e) {
    console.error('Error guardando pago:', e)
    showNotification('error', 'Error', e.message || 'Error al guardar el pago')
  }
}

const editPayment = s => {
  if (!getAuthToken()) return
  formData.value = {
    nombre_padre      : s.nombre_padre || '',
    apellido_padre    : s.apellido_padre || '',
    carnet_estudiante : String(s.id || ''),
    mes_solvencia     : s.mes_solvencia || '',
    fecha_pago        : s.fecha_pago ? s.fecha_pago.slice(0,10) : '',
    no_boleta         : String(s.no_boleta || ''),
    id_metodo_pago    : s.id_metodo_pago || '',
    monto             : s.monto || ''
  }
  editingItem.value = { id: s.id_pago }
  showModal.value = true
}

const confirmInvalidatePayment = s => {
  itemToDelete.value = { id: s.id_pago }
  showConfirmModal.value = true
}

const invalidateItem = async () => {
  const token = getAuthToken()
  if (!token) return

  try {
    deleting.value = true
    if (!itemToDelete.value?.id)
      throw new Error('Datos de pago incompletos')
    if (!razonInvalidacion.value.trim()) {
      showNotification('warning', 'Atención', 'Debe ingresar una razón')
      return
    }

    // TODO: reemplazar con el usuario real
    const usuarioId   = 1
    const tipoUsuario = 'Administrativo'

    await manualPaymentService.invalidatePayment(itemToDelete.value.id, {
      razon       : razonInvalidacion.value,
      usuarioId,
      tipoUsuario
    })

    showNotification('success', 'Éxito', 'Pago invalidado exitosamente')
    await fetchPayments()
    showConfirmModal.value = false
    razonInvalidacion.value = ''
  } catch (e) {
    console.error('Error invalidando pago:', e)
    showNotification('error', 'Error', e.message || 'Error al invalidar pago')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchPayments)
</script>

<style scoped>
/*  Estilos base  */
.layout {
  display: flex;
  min-height: 100vh;
}

.control-de-pagos {
  flex: 1;
  padding: 2rem;
  max-width: 100%;
  overflow-x: hidden;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-top: 3.5rem; /* bajamos el título para que el menú no lo tape */
  margin-bottom: 1rem;
}

.separator {
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/*  Botones y acciones  */
.crud-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
}

.action-btn.create {
  background-color: #1b9963;
  color: #fff;
}

.action-btn.create:hover {
  background-color: #158a50;
}

.action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.action-btn.edit {
  background-color: #fd7e14;
  color: #fff;
  padding: 0.5rem;
}

.action-btn.edit:hover {
  background-color: #e96b00;
}

.action-btn.delete {
  background-color: #dc3545;
  color: #fff;
  padding: 0.5rem;
}

.action-btn.delete:hover {
  background-color: #bb2d3b;
}

.action-btn.mobile {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/*  Búsqueda  */
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

/*  Vista de tabla (escritorio) */
.desktop-table {
  display: block;
}

.mobile-cards {
  display: none;
}

.payments-table table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payments-table th,
.payments-table td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.payments-table th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.payments-table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
/*  Vista de tarjetas (móvil)  */
.payment-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.student-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.student-id {
  background-color: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
}

.card-body {
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  min-width: 60px;
}

.value {
  color: #333;
  font-size: 0.9rem;
  text-align: right;
  flex: 1;
}

.value.amount {
  font-weight: 600;
  color: #1b9963;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

/*  Modal  */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1b9963;
  box-shadow: 0 0 0 2px rgba(27, 153, 99, 0.1);
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
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.modal-btn.cancel:hover {
  background-color: #e9e9e9;
}

.modal-btn.save {
  background-color: #1b9963;
  color: #fff;
}

.modal-btn.save:hover {
  background-color: #158a50;
}

/*  Responsive   */

/*  Tablets (≤ 1023 px) */
@media (max-width: 1023px) {
  .control-de-pagos {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .crud-actions {
    flex-wrap: wrap;
  }

  .payments-table th,
  .payments-table td {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

/*  Tablets y portátiles pequeños (≤ 991 px) */
@media (max-width: 991px) {
  .layout {
    flex-direction: column;
  }

  .crud-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  /* Ancho auto para evitar la “píldora” verde */
  .action-btn.create {
    width: auto;
    justify-content: center;
  }
}

/*  Dispositivos móviles (≤ 767 px) */
@media (max-width: 767px) {
  .control-de-pagos {
    padding: 0.75rem;
  }

  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .separator {
    margin-bottom: 1rem;
  }

  .crud-actions {
    margin-bottom: 1.5rem;
  }

  /* Convertimos el botón en un círculo pequeño */
  .btn-text {
    display: none;
  }
  .action-btn.create {
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%;
    aspect-ratio: 1;
  }

  /* Ocultar tabla y mostrar tarjetas */
  .desktop-table {
    display: none;
  }
  .mobile-cards {
    display: block;
  }

  .modal-content {
    padding: 1.5rem;
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
  .modal-actions {
    flex-direction: column-reverse;
  }
  .modal-btn {
    width: 100%;
  }
  .card-actions {
    flex-direction: column;
  }
  .action-btn.mobile {
    width: 100%;
  }
}

/*  Móviles muy pequeños (≤ 480 px) */
@media (max-width: 480px) {
  .control-de-pagos {
    padding: 0.5rem;
  }
  .text-page-title {
    margin-bottom: 0.8rem;
  }
  .payment-card {
    padding: 1rem;
  }
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .student-name {
    font-size: 1rem;
  }
  .card-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .value {
    text-align: left;
  }
  /* Previene zoom en iOS */
  .search-input,
  .form-input {
    font-size: 16px;
  }
}
</style>
