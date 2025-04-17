<template>
  <div class="layout">
    <Sidebar :items="menuItems" />
    <main class="control-de-pagos">
      <h1 class="page-title">Control de Pagos</h1>
      <div class="separator"></div>
      
      <div class="controls">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar..." 
          class="search-input"
        />
        <select v-model="selectedGrade" class="grade-select">
          <option value="">Grado</option>
          <option v-for="grade in grades" :key="grade" :value="grade">
            {{ grade }}
          </option>
        </select>
      </div>

      <div class="payments-table">
        <table>
          <thead>
            <tr>
              <th>Carnet</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Grado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td>{{ student.id }}</td>
              <td>{{ student.name }}</td>
              <td :class="{ 'status-ok': student.estado === 'Al día', 'status-pending': student.estado === 'Pendiente' }">
                {{ student.estado }}
              </td>
              <td>{{ student.grade }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { User, CreditCard } from 'lucide-vue-next'
import axios from 'axios'

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const searchQuery = ref('')
const selectedGrade = ref('')
const grades = ref([])
const students = ref([])

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         student.id.toString().includes(searchQuery.value)
    const matchesGrade = !selectedGrade.value || student.grade === selectedGrade.value
    return matchesSearch && matchesGrade
  })
})

const fetchStudents = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/payments/students-payments')
    students.value = response.data
    grades.value = [...new Set(response.data.map(student => student.grade))].sort()
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

onMounted(() => {
  fetchStudents()
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.control-de-pagos {
  flex: 1;
  padding: 2rem;
  background: white;
  overflow: auto;
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
  width: 100%;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input,
.grade-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.grade-select {
  width: 150px;
}

.payments-table {
  margin: 2rem 0;
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

tr:hover {
  background-color: #f8f9fa;
}

.status-ok {
  color: #1b9963;
  font-weight: 600;
}

.status-pending {
  color: #dc3545;
  font-weight: 600;
}
</style>