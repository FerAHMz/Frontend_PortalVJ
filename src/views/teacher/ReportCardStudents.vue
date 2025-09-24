<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="report-card-container">
      <h1 class="text-page-title">Boleta de calificaciones</h1>
      <div class="separator"></div>

      <!-- Contenedor de búsqueda -->
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Ingrese el nombre del estudiante..."
          class="search-input"
        >
      </div>

      <!-- Filtros responsivos -->
      <div class="filters">
        <div class="filter-item">
          <label for="grade-select">Seleccione el grado y sección:</label>
          <select v-model="searchGradeYear.gradeSectionId" class="search-dropdown" @change="fetchStudents">
            <option value="">Seleccione una opción</option>
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

      <!-- Mensaje cuando no hay grados asignados -->
      <div v-if="gradeSections.length === 0" class="no-data-message">
        <p>No tiene grados y secciones asignados.</p>
      </div>

      <!-- Lista de estudiantes responsive -->
      <div v-else-if="filteredStudents.length > 0" class="students-list">
        <div v-for="student in filteredStudents" :key="student.carnet" class="student-row">
          <div class="student-info">
            <span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
            <span class="student-id">Carnet: {{ student.carnet }}</span>
          </div>
          <div class="student-actions">
            <button @click="viewReportCard(student)" class="save-btn">
              <span class="btn-text-full">Abrir boleta</span>
              <span class="btn-text-short">Abrir</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay estudiantes -->
      <div v-else-if="searchGradeYear.gradeSectionId && selectedTrimester && searchGradeYear.year" class="no-data-message">
        <p>No se encontraron estudiantes para los filtros seleccionados.</p>
      </div>

      <NotificationDialog />
    </main>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Sidebar from '@/components/Sidebar.vue'
  import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
  import { User, ClipboardList, BookOpen, CalendarDays, FileText, MessageSquare } from 'lucide-vue-next'
  import reportCardService from '@/services/reportCardService'
  import { useNotifications } from '@/utils/useNotifications'

  const { showNotification } = useNotifications()
  const route = useRoute()
  const router = useRouter()
  const students = ref([])
  const searchQuery = ref('')
  const gradeSections = ref([]);
  const selectedTrimester = ref('');

  const menuItems = [
    { label: 'Perfil', icon: User, path: '/teacher' },
    { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
    { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
    { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
    { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
    { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
  ]

  // Búsqueda por nombre, apellido o carnet
  const filteredStudents = computed(() => {
    if (!searchQuery.value && !searchGradeYear.value.grado && !searchGradeYear.value.year) {
      return students.value;
    }
    const query = searchQuery.value.toLowerCase();
    return students.value.filter(student =>
      (searchGradeYear.value.grado ? student.grado_seccion_id === searchGradeYear.value.grado : true) &&
      (searchGradeYear.value.year ? student.year === searchGradeYear.value.year : true) &&
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
    // Solo buscar estudiantes si hay valores seleccionados
    if (!searchGradeYear.value.gradeSectionId || !selectedTrimester.value || !searchGradeYear.value.year) {
      students.value = [];
      return;
    }

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
      showNotification('Error al cargar los estudiantes', 'error');
      students.value = [];
    }
  };

  // Función para obtener los grados y secciones asignados al maestro
  const fetchTeacherGradeSections = async () => {
    try {
      // Llamar al servicio que obtiene solo los grados/secciones del maestro autenticado
      const response = await reportCardService.fetchTeacherGradeSections();
      
      gradeSections.value = response;
      console.log('Grados y secciones del maestro:', gradeSections.value);

      // Si hay grados disponibles, seleccionar el primero por defecto
      if (gradeSections.value.length > 0) {
        searchGradeYear.value.gradeSectionId = gradeSections.value[0].id_grado_seccion;
      }

    } catch (error) {
      console.error('Error al cargar grados y secciones del maestro:', error);
      showNotification('Error al cargar los grados asignados', 'error');
      gradeSections.value = [];
    }
  };

  onMounted(async () => {
    try {
      // Obtener solo los grados y secciones asignados al maestro
      await fetchTeacherGradeSections();

      selectedTrimester.value = 'Primer Trimestre';

      const currentYear = new Date().getFullYear();
      searchGradeYear.value.year = currentYear;

      // Solo buscar estudiantes si hay grados asignados
      if (gradeSections.value.length > 0) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error durante la inicialización:', error);
    }
  });

  const handleItemClick = (path) => {
    if (path) {
      router.push(path)
    }
  }
</script>

<style scoped>
  /* Layout principal - se adapta al sidebar responsive */
  .layout {
    display: flex;
    min-height: 100vh;
  }

  .report-card-container {
    flex: 1;
    padding: 2rem;
    margin-left: 130px; /* Margen para sidebar en desktop */
    transition: margin-left 0.3s ease;
    min-width: 0; /* Permite que el contenido se contraiga */
  }

  /* Títulos y separadores */
  

  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
  }

  /* Contenedor de búsqueda */
  .search-container {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  /* Filtros responsivos */
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    align-items: flex-end;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    min-width: 200px;
  }

  .filter-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
    text-align: left;
  }

  .search-dropdown,
  .input-year {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    width: 100%;
    text-align: left;
  }

  .input-year {
    max-width: 150px;
  }

  /* Lista de estudiantes */
  .students-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .student-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
  }

  .student-row:hover {
    background-color: #f8f9fa;
  }

  .student-row:last-child {
    border-bottom: none;
  }

  .student-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0; /* Permite que el texto se contraiga */
  }

  .student-name {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .student-id {
    color: #666;
    font-size: 0.9rem;
  }

  .student-actions {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
  }

  /* Mensaje cuando no hay datos */
  .no-data-message {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 2rem;
    text-align: center;
    color: #666;
    font-size: 1.1rem;
  }

  /* Botón responsivo */
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

  .save-btn:hover {
    background: #147a4d;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .save-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }

  .save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  /* Texto del botón - por defecto mostrar texto completo */
  .btn-text-short {
    display: none;
  }

  .btn-text-full {
    display: inline;
  }

  /* Estilos para tablets */
  @media screen and (max-width: 1024px) {
    .report-card-container {
      padding: 1.5rem;
    }

    

    .filters {
      gap: 1rem;
    }

    .filter-item {
      min-width: 180px;
    }
  }

  /* Estilos para móviles */
  @media screen and (max-width: 768px) {
    /* Remover margen del sidebar en móvil */
    .report-card-container {
      margin-left: 0;
      padding: 1rem;
      margin-top: 5.25rem; /* Espacio para el botón hamburguesa */
    }

    .text-page-title {
      text-align: center;
    }

    /* Búsqueda a ancho completo */
    .search-input {
      max-width: none;
    }

    /* Filtros en columna */
    .filters {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .filter-item {
      min-width: auto;
      flex: none;
    }

    .input-year {
      max-width: none;
    }

    /* Lista de estudiantes más compacta */
    .student-row {
      padding: 0.75rem;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .student-info {
      flex-direction: column;
      gap: 0.25rem;
    }

    .student-actions {
      justify-content: center;
      gap: 0.5rem;
    }

    /* Botón más pequeño en móvil */
    .save-btn {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    /* Mostrar texto corto del botón en pantallas muy pequeñas */
    .btn-text-full {
      display: none;
    }

    .btn-text-short {
      display: inline;
    }
  }

  /* Estilos para móviles muy pequeños */
  @media screen and (max-width: 480px) {
    .report-card-container {
      padding: 0.75rem;
      padding-top: 4.5rem;
    }

    

    .search-input {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .search-dropdown,
    .input-year {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .student-row {
      padding: 0.5rem;
    }

    .student-name {
      font-size: 0.95rem;
    }

    .student-id {
      font-size: 0.8rem;
    }

    .save-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
    }
  }

  /* Mejoras para accesibilidad y usabilidad */
  @media (prefers-reduced-motion: reduce) {
    .report-card-container,
    .save-btn,
    .student-row {
      transition: none;
    }
  }

  /* Alto contraste para mejor legibilidad */
  @media (prefers-contrast: high) {
    .student-row {
      border-bottom: 2px solid #333;
    }

    .save-btn {
      border: 2px solid #1b9963;
    }
  }
</style>


