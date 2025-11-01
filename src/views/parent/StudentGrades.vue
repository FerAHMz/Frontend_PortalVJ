<template>
  <div class="grades-view">
    <h2>Calificaciones por Asignatura y Trimestre</h2>
    <div v-if="loading" class="loading">Cargando calificaciones...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <!-- Bloqueo por falta de solvencia -->
    <SolvencyBlock 
      v-else-if="solvencyData && !solvencyData.isSolvent"
      :solvency-percentage="solvencyData.solvencyPercentage"
      :pending-months="solvencyData.pendingMonths"
      :total-months="solvencyData.totalMonthsToCheck"
      :pending-months-list="solvencyData.pendingMonthsList"
      @view-payments="handleViewPayments"
      @refresh-solvency="checkSolvency"
    />
    
    <div v-else>
      <div v-if="solvencyData && solvencyData.isSolvent" class="solvency-status">
        <div class="solvency-badge">
          ✅ Estudiante solvente - Acceso completo
        </div>
      </div>
      <table class="grades-table">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Trimestre</th>
            <th>Total</th>
            <th>Ver tareas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="grade in grades" :key="grade.materia_id + '-' + grade.trimestre_id">
            <td>{{ grade.materia }}</td>
            <td>{{ grade.trimestre_id }}</td>
            <td>{{ grade.total }}</td>
            <td>
              <button @click="$emit('view-tasks', grade.materia_id)">Ver tareas</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { parentService } from '@/services/parentService.js';
import SolvencyBlock from '@/components/SolvencyBlock.vue';

const router = useRouter();
const props = defineProps({
  student: Object
});
const grades = ref([]);
const solvencyData = ref(null);
const loading = ref(false);
const error = ref(null);
const emit = defineEmits(['subject-selected']);

const checkSolvency = async () => {
  if (!props.student) return;
  try {
    const res = await parentService.checkPaymentSolvency(props.student.carnet);
    if (res.success) {
      solvencyData.value = res.solvency;
    }
  } catch (err) {
    console.error('Error checking solvency:', err);
    // Si no se puede verificar solvencia, permitir acceso
    solvencyData.value = { isSolvent: true };
  }
};

const fetchGrades = async () => {
  if (!props.student) return;
  loading.value = true;
  error.value = null;
  
  // Primero verificar solvencia
  await checkSolvency();
  
  // Solo cargar calificaciones si está solvente
  if (solvencyData.value && solvencyData.value.isSolvent) {
    try {
      const res = await parentService.getStudentGrades(props.student.carnet);
      if (res.success) {
        grades.value = res.grades;
      } else {
        error.value = res.error || 'Error al cargar calificaciones';
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      error.value = 'Error al cargar calificaciones';
    }
  }
  loading.value = false;
};

const handleViewPayments = () => {
  router.push({
    name: 'PaymentHistory',
    query: { studentId: props.student.carnet }
  });
};

const viewTasks = (subjectId) => {
  emit('subject-selected', subjectId);
};

watch(() => props.student, fetchGrades, { immediate: true });
</script>

<style scoped>
.grades-view {
  margin-bottom: 2rem;
}
.grades-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.grades-table th, .grades-table td {
  border: 1px solid #e9ecef;
  padding: 0.75rem;
  text-align: center;
}
.grades-table th {
  background: #1b9963;
  color: white;
}
button {
  background: #1b9963;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
button:hover {
  background: #158a56;
}

.loading, .error {
  text-align: center;
  padding: 1rem;
}

.error {
  color: #dc3545;
}

.solvency-status {
  margin-bottom: 1.5rem;
}

.solvency-badge {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}
</style>
