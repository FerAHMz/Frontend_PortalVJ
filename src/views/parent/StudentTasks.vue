<template>
  <div class="tasks-view">
    <h2>Calificaciones por Tarea/Actividad</h2>
    <div v-if="loading" class="loading">Cargando tareas...</div>
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
      <table class="tasks-table">
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Trimestre</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.tarea_id">
            <td>{{ task.titulo }}</td>
            <td>{{ task.trimestre }}</td>
            <td>{{ task.nota }}</td>
          </tr>
        </tbody>
        <tfoot v-if="tasks.length > 0">
          <tr class="total-row">
            <td colspan="2"><strong>Total de tareas:</strong></td>
            <td><strong>{{ totalTasks }}</strong></td>
          </tr>
          <tr class="average-row">
            <td colspan="2"><strong>Promedio:</strong></td>
            <td><strong>{{ averageGrade.toFixed(2) }}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { parentService } from '@/services/parentService.js';
import SolvencyBlock from '@/components/SolvencyBlock.vue';

const router = useRouter();
const props = defineProps({
  student: Object,
  subjectId: [String, Number]
});
const tasks = ref([]);
const solvencyData = ref(null);
const loading = ref(false);
const error = ref(null);

// Computed properties para los totales
const totalTasks = computed(() => {
  return tasks.value.length;
});

const totalPoints = computed(() => {
  return tasks.value.reduce((sum, task) => {
    const nota = parseFloat(task.nota) || 0;
    return sum + nota;
  }, 0);
});

const averageGrade = computed(() => {
  if (tasks.value.length === 0) return 0;
  return (totalPoints.value / tasks.value.length) * 10;
});

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

const fetchTasks = async () => {
  if (!props.student || !props.subjectId) return;
  loading.value = true;
  error.value = null;
  
  // Primero verificar solvencia
  await checkSolvency();
  
  // Solo cargar tareas si está solvente
  if (solvencyData.value && solvencyData.value.isSolvent) {
    try {
      const res = await parentService.getStudentTaskGrades(props.student.carnet, props.subjectId);
      if (res.success) {
        tasks.value = res.tasks;
      } else {
        error.value = res.error || 'Error al cargar tareas';
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      error.value = 'Error al cargar tareas';
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

watch(() => [props.student, props.subjectId], fetchTasks, { immediate: true });
</script>

<style scoped>
.tasks-view {
  margin-bottom: 2rem;
}
.tasks-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.tasks-table th, .tasks-table td {
  border: 1px solid #e9ecef;
  padding: 0.75rem;
  text-align: center;
}
.tasks-table th {
  background: #1b9963;
  color: white;
}
.total-row {
  background: #f8f9fa;
  font-weight: bold;
}
.average-row {
  background: #e9ecef;
  font-weight: bold;
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
