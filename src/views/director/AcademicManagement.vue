<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="academic-container">
      <h1 class="page-title">Gestión Académica</h1>

      <div class="grades-menu">
        <button
          v-for="grado in grados"
          :key="grado.id"
          @click="selectGrado(grado)"
          :class="['grade-btn', { active: selectedGrado?.id === grado.id }]"
        >
          {{ grado.grado }}
        </button>
      </div>

      <div v-if="selectedGrado" class="courses-list">
        <h2>Cursos de {{ selectedGrado.grado }}</h2>
        <div class="course-cards">
          <div v-for="curso in cursosFiltrados" :key="curso.id" class="course-card">
            <div>
              <strong>{{ curso.materia }}</strong><br />
              Sección: {{ curso.seccion }}
            </div>
            <button class="btn primary" @click="goToPlanning(curso)">
              Ver Planificación
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import { User, BookOpen, BarChart3, Users } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications'
import directorService from '@/services/gradeDirectorService'
const router = useRouter()
const { showNotification } = useNotifications()
const grados = ref([])
const cursos = ref([])
const selectedGrado = ref(null)
const menuItems = [
  { label: 'Perfil', icon: User, path: '/director' },
  { label: 'Gestión Académica', icon: BookOpen, path: '/director/academic' },
  { label: 'Reportes', icon: BarChart3, path: '/director/reports' },
  { label: 'Personal', icon: Users, path: '/director/staff' }
]
const handleItemClick = (item) => {
  if (item.path) router.push(item.path)
}
const selectGrado = async (grado) => {
  selectedGrado.value = grado
  try {
    const cursosData = await directorService.getCursosPorGrado(grado.id)
    console.log('Cursos recibidos del backend:', cursosData)
    cursos.value = cursosData
  } catch (err) {
    showNotification('error', 'Error', 'No se pudieron cargar los cursos del grado')
    console.error(err)
  }
}
const goToPlanning = (curso) => {
  sessionStorage.setItem('currentCourse', JSON.stringify(curso))
  router.push({ name: 'PlanningCourseDir',  params: { courseId: String(curso.id) } })
}
const fetchData = async () => {
  try {
    const gradosData = await directorService.getGradosDelDirector()
    grados.value = gradosData
    console.log('Grados cargados:', gradosData)
    if (gradosData.length > 0) {
      selectGrado(gradosData[0])
    }
  } catch (err) {
    showNotification('error', 'Error', 'No se pudieron cargar los grados')
    console.error(err)
  }
}
const cursosFiltrados = computed(() =>
  selectedGrado.value
    ? cursos.value.filter(c => c.id_grado === selectedGrado.value.id)
    : []
)
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.academic-container {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
}
.page-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}
.grades-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.grade-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}
.grade-btn:hover,
.grade-btn.active {
  background-color: #1b9963;
  color: white;
}
.courses-list h2 {
  margin-bottom: 1rem;
  color: #444;
}
.course-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.course-card {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column; 
  justify-content: space-between;
  align-items: flex-start; 
  min-height: 80px;
  gap: 1rem;
}
.course-card > div {
  font-size: 1rem;
  color: #333;
  line-height: 1.4;
}
.btn.primary {
  background-color: #1b9963;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn.primary:hover {
  background-color: #158a50;
}
.course-card .btn.primary {
  align-self: stretch; 
  text-align: center;
}
</style>