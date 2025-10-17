<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="academic-container">
      <h1 class="text-page-title">Gestión Académica</h1>
      <div class="separator"></div>

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
            <div class="course-info">
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
import { User, BookOpen, BarChart3, Users, Info } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications'
import { downloadDirectorInstructivePDF } from '@/composables/useDirectorInstructivePDF.js'
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
  { label: 'Personal', icon: Users, path: '/director/staff' },
  { label: 'Instructivo', icon: Info, action: 'downloadInstructive' }
]

const handleItemClick = (item) => {
  if (item.action === 'downloadInstructive') {
    downloadDirectorInstructivePDF()
  } else if (item.path) {
    router.push(item.path)
  }
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
  min-height: 100vh;
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
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.2;
}

.grade-btn:hover,
.grade-btn.active {
  background-color: #1b9963;
  color: white;
  border-color: #1b9963;
}

.courses-list h2 {
  margin-bottom: 1rem;
  color: #444;
  font-size: 1.4rem;
  font-weight: 600;
}

.course-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.course-card {
  border: 1px solid #ddd;
  padding: 1.2rem;
  border-radius: 8px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column; 
  justify-content: space-between;
  align-items: flex-start; 
  min-height: 100px;
  gap: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.course-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.course-info {
  font-size: 1rem;
  color: #333;
  line-height: 1.4;
  flex-grow: 1;
}

.course-info strong {
  color: #1b9963;
  font-size: 1.1rem;
}

.btn.primary {
  background-color: #1b9963;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  align-self: stretch; 
  text-align: center;
  font-size: 0.9rem;
}

.btn.primary:hover {
  background-color: #158a50;
  transform: translateY(-1px);
}

/* Estilos para tablets */
@media screen and (max-width: 1024px) {
  .academic-container {
    padding: 1.5rem;
  }
  
  .course-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .text-page-title {
    font-size: 1.6rem;
  }
}

/* Estilos para móviles */
@media screen and (max-width: 768px) {
  .academic-container {
    padding: 1rem;
  }
  
  .text-page-title {
    margin-top: 5.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .grades-menu {
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .grade-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: fit-content;
    max-width: none;
    text-align: center;
    line-height: 1.2;
  }
  
  .courses-list h2 {
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .course-cards {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .course-card {
    padding: 1rem;
    min-height: 90px;
  }
  
  .course-info {
    font-size: 0.95rem;
  }
  
  .course-info strong {
    font-size: 1rem;
  }
  
  .btn.primary {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}

/* Estilos para móviles pequeños */
@media screen and (max-width: 480px) {
  .academic-container {
    padding: 0.75rem;
  }
  
  .text-page-title {
    margin-bottom: 0.8rem;
  }
  
  .grades-menu {
    gap: 0.4rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .grade-btn {
    padding: 0.5rem 0.6rem;
    font-size: 0.75rem;
    flex: 1;
    min-width: fit-content;
    max-width: none;
    text-align: center;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .courses-list h2 {
    font-size: 1.1rem;
  }
  
  .course-card {
    padding: 0.8rem;
    min-height: 80px;
    gap: 0.8rem;
  }
  
  .course-info {
    font-size: 0.9rem;
  }
  
  .btn.primary {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
}

/* Animaciones suaves para transiciones */
@media (prefers-reduced-motion: no-preference) {
  .course-card {
    transition: all 0.3s ease;
  }
  
  .btn.primary {
    transition: all 0.2s ease;
  }
  
  .grade-btn {
    transition: all 0.2s ease;
  }
}
</style>
