<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    <main class="report-card-container">
      <!-- Alerta responsive -->
      <div v-if="alert.show" :class="['alert', alert.type]">
        {{ alert.message }}
      </div>
      
      <h1 class="text-page-title">Boleta de calificaciones</h1>
      <div class="separator"></div>
      
      <!-- Botón PDF responsive -->
      <div class="btn-pdf-container">
        <button @click="exportarPDF" class="btn-pdf">
          <span class="btn-text-full">Exportar a PDF</span>
          <span class="btn-text-short">PDF</span>
        </button>
      </div>
      
      <!-- Contenido para PDF -->
      <div ref="boletaRef" class="boleta-content">
        <!-- Información del estudiante responsive -->
        <div class="subtitle-grid" v-if="studentData && gradeData">
          <div class="subtitle-item">
            <span class="subtitle-label">Alumno (a):</span>
            <span class="subtitle-value">{{ studentData.carnet }} - {{ studentData.nombre }} {{ studentData.apellido }}</span>
          </div>
          
          <div class="subtitle-item">
            <span class="subtitle-label">Grado:</span>
            <span class="subtitle-value">{{ gradeData.grado }} {{ gradeData.seccion }}</span>
          </div>
          
          <div class="subtitle-item">
            <span class="subtitle-label">Maestro guía:</span>
            <span class="subtitle-value">Jorge Herrera</span>
          </div>
        </div>
        
        <div v-if="boleta">
          <!-- Tabla de materias responsive -->
          <div class="table-container">
            <table class="materias-table">
              <thead>
                <tr class="materias-header">
                  <th rowspan="2">Asignatura</th> 
                  <th colspan="4">Periodo</th> 
                  <th rowspan="2">Nota final</th> 
                </tr>
                <tr class="materias-subheader">
                  <th>I</th>
                  <th>II</th>
                  <th>III</th>
                  <th>IV</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="materia in materiasAgrupadas" :key="materia.nombre">
                  <td class="materia-name">{{ materia.nombre }}</td>
                  <td>{{ materia.trimestres[1] || '-' }}</td>
                  <td>{{ materia.trimestres[2] || '-' }}</td>
                  <td>{{ materia.trimestres[3] || '-' }}</td>
                  <td>{{ materia.trimestres[4] || '-' }}</td>
                  <td class="nota-final"><strong>{{ materia.promedio }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Promedio general -->
          <div class="promedio-general">
            <strong>Promedio general:</strong> {{ promedio }}
          </div>

          <!-- Observaciones responsive -->
          <div class="observaciones">
            <h4>Observaciones del alumno (a)</h4>
            <div class="table-container">
              <table class="observations-table">
                <thead class="observations-header">
                  <tr>
                    <th>#</th>
                    <th>Tarea relacionada</th>
                    <th>Observación</th>
                    <th>Punto de acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in observaciones" :key="item.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.tarea ? item.tarea : 'N/A' }}</td>
                    <td>{{ item.observaciones }}</td>
                    <td>{{ item.puntos_de_accion }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <p v-else class="loading-text">Cargando boleta...</p>
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
import html2pdf from 'html2pdf.js'

const route = useRoute()
const router = useRouter()
const carnet = route.params.carnet_estudiante
const gradeSectionId = route.query.gradeSectionId
const trimestre = route.query.trimestre
const year = route.query.year
const gradeData = ref(null)
const studentData = ref(null)
const boleta = ref(null)
const boletaRef = ref(null)
const observaciones = ref([])

const alert = ref({
    show: false,
    message: '',
    type: 'success'
})

const menuItems = [
  { label: 'Perfil', icon: User, path: '/teacher' },
  { label: 'Tablero', icon: ClipboardList, path: '/teacher/dashboard' },
  { label: 'Cursos', icon: BookOpen, path: '/teacher/courses' },
  { label: 'Calendario', icon: CalendarDays, path: '/teacher/calendar' },
  { label: 'Boleta de calificaciones', icon: FileText, path: '/teacher/report-card' },
  { label: 'Comunicación', icon: MessageSquare, path: '/teacher/messages' }
]

const fetchBoleta = async () => {
  try {
    if (!gradeData.value || !studentData.value) {
      console.error('Datos de grado o estudiante no disponibles')
    }

    const boletaData = await reportCardService.fetchGradesTrimestre(
      gradeSectionId,
      carnet,
      trimestre
    )
    boleta.value = boletaData
    console.log('que viene en boleta', boletaData)
  } catch (error) {
    console.error('Error al obtener boleta:', error)
  }
}

const materiasAgrupadas = computed(() => {
  if (!boleta.value){
    console.log('No hay datos de boleta disponibles')
  }

  const map = {}

  boleta.value.forEach(row => {
    if (!map[row.materia]) {
      map[row.materia] = { nombre: row.materia, trimestres: {}, notas: [] }
    }
    map[row.materia].trimestres[row.trimestre_id] = row.nota
    map[row.materia].notas.push(row.nota)
  })

  return Object.values(map).map(m => ({
    ...m,
    promedio: (m.notas.reduce((a, b) => a + b, 0) / m.notas.length).toFixed(2)
  }))
})

const promedio = computed(() => {
  if (!materiasAgrupadas.value.length) return 0
  const total = materiasAgrupadas.value.reduce((sum, m) => sum + parseFloat(m.promedio), 0)
  return (total / materiasAgrupadas.value.length).toFixed(2)
})

const fetchObservaciones = async () => {
  try {
    const data = await reportCardService.fetchObservaciones(gradeSectionId, carnet)
    observaciones.value = data

  } catch (error) {
    console.error('Error al obtener observaciones en report card:', error)
  }
}

const fetchGrado = async () => {
  try {
    const data = await reportCardService.fetchGrado(gradeSectionId)
    console.log('parametro:', gradeSectionId)
    gradeData.value = data[0]
    console.log('Datos del grado obtenidos:', gradeData.value)

  } catch (error) {
    console.error('Error al obtener observaciones en report card:', error)
  }
}

onMounted(async () => {
  const student = sessionStorage.getItem('studentData')
  if (student) {
    studentData.value = JSON.parse(student)
    await fetchGrado()
    await fetchBoleta()
    await fetchObservaciones()
  }else{
    console.error('No se encontraron datos del estudiante en sessionStorage')
  }
})

const handleItemClick = (path) => {
  if (path) {
    router.push(path)
  }
}

const exportarPDF = () => {
  const element = boletaRef.value
  if (!element) {
    console.error('Elemento no encontrado para exportar')
    return
  }
  console.log('Exportando PDF del elemento:', element)
  html2pdf().from(element).save(`boleta-${carnet}.pdf`)
}
</script>

<style scoped>
/* Layout principal - integrado con sidebar responsive */
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

.report-card-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px; /* Margen para sidebar en desktop */
  transition: margin-left 0.3s ease;
  min-width: 0; /* Permite que el contenido se contraiga */
}

/* Título y separador */


.separator {
  width: 100%;
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

/* Botón PDF responsive */
.btn-pdf-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  width: 100%;
}

.btn-pdf {
  background-color: #1b9963;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-pdf:hover {
  background-color: #158a50;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Texto del botón - por defecto mostrar texto completo */
.btn-text-short {
  display: none;
}

.btn-text-full {
  display: inline;
}

/* Contenido de la boleta */
.boleta-content {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

/* Información del estudiante responsive */
.subtitle-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #374151;
}

.subtitle-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
}

.subtitle-label {
  font-weight: 600;
  color: #1f2937;
  min-width: 120px;
  flex-shrink: 0;
}

.subtitle-value {
  flex: 1;
  min-width: 0; /* Permite que el texto se contraiga */
}

/* Contenedores de tabla responsive */
.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Tabla de materias */
.materias-table {
  width: 100%;
  min-width: 600px; /* Ancho mínimo para mantener estructura */
  border-collapse: collapse;
  background-color: white;
}

.materias-header,
.materias-subheader {
  background-color: #f5f5f5;
  font-weight: 600;
}

.materias-table th,
.materias-table td {
  padding: 0.75rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.materias-table .materia-name {
  text-align: left;
  font-weight: 500;
  min-width: 150px;
}

.materias-table .nota-final {
  background-color: #f8f9fa;
  font-weight: 600;
}

.materias-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* Promedio general */
.promedio-general {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2rem;
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1b9963;
}

/* Observaciones */
.observaciones {
  width: 100%;
}

.observaciones h4 {
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 600;
}

/* Tabla de observaciones */
.observations-table {
  width: 100%;
  min-width: 700px; /* Ancho mínimo para mantener estructura */
  border-collapse: collapse;
  background-color: white;
}

.observations-header {
  background-color: #f5f5f5;
  font-weight: 600;
}

.observations-table th,
.observations-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

.observations-table th:first-child,
.observations-table td:first-child {
  text-align: center;
  width: 50px;
}

.observations-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* Alertas */
.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.alert.success {
  background-color: #dcfce7;
  color: #166534;
  border-left: 4px solid #16a34a;
}

.alert.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #dc2626;
}

/* Texto de carga */
.loading-text {
  text-align: center;
  font-size: 1.1rem;
  color: #6b7280;
  padding: 2rem;
}

/* Estilos para tablets */
@media screen and (max-width: 1024px) {
  .report-card-container {
    padding: 1.5rem;
  }

  

  .subtitle-grid {
    font-size: 1rem;
  }

  .subtitle-label {
    min-width: 100px;
  }

  .materias-table th,
  .materias-table td,
  .observations-table th,
  .observations-table td {
    padding: 0.6rem 0.8rem;
    font-size: 0.95rem;
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

  /* Botón PDF adaptado */
  .btn-pdf-container {
    justify-content: center;
  }

  .btn-pdf {
    padding: 0.75rem 1.5rem;
    width: auto;
  }

  /* Mostrar texto corto del botón en móvil */
  .btn-text-full {
    display: none;
  }

  .btn-text-short {
    display: inline;
  }

  /* Información del estudiante más compacta */
  .subtitle-grid {
    font-size: 0.95rem;
    gap: 0.5rem;
  }

  .subtitle-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .subtitle-label {
    min-width: auto;
    font-size: 0.9rem;
  }

  /* Tablas más compactas */
  .materias-table {
    min-width: 500px;
  }

  .materias-table th,
  .materias-table td {
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
  }

  .observations-table {
    min-width: 600px;
  }

  .observations-table th,
  .observations-table td {
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
  }

  /* Promedio más compacto */
  .promedio-general {
    font-size: 1.1rem;
    padding: 0.75rem;
  }

  /* Observaciones más compactas */
  .observaciones h4 {
    font-size: 1.1rem;
  }
}

/* Estilos para móviles muy pequeños */
@media screen and (max-width: 480px) {
  .report-card-container {
    padding: 0.75rem;
    padding-top: 4.5rem;
  }

  

  .btn-pdf {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .subtitle-grid {
    font-size: 0.9rem;
  }

  .materias-table {
    min-width: 450px;
  }

  .materias-table th,
  .materias-table td {
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
  }

  .observations-table {
    min-width: 550px;
  }

  .observations-table th,
  .observations-table td {
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
  }

  .promedio-general {
    font-size: 1rem;
    padding: 0.6rem;
  }

  .observaciones h4 {
    font-size: 1rem;
  }
}

/* Estilos especiales para impresión/PDF */
@media print {
  .layout {
    display: block;
  }

  .report-card-container {
    margin-left: 0;
    padding: 1rem;
  }

  .btn-pdf-container {
    display: none;
  }

  .table-container {
    overflow-x: visible;
  }

  .materias-table,
  .observations-table {
    min-width: auto;
  }
}

/* Mejoras para accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .report-card-container,
  .btn-pdf {
    transition: none;
  }
}

/* Alto contraste para mejor legibilidad */
@media (prefers-contrast: high) {
  .materias-table th,
  .materias-table td,
  .observations-table th,
  .observations-table td {
    border: 2px solid #333;
  }

  .btn-pdf {
    border: 2px solid #1b9963;
  }
}
</style>


