<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="profile-container">
      <h1 class="page-title">Tareas</h1>
      <div v-if="loading" class="loading">Cargando información...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-if="!loading && !error" class="parent-info">
        <SelectChild v-if="children.length" :children="children" @child-selected="handleChildSelected" />
        <div v-else class="no-children">No se encontraron estudiantes asociados a su cuenta.</div>
        <div v-if="selectedChild">
          <div class="materias-list">
            <label for="materia-select" class="materia-label">Seleccione una materia:</label>
            <select id="materia-select" v-model="selectedSubjectId" class="materia-select">
              <option disabled value="">Seleccione...</option>
              <option v-for="materia in materias" :key="materia.materia_id" :value="materia.materia_id">
                {{ materia.materia }} (Trimestre {{ materia.trimestre_id }})
              </option>
            </select>
          </div>
          <StudentTasks v-if="selectedSubjectId" :student="selectedChild" :subjectId="selectedSubjectId" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import SelectChild from './SelectChild.vue';
import StudentTasks from './StudentTasks.vue';
import { profileService } from '@/services/profileService.js';
import { parentService } from '@/services/parentService.js';
import { User, BookOpen, FileText, MessageSquare, CreditCard, CalendarDays } from 'lucide-vue-next';
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const children = ref([]);
const selectedChild = ref(null);
const materias = ref([]);
const selectedSubjectId = ref("");
const loading = ref(true);
const error = ref(null);

const menuItems = [
  { label: 'Perfil', icon: User, path: '/parent' },
  { label: 'Calificaciones', icon: FileText, path: '/parent/grades' },
  { label: 'Tareas', icon: BookOpen, path: '/parent/tasks' },
  { label: 'Pagos', icon: CreditCard, path: '/parent/payments' },
  { label: 'Comunicación', icon: MessageSquare, path: '/parent/messages' },
  { label: 'Calendario', icon: CalendarDays, path: '/parent/calendar' }
];

const handleItemClick = (item) => {
  if (item.path) router.push(item.path);
};

const handleChildSelected = (child) => {
  selectedChild.value = child;
  selectedSubjectId.value = "";
  materias.value = [];
  if (child) fetchMaterias(child.carnet);
};

const fetchUserProfile = async () => {
  loading.value = true;
  error.value = null;
  const response = await profileService.getCurrentUserProfile();
  if (response.success && response.user && response.user.estudiante) {
    children.value = [response.user.estudiante];
  } else {
    children.value = [];
  }
  loading.value = false;
  // Si viene por query seleccionada
  if (route.query.carnet && route.query.subjectId) {
    const child = children.value.find(c => c.carnet == route.query.carnet);
    if (child) {
      selectedChild.value = child;
      fetchMaterias(child.carnet, route.query.subjectId);
    }
  }
};

const fetchMaterias = async (carnet, preselectId) => {
  try {
    const res = await parentService.getStudentGrades(carnet);
    if (res.success) {
      materias.value = res.grades;
      if (preselectId) {
        selectedSubjectId.value = preselectId;
      }
    }
  } catch (err) {
    materias.value = [];
  }
};

onMounted(fetchUserProfile);

watch(selectedChild, (child) => {
  if (child) fetchMaterias(child.carnet);
});
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.profile-container {
  flex: 1;
  padding: 20px;
  background-color: white;
  overflow-x: auto;
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

.materias-list {
  margin-bottom: 1.5rem;
}

.materia-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.materia-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.materia-select:focus {
  outline: none;
  border-color: #00923f;
  box-shadow: 0 0 0 3px rgba(0, 146, 63, 0.1);
}

.materia-select:hover {
  border-color: #00923f;
}

.no-children { 
  text-align: center; 
  color: #666; 
  font-style: italic; 
}

/* Estilos responsive para tablets */
@media screen and (max-width: 1024px) {
  .profile-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .parent-info {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .materia-select {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
}

/* Estilos responsive para móviles */
@media screen and (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .profile-container {
    padding: 16px 12px;
    /* Agregar padding superior para el botón hamburguesa */
    padding-top: 80px;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    word-wrap: break-word;
  }
  
  .parent-info {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .materias-list {
    margin-bottom: 1rem;
  }
  
  .materia-label {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  .materia-select {
    padding: 0.8rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }
  
  .loading, .error {
    padding: 1.5rem 1rem;
    font-size: 1rem;
  }
  
  .error {
    margin: 0 -12px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}

/* Estilos para móviles pequeños */
@media screen and (max-width: 480px) {
  .profile-container {
    padding: 12px 8px;
    padding-top: 80px;
  }
  
  .page-title {
    font-size: 1.25rem;
    text-align: center;
  }
  
  .parent-info {
    padding: 0.75rem;
    border-radius: 6px;
  }
  
  .materias-list {
    margin-bottom: 0.75rem;
  }
  
  .materia-label {
    font-size: 0.85rem;
  }
  
  .materia-select {
    padding: 0.7rem;
    font-size: 0.85rem;
    border-width: 1px;
  }
  
  .loading, .error {
    padding: 1rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .no-children {
    font-size: 0.9rem;
    padding: 1rem;
  }
}

/* Animaciones suaves para transiciones */
@media screen and (min-width: 769px) {
  .profile-container {
    transition: padding 0.3s ease;
  }
}

/* Asegurar que el contenido no se superponga con el sidebar en móvil */
@media screen and (max-width: 768px) {
  .layout {
    position: relative;
  }
}
</style>