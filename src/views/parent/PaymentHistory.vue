<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="text-page-title">Historial de Pagos</h1>
      <div class="separator"></div>
      
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

        <!-- Pagos pendientes - Solo se muestra cuando no hay filtros de fecha activos -->
        <div v-if="selectedChild && !hasDateFilters && pendingPayments && pendingPayments.length > 0" class="pending-payments">
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
        </div>

        <!-- Mensaje cuando está al día - Solo se muestra cuando no hay filtros de fecha activos -->
        <div v-else-if="selectedChild && !hasDateFilters && pendingPayments && pendingPayments.length === 0" class="up-to-date">
          <h3>¡Al día con los pagos!</h3>
          <p>No hay pagos pendientes para los meses transcurridos del año actual.</p>
        </div>

        <!-- Mensaje informativo cuando hay filtros de fecha activos -->
        <div v-else-if="selectedChild && hasDateFilters" class="date-filter-info">
          <h3>Búsqueda por rango de fechas</h3>
          <p>Mostrando pagos del período seleccionado. Los pagos pendientes del año actual se ocultan durante la búsqueda histórica.</p>
        </div>

        <!-- Tabla de historial de pagos - Vista escritorio -->
        <div v-if="selectedChild && payments.length > 0" class="payment-table-container desktop-table">
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

        <!-- Vista móvil - Cards de pagos -->
        <div v-if="selectedChild && payments.length > 0" class="mobile-payments">
          <h3>Historial Detallado</h3>
          <div class="payments-grid">
            <div 
              v-for="payment in payments" 
              :key="payment.id" 
              class="payment-card"
              :class="getPaymentRowClass(payment)"
            >
              <div class="payment-header">
                <div class="payment-month">{{ payment.mes }}</div>
                <div class="payment-status">
                  <span :class="getStatusClass(payment.estado_descriptivo)">
                    {{ payment.estado_descriptivo }}
                  </span>
                </div>
              </div>
              
              <div class="payment-details">
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span class="detail-value">{{ formatDate(payment.fecha_pago) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Monto:</span>
                  <span class="detail-value amount">Q{{ formatCurrency(payment.monto) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">No. Boleta:</span>
                  <span class="detail-value">{{ payment.no_boleta }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Método:</span>
                  <span class="detail-value">{{ payment.metodo_pago }}</span>
                </div>
              </div>
            </div>
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

// Variable computada para detectar si hay filtros de fecha activos
const hasDateFilters = computed(() => {
  return startDate.value || endDate.value
})

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
  min-height: 100vh;
}

.profile-container {
  flex: 1;
  padding: 2rem;
  background-color: white;
  margin-left: 130px; /* Espacio para sidebar en escritorio */
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
  flex: 1;
  min-width: 180px;
}

.date-input-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 100%;
}

.date-input:focus {
  outline: none;
  border-color: #1b9963;
}

.btn-clear {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  height: fit-content;
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

.card-content {
  display: flex;
  flex-direction: column;
  width: 100%;
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

.date-filter-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  background: #d1ecf1;
  text-align: center;
}

.date-filter-info h3 {
  margin: 0 0 0.5rem 0;
  color: #0c5460;
  font-size: 1.1rem;
}

.date-filter-info p {
  margin: 0;
  color: #0c5460;
  font-size: 0.9rem;
}

/* Vista tabla para escritorio */
.desktop-table {
  display: block;
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
  white-space: nowrap;
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

/* Vista móvil - Cards */
.mobile-payments {
  display: none;
}

.payments-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.payment-month {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.payment-details {
  padding: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  font-size: 0.9rem;
}

.detail-value.amount {
  font-weight: bold;
  color: #1b9963;
}

/* Estados de pago */
.status-paid {
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-partial {
  background: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-invalid {
  background: #f8d7da;
  color: #721c24;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-pending {
  background: #e2e3e5;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.no-payments, .select-child-message {
  padding: 2rem;
  text-align: center;
  color: #666;
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

/* Responsive Design */
@media screen and (max-width: 768px) {
  .profile-container {
    margin-left: 0; /* Quitar margen en móvil */
    padding: 1rem;
    margin-top: 5.25rem;
  }

  .text-page-title {
    text-align: center;
  }

  .parent-info {
    padding: 1rem;
    margin-top: 1rem;
  }

  /* Filtros de fecha en móvil */
  .date-inputs {
    flex-direction: column;
    gap: 1rem;
  }

  .date-input-group {
    min-width: unset;
  }

  .btn-clear {
    width: 100%;
  }

  /* Cards de resumen más compactas */
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .summary-card {
    padding: 0.75rem;
  }

  .card-value {
    font-size: 1rem;
  }

  /* Ocultar tabla y mostrar cards en móvil */
  .desktop-table {
    display: none;
  }

  .mobile-payments {
    display: block;
  }

  .mobile-payments h3 {
    margin: 0 0 1rem 0;
    color: #1b9963;
    font-size: 1.1rem;
  }

  /* Meses pendientes más compactos */
  .pending-months {
    justify-content: center;
  }

  .pending-month {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }
}

/* Tablets */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .profile-container {
    padding: 18px;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-table {
    font-size: 0.85rem;
  }

  .payment-table th,
  .payment-table td {
    padding: 0.6rem;
  }
}

/* Pantallas pequeñas */
@media screen and (max-width: 480px) {
  .profile-container {
    padding: 0.75rem;
    margin-bottom: 0.8rem;
  }

  .parent-info {
    padding: 0.75rem;
  }

  .date-filters,
  .payment-summary,
  .pending-payments,
  .up-to-date,
  .date-filter-info {
    padding: 0.75rem;
  }

  .payment-header {
    padding: 0.75rem;
  }

  .payment-details {
    padding: 0.75rem;
  }

  .detail-row {
    margin-bottom: 0.75rem;
  }

  .summary-card {
    padding: 0.5rem;
  }
}
</style>
