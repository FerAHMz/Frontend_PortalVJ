<template>
  <div class="layout">
    <Sidebar :items="menuItems" />
    <div class="control-de-pagos">
      <header>
        <h1>Control de Pagos</h1>
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
      <div class="students-list">
        <Estudiante_PagoDetalle
          v-for="student in filteredStudents"
          :key="student.id"
          :name="student.name"
          :estado="student.estado"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Estudiante_PagoDetalle from '@/components/Estudiante_PagoDetalle.vue'
import { ref, computed, onMounted } from 'vue'
import { User, CreditCard } from 'lucide-vue-next'

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const dropdownVisible = ref(false)
const searchQuery = ref('')
const selectedGrade = ref(null)
const students = ref([])

// Fetch students and their payment statuses from the backend
const fetchStudents = async () => {
  try {
    const response = await fetch('http://localhost:3000/students-payments')
    const data = await response.json()
    students.value = data
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

// Toggle dropdown visibility
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

// Filter students by grade
const filterByGrade = (grade) => {
  selectedGrade.value = grade
}

// Computed property to filter students based on search query and selected grade
const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesGrade = selectedGrade.value ? student.grade === selectedGrade.value : true
    return matchesSearch && matchesGrade
  })
})

// Fetch students on component mount
onMounted(fetchStudents)
</script>

<style scoped>
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

.filtrado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.filtrado > * {
  flex: 1;
}

input[type='text'] {
  padding: 10px;
  border-radius: 15px;
  border: 1px solid #e9e9e9;
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
  background-color: #f1f1f1;
  min-width: 160px;
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

.students-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>