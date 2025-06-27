<template>
  <div class="layout">
    <Sidebar :items="menuItems" />
    <div class="control-de-pagos">
      <header>
        <h1>Control de Pagos</h1>
        <button class="generate-pdf-btn" @click="generatePDF">Generar PDF</button>
      </header>
      <hr />
      <div class="filtrado">
        <input type="text" placeholder="Buscar..." v-model="searchQuery" />
        <div class="dropdown">
          <button @click="toggleDropdown" class="dropbtn">Grado</button>
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
      <div class="students-list">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-item"
          :class="{ solvente: student.status === 'Solvente', noSolvente: student.status === 'No Solvente' }"
          @click="navigateToStudentPayments(student.id)"
        >
          <p>{{ student.id }} - {{ student.name }} - {{ student.grade }}</p>
          <span>{{ student.status }}</span>
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
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  font-size: 70px;
  padding: 30px;
}

.generate-pdf-btn {
  background-color: #1b9963;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.generate-pdf-btn:hover {
  background-color: #158a50;
}

.control-de-pagos {
  flex: 1;
  padding: 20px;
}

.layout {
  display: flex;
  height: 100vh;
}

.filtrado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
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
</style>