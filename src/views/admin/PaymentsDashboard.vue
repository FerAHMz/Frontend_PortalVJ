<template>
  <div class="layout">
    <Sidebar :items="menuItems" />
    <div class="control-de-pagos">
      <header>
        <h1>Control de Pagos</h1>
        <button class="generate-pdf-btn" @click="generatePDF">
          <span class="btn-text">Generar PDF</span>
          <span class="btn-text-mobile">PDF</span>
        </button>
      </header>
      <hr />
      
      <!-- Filtros principales -->
      <div class="filtrado">
        <input type="text" placeholder="Buscar..." v-model="searchQuery" />
        <div class="dropdown">
          <button @click="toggleDropdown" class="dropbtn">
            <span>Grado</span>
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
          <div v-show="dropdownVisible" class="dropdown-content">
            <a href="#" @click.prevent="filterByGrade(null)">Todos los Grados</a>
            <a
              v-for="grade in grades"
              :key="grade.id"
              href="#"
              @click.prevent="filterByGrade(grade.grado)"
            >
              {{ grade.grado }}
            </a>
          </div>
        </div>
      </div>

      <!-- Filtros adicionales -->
      <div class="additional-filters">
        <input
          type="text"
          placeholder="Carnet"
          v-model="carnetQuery"
          @input="filterByCarnet"
        />
        <input type="date" placeholder="Fecha Inicio" aria-label="Fecha Inicio" />
        <input type="date" placeholder="Fecha Fin" aria-label="Fecha Fin" />
      </div>

      <!-- Lista de estudiantes -->
      <div class="students-list">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-item"
          :class="{ solvente: student.status === 'Solvente', noSolvente: student.status === 'No Solvente' }"
          @click="navigateToStudentPayments(student.id)"
        >
          <div class="student-info">
            <p class="student-details">
              <span class="student-id">{{ student.id }}</span>
              <span class="student-name">{{ student.name }}</span>
              <span class="student-grade">{{ student.grade }}</span>
            </p>
          </div>
          <div class="student-status">
            <span>{{ student.status }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <ErrorDialog
      :show="showTokenAlert"
      :errors="tokenErrors"
      @close="showTokenAlert = false"
    />

    <NotificationDialog />
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import ErrorDialog from '@/components/dialogs/ErrorDialog.vue'
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
import { ref, computed, onMounted } from 'vue'
import { User, CreditCard } from 'lucide-vue-next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRouter } from 'vue-router'
import { useNotifications } from '@/utils/useNotifications'

const { showNotification } = useNotifications()

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token  && !tokenAlertShown) {
    tokenErrors.value = ['No está autenticado']
    showTokenAlert.value = true
    tokenAlertShown = true;
    return null
  }
  return token;
};

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const dropdownVisible = ref(false)
const searchQuery = ref('')
const selectedGrade = ref(null)
const students = ref([])
const grades = ref([])
const carnetQuery = ref('')
let tokenAlertShown = false;
const showTokenAlert = ref(false)
const tokenErrors = ref([])

const fetchStudents = async () => {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch('http://localhost:3000/api/payments/students-status')
    students.value = await response.json()
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

const fetchGrades = async () => {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch('http://localhost:3000/api/payments/grades');
    if (!response.ok) {
      throw new Error('Failed to fetch grades');
    }
    grades.value = await response.json();
    console.log('Grades fetched:', grades.value);
  } catch (error) {
    console.error('Error fetching grades:', error);
  }
}

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const filterByGrade = (grade) => {
  selectedGrade.value = grade
}

const filterByCarnet = () => {
  filteredStudents.value = students.value.filter((student) => {
    const matchesCarnet = carnetQuery.value
      ? student.id.toString().includes(carnetQuery.value)
      : true;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesGrade = selectedGrade.value ? student.grade === selectedGrade.value : true;
    return matchesCarnet && matchesSearch && matchesGrade;
  });
};

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCarnet = carnetQuery.value
      ? student.id.toString().includes(carnetQuery.value)
      : true;
    const matchesGrade = selectedGrade.value ? student.grade === selectedGrade.value : true;
    return matchesSearch && matchesCarnet && matchesGrade;
  });
});

const generatePDF = async () => {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch('http://localhost:3000/api/payments/full-report', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al generar el reporte');
    }

    const doc = new jsPDF();
    doc.text('Reporte Completo de Pagos', 14, 10);

    // Payment Details Table
    autoTable(doc, {
      startY: 20,
      head: [['Carnet', 'Nombre Estudiante', 'Grado', 'Monto', 'Mes Pagado', 'Fecha de Pago']],
      body: data.payments.map((payment) => [
        payment.carnet,
        payment.student,
        payment.grade,
        payment.amount,
        payment.month,
        payment.paymentDate,
      ]),
    });

    // Summary Table
    doc.addPage();
    doc.text('Resumen de Pagos por Grado', 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [['Grado', 'Estudiantes al Día']],
      body: data.summary.map((item) => [item.grade, item.upToDate]),
    });

    doc.save('reporte_completo_pagos.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    showNotification('Error al generar el PDF', 'error');
  }
};

const router = useRouter();

const navigateToStudentPayments = (studentId) => {
  router.push({
    path: '/admin/payments/registro-de-pagos',
    query: { carnet: studentId }
  });
};

onMounted(() => {
  fetchStudents()
  fetchGrades()
})
</script>

<style scoped>
/* Layout general */
.layout {
  display: flex;
  height: 100vh;
}

.control-de-pagos {
  flex: 1;
  padding: 20px;
  margin-left: 130px; /* Espacio para sidebar en desktop */
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

header h1 {
  font-size: clamp(2rem, 5vw, 4.5rem);
  padding: 0;
  margin: 0;
  line-height: 1.2;
  flex: 1;
  min-width: 200px;
}

.generate-pdf-btn {
  background-color: #1b9963;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
}

.generate-pdf-btn:hover {
  background-color: #158a50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 153, 99, 0.3);
}

.btn-text-mobile {
  display: none;
}

/* Separador */
hr {
  border: none;
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
}

/* Filtros principales */
.filtrado {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: stretch;
}

.filtrado > * {
  flex: 1;
  min-width: 0;
}

/* Filtros adicionales */
.additional-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  align-items: stretch;
}

.additional-filters > * {
  flex: 1;
  min-width: 0;
}

/* Inputs y botones */
input[type='text'],
input[type='date'] {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #d0d0d0;
  background-color: #f5f5f5;
  font-size: 16px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

input[type='text']:focus,
input[type='date']:focus {
  outline: none;
  border-color: #1b9963;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(27, 153, 99, 0.1);
}

/* Dropdown */
.dropdown {
  position: relative;
  display: block;
}

.dropbtn {
  background-color: #f5f5f5;
  color: #333;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #d0d0d0;
  cursor: pointer;
  border-radius: 12px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.dropbtn:hover,
.dropbtn:focus {
  background-color: #e8e8e8;
  border-color: #1b9963;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 100;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown:hover .dropdown-content,
.dropdown.open .dropdown-content {
  display: block;
}

.dropdown-content a {
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s ease;
}

.dropdown-content a:hover {
  background-color: #f0f9f4;
}

.dropdown-content a:first-child {
  border-radius: 12px 12px 0 0;
}

.dropdown-content a:last-child {
  border-radius: 0 0 12px 12px;
}

/* Lista de estudiantes */
.students-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.student-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #1b9963;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-details {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.student-id {
  font-weight: 700;
  color: #1b9963;
}

.student-name {
  color: #333;
}

.student-grade {
  color: #666;
  font-weight: 400;
}

.student-status {
  margin-left: 20px;
  flex-shrink: 0;
}

.student-status span {
  padding: 8px 16px;
  border-radius: 25px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.student-item.solvente .student-status span {
  background-color: #22c55e;
}

.student-item.noSolvente .student-status span {
  background-color: #ef4444;
}

/* Responsive Design */

/* Tablet */
@media screen and (max-width: 1024px) {
  .control-de-pagos {
    padding: 15px;
  }

  header h1 {
    font-size: clamp(1.8rem, 4vw, 3rem);
  }

  .student-details {
    font-size: 16px;
  }
}

/* Mobile */
@media screen and (max-width: 768px) {
  .control-de-pagos {
    margin-left: 0; /* Eliminar margen del sidebar en móvil */
    padding: 15px 10px;
    padding-top: 80px; /* Espacio para el botón hamburguesa */
  }

  /* Header móvil */
  header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    text-align: center;
  }

  header h1 {
    font-size: clamp(1.5rem, 6vw, 2.5rem);
    text-align: center;
  }

  .generate-pdf-btn {
    align-self: center;
    min-width: 100px;
  }

  .btn-text {
    display: none;
  }

  .btn-text-mobile {
    display: inline;
  }

  /* Filtros en móvil */
  .filtrado,
  .additional-filters {
    flex-direction: column;
    gap: 12px;
  }

  .filtrado > *,
  .additional-filters > * {
    flex: none;
    width: 100%;
  }

  /* Input móvil */
  input[type='text'],
  input[type='date'],
  .dropbtn {
    padding: 14px 16px;
    font-size: 16px; 
  }

  /* Dropdown móvil */
  .dropdown-content {
    max-height: 150px;
  }

  /* Lista de estudiantes móvil */
  .student-item {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    gap: 12px;
  }

  .student-info {
    order: 1;
  }

  .student-status {
    order: 2;
    margin-left: 0;
    text-align: center;
  }

  .student-details {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    font-size: 16px;
  }

  .student-id {
    font-size: 18px;
  }

  .student-name {
    font-size: 16px;
  }

  .student-grade {
    font-size: 14px;
  }

  .student-status span {
    display: inline-block;
    width: 100%;
    padding: 10px 16px;
    font-size: 15px;
  }
}

/* Móvil pequeño */
@media screen and (max-width: 480px) {
  .control-de-pagos {
    padding: 10px 8px;
    padding-top: 75px;
  }

  header h1 {
    font-size: clamp(1.3rem, 7vw, 2rem);
  }

  .student-item {
    padding: 12px;
  }

  .student-details {
    font-size: 15px;
  }

  .student-id {
    font-size: 16px;
  }

  input[type='text'],
  input[type='date'],
  .dropbtn {
    padding: 12px 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>