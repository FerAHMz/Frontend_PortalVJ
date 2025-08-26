<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />

    <main class="planifications-container">
      <h1 class="page-title">Planificaciones por Grado</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando planificaciones...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchData" class="retry-btn">Reintentar</button>
      </div>

      <!-- Grades List -->
      <div v-else class="grades-section">
        <div v-if="grados.length === 0" class="no-data">
          <p>No tienes grados asignados.</p>
        </div>
        <div v-else class="grades-grid">
          <div 
            v-for="grado in grados" 
            :key="grado.id"
            class="grade-card"
            @click="selectGrado(grado)"
          >
            <div class="grade-header">
              <h3>{{ grado.grado }}</h3>
              <div class="grade-icon">📚</div>
            </div>
            <div class="grade-stats">
              <p>{{ getCursosCount(grado.id) }} cursos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grade Detail Modal -->
      <div v-if="showGradeModal" class="modal-overlay" @click="closeGradeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedGrado?.grado }} - Cursos y Planificaciones</h2>
            <button @click="closeGradeModal" class="close-btn">&times;</button>
          </div>
          
          <div v-if="loadingCourses" class="modal-loading">
            <div class="loading-spinner"></div>
            <p>Cargando cursos...</p>
          </div>
          
          <div v-else class="modal-body">
            <div v-if="cursos.length === 0" class="no-courses">
              <p>No hay cursos disponibles para este grado.</p>
            </div>
            <div v-else class="courses-list">
              <div 
                v-for="curso in cursos" 
                :key="curso.id"
                class="course-item"
                @click="goToPlanifications(curso)"
              >
                <div class="course-info">
                  <h4>{{ curso.materia }}</h4>
                  <p>Sección: {{ curso.seccion }}</p>
                </div>
                <div class="course-action">
                  <BookOpen class="icon" />
                  <span>Ver Planificaciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <NotificationDialog />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import NotificationDialog from '@/components/dialogs/NotificationDialog.vue';
import directorService from '@/services/gradeDirectorService';
import { useNotifications } from '@/utils/useNotifications.js';
import { useRouter } from 'vue-router';
import { User, BookOpen, BarChart3, Users } from 'lucide-vue-next';

const router = useRouter();
const { showNotification } = useNotifications();

// Reactive data
const loading = ref(true);
const error = ref(null);
const grados = ref([]);
const cursos = ref([]);
const showGradeModal = ref(false);
const selectedGrado = ref(null);
const loadingCourses = ref(false);

// Menu items for director
const menuItems = [
  { label: 'Perfil', icon: User, path: '/director' },
  { label: 'Gestión Académica', icon: BookOpen, path: '/director/academic' },
  { label: 'Planificaciones', icon: BookOpen, path: '/director/planifications' },
  { label: 'Reportes', icon: BarChart3, path: '/director/reports' },
  { label: 'Personal', icon: Users, path: '/director/staff' }
];

// Computed properties
const getCursosCount = (gradoId) => {
  return cursos.value.filter(curso => curso.id_grado === gradoId).length;
};

// Methods
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const gradosData = await directorService.getGradosDelDirector();
    grados.value = gradosData;
    
    // Load all courses for all grades
    const cursosPromises = gradosData.map(grado => 
      directorService.getCursosPorGrado(grado.id)
    );
    const cursosResults = await Promise.all(cursosPromises);
    cursos.value = cursosResults.flat();
    
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = err.response?.data?.message || 'Error al cargar los datos';
    showNotification('error', 'Error', error.value);
  } finally {
    loading.value = false;
  }
};

const selectGrado = async (grado) => {
  try {
    selectedGrado.value = grado;
    showGradeModal.value = true;
    loadingCourses.value = true;
    
    // Filter courses for this grade (already loaded)
    const gradeCourses = cursos.value.filter(curso => curso.id_grado === grado.id);
    
    if (gradeCourses.length === 0) {
      // If no courses found in cached data, try fetching again
      const cursosData = await directorService.getCursosPorGrado(grado.id);
      cursos.value = [...cursos.value.filter(c => c.id_grado !== grado.id), ...cursosData];
    }
    
  } catch (err) {
    console.error('Error fetching courses:', err);
    showNotification('error', 'Error', 'Error al cargar los cursos del grado');
  } finally {
    loadingCourses.value = false;
  }
};

const closeGradeModal = () => {
  showGradeModal.value = false;
  selectedGrado.value = null;
  loadingCourses.value = false;
};

const goToPlanifications = (curso) => {
  // Navigate to the course planifications
  router.push({
    name: 'PlanningCourseDir',
    params: { courseId: curso.id }
  });
};

const handleItemClick = (item) => {
  if (item.action === 'logout') {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/login');
  } else if (item.path) {
    router.push(item.path);
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.planifications-container {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 2rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  color: #dc2626;
}

.error-message {
  margin-bottom: 1rem;
  font-weight: 500;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #2563eb;
}

.no-data {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  font-style: italic;
}

.grades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.grade-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.grade-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  border-color: #3b82f6;
}

.grade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.grade-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.grade-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.grade-stats {
  color: #6b7280;
  font-size: 1rem;
}

.grade-stats p {
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px rgba(0,0,0,0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

.modal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.no-courses {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-item:hover {
  background: #e2e8f0;
  border-color: #3b82f6;
  transform: translateX(4px);
}

.course-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.course-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.course-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-weight: 500;
}

.course-action .icon {
  width: 20px;
  height: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .planifications-container {
    padding: 1rem;
  }

  .grades-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .grade-card {
    padding: 1.5rem;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .course-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .course-action {
    align-self: flex-end;
  }
}
</style>
