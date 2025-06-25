<template>
    <div class="layout">
      <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
      <main class="report-card-container">
        <div v-if="alert.show" :class="['alert', alert.type]">
          {{ alert.message }}
        </div>
        <h1 class="page-title">Boleta de calificaciones</h1>
        <div class="separator"></div>
        <div class="btn-pdf-container">
          <button @click="exportarPDF" class="btn-pdf">
                  Exportar a PDF
          </button>
        </div>
        <div ref="boletaRef">
            <div class="subtitle-grid" v-if="studentData && gradeData">
            <div class="subtitle-label">Alumno (a):</div>
            <div>{{ studentData.carnet }} - {{ studentData.nombre }} {{ studentData.apellido }}</div>
            
            <div class="subtitle-label">Grado:</div>
            <div>{{ gradeData.grado }} {{ gradeData.seccion }}</div>
            
            <div class="subtitle-label">Maestro guía:</div>
            <div>Jorge Herrera</div>
          </div>
            
            <div v-if="boleta">
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
                    <td>{{ materia.nombre }}</td>
                    <td>{{ materia.trimestres[1] || '-' }}</td>
                    <td>{{ materia.trimestres[2] || '-' }}</td>
                    <td>{{ materia.trimestres[3] || '-' }}</td>
                    <td>{{ materia.trimestres[4] || '-' }}</td>
                    <td><strong>{{ materia.promedio }}</strong></td>
                  </tr>
                </tbody>
              </table>


              <div class="promedio-general">
                <strong>Promedio general:</strong> {{ promedio }}
              </div>

              <div class="observaciones">
                <h4>Observaciones del alumno (a)</h4>
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
            <p v-else>Cargando boleta...</p>
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
  { label: 'Tablero', icon: ClipboardList },
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

.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

.report-card-container {
  flex: 1;
  padding: 2rem;
  margin-left: 130px;
  max-width: 1200px; 
  margin: 0 auto; 
  display: flex;
  flex-direction: column;
  align-items: center; 
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 0.5rem;
  width: 100%; 
  text-align: left;
}

.subtitle-grid {
  display: grid;
  grid-template-columns: max-content 1fr; 
  align-items: baseline;
  gap: 0.5rem 1rem;
  margin-bottom: 2rem;
  font-size: 1.24rem;
  color: #374151;
}

.subtitle-label {
  font-weight: 500;
  white-space: nowrap;
  padding-right: 1rem; 
  margin-left: 22px;
}


.materias-table,
.observations-table {
  margin-left: auto;
  margin-right: auto;
}

.separator {
  width: 100%;
  border-bottom: 2px solid #000;
  margin-bottom: 1.5rem;
}

.btn-pdf-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  width: 100%; 
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.btn-pdf {
  background-color: #1b9963;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-pdf:hover {
  background-color: #158a50;
}

/* Tabla de materias */
.materias-table {
  width: 100%;
  max-width: 900px;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.materias-header {
  background-color: #f5f5f5;
  font-weight: 600;
}

.materias-table th,
.materias-table td {
  padding: 0.75rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.materias-table tbody tr:hover {
  background-color: #f9f9f9;
}

css
.materias-header th {
  background-color: #f5f5f5;
  font-weight: 600;
  text-align: center;
}

.materias-subheader th {
  background-color: #f5f5f5; 
  font-weight: 500;
}

/* Promedio general */
.promedio-general {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.promedio-general strong{
  margin-left: 25px;
}

/* Observaciones */
.observaciones {
  padding: 1.5rem;
}

.observaciones h4 {
  margin-top: 0;
  font-size: 1.25rem;
  color: #1f2937;
  margin-bottom: 1rem;
  margin-left: -15px;
  padding: 15px;
}

.observations-table{
  width: 100%;
  max-width: 900px;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.observations-header {
  background-color: #f5f5f5;
  font-weight: 600;
}

.observations-table th,
.observations-table td {
  padding: 0.75rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
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
}

.alert.error {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Responsive */
@media (max-width: 768px) {
  .report-card-container {
    padding: 1rem;
    margin-left: 0;
  }

  .materias-table th, .materias-table td,
  .tabla-observaciones th, .tabla-observaciones td {
    font-size: 0.9rem;
    padding: 0.5rem;
  }

  .btn-pdf {
    width: 100%;
  }
}

.tabla-observaciones {
  width: 100%;
  max-width: 500px;
  border-collapse: collapse;
  margin-top: 1rem;
}

.tabla-observaciones th,
.tabla-observaciones td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}

.tabla-observaciones thead {
  background-color: #f0f0f0;
}

.tabla-observaciones tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.tabla-observaciones {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.tabla-observaciones th,
.tabla-observaciones td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}

.tabla-observaciones thead {
  background-color: #f0f0f0;
}

.tabla-observaciones tbody tr:nth-child(even) {
  background-color: #fafafa;
}


</style>
