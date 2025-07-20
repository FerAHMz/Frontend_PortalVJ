<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="page-title">Historial de Pagos</h1>
      
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      
      <div v-if="!loading && !error" class="parent-info">
        <!-- Selector de hijo -->
        <SelectChild v-if="children.length" :children="children" @child-selected="handleChildSelected" />
        <div v-else class="no-children">No se encontraron estudiantes asociados a su cuenta.</div>

        <!-- Filtros de fecha -->
        <div v-if="selectedChild" class="date-filters">
          <h3>Filtrar por fechas</h3>
          <div class="date-inputs">
            <div class="date-input-group">
              <label for="startDate">Fecha inicial:</label>
              <input 
                id="startDate"
                type="date" 
                v-model="startDate" 
                @change="applyDateFilter"
                class="date-input"
              />
            </div>
            <div class="date-input-group">
              <label for="endDate">Fecha final:</label>
              <input 
                id="endDate"
                type="date" 
                v-model="endDate" 
                @change="applyDateFilter"
                class="date-input"
              />
            </div>
            <button 
              @click="clearDateFilter" 
              class="btn-clear"
              :disabled="!startDate && !endDate"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <!-- Resumen de pagos -->
        <div v-if="selectedChild && paymentSummary" class="payment-summary">
          <h3>Resumen de Pagos</h3>
          <div class="summary-cards">
            <div class="summary-card total">
              <div class="card-content">
                <span class="card-label">Total Pagado</span>
                <span class="card-value">Q{{ formatCurrency(paymentSummary.total_pagado) }}</span>
              </div>
            </div>
            <div class="summary-card payments">
              <div class="card-content">
                <span class="card-label">Pagos Realizados</span>
                <span class="card-value">{{ paymentSummary.pagos_realizados }}</span>
              </div>
            </div>
            <div class="summary-card partial" v-if="paymentSummary.pagos_parciales > 0">
              <div class="card-content">
                <span class="card-label">Pagos Parciales</span>
                <span class="card-value">{{ paymentSummary.pagos_parciales }}</span>
              </div>
            </div>
            <div class="summary-card invalid" v-if="paymentSummary.pagos_invalidados > 0">
              <div class="card-content">
                <span class="card-label">Pagos Invalidados</span>
                <span class="card-value">{{ paymentSummary.pagos_invalidados }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagos pendientes -->
        <div v-if="selectedChild && pendingPayments && pendingPayments.length > 0" class="pending-payments">
          <h3>Pagos Pendientes ({{ pendingPayments.length }} meses)</h3>
          <div class="pending-months">
            <span 
              v-for="month in pendingPayments" 
              :key="month" 
              class="pending-month"
            >
              {{ month }}
            </span>
          </div>
          <p class="payment-info">
            <strong>Nota:</strong> Solo se muestran los meses transcurridos del año actual. 
            Monto mensual esperado: <strong>Q500.00</strong>
          </p>
        </div>

        <!-- Mensaje cuando está al día -->
        <div v-else-if="selectedChild && pendingPayments && pendingPayments.length === 0" class="up-to-date">
          <h3>¡Al día con los pagos!</h3>
          <p>No hay pagos pendientes para los meses transcurridos del año actual.</p>
        </div>

        <!-- Tabla de historial de pagos -->
        <div v-if="selectedChild && payments.length > 0" class="payment-table-container">
          <h3>Historial Detallado</h3>
          <div class="table-wrapper">
            <table class="payment-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Fecha de Pago</th>
                  <th>Monto</th>
                  <th>No. Boleta</th>
                  <th>Método de Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in payments" :key="payment.id" :class="getPaymentRowClass(payment)">
                  <td>{{ payment.mes }}</td>
                  <td>{{ formatDate(payment.fecha_pago) }}</td>
                  <td class="amount">Q{{ formatCurrency(payment.monto) }}</td>
                  <td>{{ payment.no_boleta }}</td>
                  <td>{{ payment.metodo_pago }}</td>
                  <td>
                    <span :class="getStatusClass(payment.estado_descriptivo)">
                      {{ payment.estado_descriptivo }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Estado cuando no hay pagos -->
        <div v-else-if="selectedChild && !loading && payments.length === 0" class="no-payments">
          <h3>No hay pagos registrados</h3>
          <p v-if="startDate || endDate">
            No se encontraron pagos en el rango de fechas seleccionado.
          </p>
          <p v-else>
            Aún no se han registrado pagos para este estudiante.
          </p>
        </div>

        <!-- Mensaje cuando no se ha seleccionado hijo -->
        <div v-else-if="!selectedChild && !loading" class="select-child-message">
          <h3>Seleccione un estudiante</h3>
          <p>Seleccione un estudiante para ver su historial de pagos.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import SelectChild from './SelectChild.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, BookOpen, FileText, MessageSquare, CreditCard, CalendarDays } from 'lucide-vue-next'
import { parentService } from '@/services/parentService.js'
import { profileService } from '@/services/profileService.js'

const router = useRouter()
const loading = ref(false)
const error = ref(null)
const children = ref([])
const selectedChild = ref(null)
const payments = ref([])
const paymentSummary = ref(null)
const pendingPayments = ref([])
const startDate = ref('')
const endDate = ref('')

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' },
  { label: 'Calendario', icon: CalendarDays, path: '/parent/calendar' }
]

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

const fetchChildren = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await profileService.getCurrentUserProfile()
    if (response.success && response.user && response.user.estudiante) {
      children.value = [response.user.estudiante]
    } else {
      children.value = []
    }
  } catch (err) {
    console.error('Error fetching children:', err)
    error.value = 'Error al cargar la lista de estudiantes'
  } finally {
    loading.value = false
  }
}

const fetchPaymentHistory = async () => {
  if (!selectedChild.value) return
  
  try {
    loading.value = true
    error.value = null
    
    const response = await parentService.getChildPaymentHistory(
      selectedChild.value.carnet, 
      startDate.value || null, 
      endDate.value || null
    )
    
    if (response.success) {
      payments.value = response.payments
      paymentSummary.value = response.summary
    } else {
      throw new Error('Error al obtener el historial de pagos')
    }
  } catch (err) {
    console.error('Error fetching payment history:', err)
    error.value = 'Error al cargar el historial de pagos'
  } finally {
    loading.value = false
  }
}

const fetchPendingPayments = async () => {
  if (!selectedChild.value) return
  
  try {
    const response = await parentService.getChildPendingPayments(selectedChild.value.carnet)
    if (response.success) {
      pendingPayments.value = response.pendingMonths
    }
  } catch (err) {
    console.error('Error fetching pending payments:', err)
  }
}

const handleChildSelected = async (child) => {
  selectedChild.value = child
  if (child) {
    await Promise.all([
      fetchPaymentHistory(),
      fetchPendingPayments()
    ])
  } else {
    payments.value = []
    paymentSummary.value = null
    pendingPayments.value = []
  }
}

const onChildChange = async () => {
  if (selectedChild.value) {
    await Promise.all([
      fetchPaymentHistory(),
      fetchPendingPayments()
    ])
  } else {
    payments.value = []
    paymentSummary.value = null
    pendingPayments.value = []
  }
}

const applyDateFilter = async () => {
  if (selectedChild.value) {
    await fetchPaymentHistory()
  }
}

const clearDateFilter = async () => {
  startDate.value = ''
  endDate.value = ''
  if (selectedChild.value) {
    await fetchPaymentHistory()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return parseFloat(amount).toFixed(2)
}

const getPaymentRowClass = (payment) => {
  return {
    'payment-valid': payment.estado_descriptivo === 'Pagado',
    'payment-partial': payment.estado_descriptivo === 'Pago Parcial',
    'payment-invalid': payment.estado_descriptivo === 'Invalidado'
  }
}

const getStatusClass = (status) => {
  return {
    'status-paid': status === 'Pagado',
    'status-partial': status === 'Pago Parcial',
    'status-invalid': status === 'Invalidado',
    'status-pending': status === 'Pendiente'
  }
}

onMounted(async () => {
  await fetchChildren()
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.profile-container {
  flex: 1;
  padding: 20px;
  background-color: white;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000000;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #000000;
  padding-bottom: 0.5rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.loading {
  color: #1b9963;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.parent-info {
  margin-top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.date-filters {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.date-filters h3 {
  margin: 0 0 1rem 0;
  color: #1b9963;
  font-size: 1.1rem;
}

.date-inputs {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.date-input-group {
  display: flex;
  flex-direction: column;
}

.date-input-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
}

.date-input:focus {
  outline: none;
  border-color: #1b9963;
}

.btn-clear {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-clear:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-summary {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.payment-summary h3 {
  margin: 0 0 1rem 0;
  color: #1b9963;
  font-size: 1.1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
  background: white;
}

.summary-card.total {
  border-left-color: #28a745;
}

.summary-card.payments {
  border-left-color: #007bff;
}

.summary-card.partial {
  border-left-color: #ffc107;
}

.summary-card.invalid {
  border-left-color: #dc3545;
}

.card-icon {
  font-size: 1.5rem;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.pending-payments {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  background: #f8d7da;
}

.pending-payments h3 {
  margin: 0 0 1rem 0;
  color: #721c24;
  font-size: 1.1rem;
}

.payment-info {
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  font-size: 0.85rem;
  color: #495057;
}

.pending-months {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pending-month {
  background: white;
  color: #721c24;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid #f5c6cb;
}

.up-to-date {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  background: #d4edda;
  text-align: center;
}

.up-to-date-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.up-to-date h3 {
  margin: 0 0 0.5rem 0;
  color: #155724;
  font-size: 1.1rem;
}

.up-to-date p {
  margin: 0;
  color: #155724;
  font-size: 0.9rem;
}

.payment-table-container {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.payment-table-container h3 {
  margin: 0;
  padding: 1rem;
  background: #f8f9fa;
  color: #1b9963;
  font-size: 1.1rem;
  border-bottom: 1px solid #e9ecef;
}

.table-wrapper {
  overflow-x: auto;
}

.payment-table {
  width: 100%;
  border-collapse: collapse;
}

.payment-table th {
  background: #1b9963;
  color: white;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
}

.payment-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
}

.payment-table tbody tr:hover {
  background: #f8f9fa;
}

.payment-table .amount {
  font-weight: 600;
  text-align: right;
}

.payment-valid {
  background: rgba(212, 237, 218, 0.3);
}

.payment-partial {
  background: rgba(255, 243, 205, 0.3);
}

.payment-invalid {
  background: rgba(248, 215, 218, 0.3);
}

.status-paid {
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-partial {
  background: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-invalid {
  background: #f8d7da;
  color: #721c24;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #e2e3e5;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.no-payments, .select-child-message {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.no-payments-icon, .select-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.no-payments h3, .select-child-message h3 {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.no-payments p, .select-child-message p {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .payment-table {
    font-size: 0.8rem;
  }
  
  .payment-table th,
  .payment-table td {
    padding: 0.5rem;
  }
}
</style>
