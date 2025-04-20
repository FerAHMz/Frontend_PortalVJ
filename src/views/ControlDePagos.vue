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
            <a href="#" @click.prevent="filterByGrade('Primero Básico')">Primero Básico</a>
            <a href="#" @click.prevent="filterByGrade('Segundo Básico')">Segundo Básico</a>
            <a href="#" @click.prevent="filterByGrade('Tercero Básico')">Tercero Básico</a>
          </div>
        </div>
      </div>
      <div class="additional-filters">
        <input type="text" placeholder="Carnet" />
        <input type="date" placeholder="Fecha Inicio" />
        <input type="date" placeholder="Fecha Fin" />
      </div>
      <div class="students-list">
        <div 
          v-for="student in filteredStudents" 
          :key="student.id" 
          class="student-item"
          :class="{ solvente: student.status === 'Solvente', noSolvente: student.status === 'No Solvente' }"
        >
          <p>{{ student.name }}</p>
          <span>{{ student.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref, computed, onMounted } from 'vue'
import { User, CreditCard } from 'lucide-vue-next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const dropdownVisible = ref(false)
const searchQuery = ref('')
const selectedGrade = ref(null)
const students = ref([])

const fetchStudents = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/payments/students')
    students.value = await response.json()
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const filterByGrade = (grade) => {
  selectedGrade.value = grade
}

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesGrade = selectedGrade.value ? student.grade === selectedGrade.value : true
    return matchesSearch && matchesGrade
  })
})

const generatePDF = async () => {
  try {
    const params = {
      searchQuery: searchQuery.value,
      grade: selectedGrade.value,
      startDate: document.querySelector('input[placeholder="Fecha Inicio"]').value,
      endDate: document.querySelector('input[placeholder="Fecha Fin"]').value,
    }

    const response = await fetch('http://localhost:3000/api/payments/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al generar el reporte')
    }

    const doc = new jsPDF()
    doc.text('Reporte de Pagos', 14, 10)

    autoTable(doc, {
      head: [['Estudiante', 'Grado', 'Pagos Totales', 'Pagos Pendientes']],
      body: data.map((item) => [
        item.student,
        item.grade,
        item.totalPayments,
        item.pendingPayments,
      ]),
    })

    doc.save('reporte_pagos.pdf')
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error al generar el PDF')
  }
}

onMounted(fetchStudents)
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