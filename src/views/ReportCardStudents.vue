<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="report-card-container">
      <h1 class="page-title"> Boleta de calificaciones</h1>
      <div class="separator"></div>

      
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Ingrese el nombre del estudiante..."
            class="search-input"
          >
        </div>

      <div class="filters">
        <div class="filter-item">
          <label for="grade-select">Seleccione el grado y sección:</label>
          <select v-model="searchGradeYear.gradeSectionId" class="search-dropdown" @change="fetchStudents">
            <option v-for="item in gradeSections" :key="item.id_grado_seccion" :value="item.id_grado_seccion">
              {{ item.grado }} - {{ item.seccion }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label for="trimester-select">Seleccione el trimestre:</label>
          <select v-model="selectedTrimester" class="search-dropdown" @change="fetchStudents">
            <option value="Primer Trimestre">Primer trimestre</option>
            <option value="Segundo Trimestre">Segundo trimestre</option>
            <option value="Tercer Trimestre">Tercer trimestre</option>
            <option value="Cuarto Trimestre">Cuarto trimestre</option>
          </select>
        </div>

        <div class="filter-item">
          <label for="year-input">Año:</label>
          <input
            type="text"
            v-model="searchGradeYear.year"
            placeholder="Ingrese el año..."
            class="input-year"
            @keyup.enter="fetchStudents"
          >
        </div>
      </div>


      <div class="students-list">
        <div v-for="student in filteredStudents" :key="student.carnet" class="student-row">
          <div class="student-info">
            <span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
            <span class="student-id">Carnet: {{ student.carnet }}</span>
          </div>
          <div >
            <button @click="viewReportCard(student)" class="save-btn">
              Abrir boleta
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
  import reportCardService from '@/services/reportCardService'

  const route = useRoute()
  const router = useRouter()
  const students = ref([])
  const searchQuery = ref('')
  const gradeSections = ref([]);
  const selectedTrimester = ref('');

  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
  ]
  

//aca busqueda por nombre, apellido o carnet
  const filteredStudents = computed(() => {
    if (!searchQuery.value && !searchGradeYear.grado && !searchGradeYear.year) {
      return students.value;
    }
    const query = searchQuery.value.toLowerCase();
    return students.value.filter(student =>
      (searchGradeYear.grado ? student.grado_seccion_id === searchGradeYear.grado : true) &&
      (searchGradeYear.year ? student.year === searchGradeYear.year : true) &&
      (`${student.nombre} ${student.apellido}`.toLowerCase().includes(query) ||
      student.carnet.toString().includes(query))
    );
  });

  const searchGradeYear = ref({
    gradeSectionId: '', 
    year: ''  
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const viewReportCard = (student) => {
    sessionStorage.setItem('studentData', JSON.stringify(student))
  
    router.push({ 
      name: 'ReportCard', 
      params: { 
        carnet_estudiante: student.carnet 
      },
      query: {
        gradeSectionId: parseInt(searchGradeYear.value.gradeSectionId),
        trimestre: selectedTrimester.value,
        year: searchGradeYear.value.year
      }
    });
    console.log('debug',  parseInt(searchGradeYear.value.gradeSectionId), selectedTrimester.value, searchGradeYear.value.year);
  };

  const fetchStudents = async () => {

    try {
      const token = localStorage.getItem('token');
      const response = await reportCardService.fetchStudentsGradeSection(
        searchGradeYear.value.gradeSectionId,
        selectedTrimester.value, 
        parseInt(searchGradeYear.value.year)
      );

      students.value = response;
      console.log('Estudiantes cargados en Report Card:', students.value);
    } catch (error) {
      console.error('Error fetching students in report card:', error);
      alert('Error al cargar los estudiantes');
    }
  };

  onMounted(async () => {
    try {
      gradeSections.value = await reportCardService.fetchGradeSections();

      if (gradeSections.value.length > 0) {
        searchGradeYear.value.gradeSectionId = gradeSections.value[0].id_grado_seccion;
      }

      selectedTrimester.value = 'Primer Trimestre';

      const currentYear = new Date().getFullYear();
      searchGradeYear.value.year = currentYear;

      fetchStudents(); 
    } catch (error) {
      console.error('Error al cargar grados y secciones:', error);
    }
  });

  const handleItemClick = (path) => {
    if (path) {
      router.push(path)
    }
  }

</script>

<style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
  }
  
  .report-card-container {
    flex: 1;
    padding: 2rem;
    margin-left: 130px;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 0.5rem;
  }
  
  .course-subtitle {
    color: #555;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  
  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
  }
  
  .search-container {
    margin-bottom: 2rem;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 2rem;
    align-items: flex-end;
  }

  .filter-item {
    display: flex;
    flex-direction: column; 
    gap: 0.5rem;
  }

  .search-dropdown,
  .input-year {
    padding: 0.5rem;
    font-size: 1rem;
    width: 220px; 
  }

  .filter-item label {
    display: block;       
    margin-bottom: 0.5rem; 
  }

  
  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .input-year {
    width: 100%;
    max-width: 150px;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .search-dropdown {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .students-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .student-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .student-info {
    display: flex;
    flex-direction: column;
  }
  
  .student-name {
    font-weight: 500;
  }
  
  .student-id {
    color: #666;
    font-size: 0.9rem;
  }

  .info-text {
    color: #888;
    font-style: italic;
    margin: 1rem 0;
  }

  .actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .student-row > div:last-child {
    display: flex;
    gap: 1rem;
  }
  
  .save-btn {
    background: #1b9963;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    white-space: nowrap; 
  }

  .save-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  .save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  </style>