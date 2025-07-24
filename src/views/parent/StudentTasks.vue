<template>
  <div class="tasks-view">
    <h2>Calificaciones por Tarea/Actividad</h2>
    <div v-if="loading" class="loading">Cargando tareas...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
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
import { parentService } from '@/services/parentService.js';

const props = defineProps({
  student: Object,
  subjectId: [String, Number]
});
const tasks = ref([]);
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

const fetchTasks = async () => {
  if (!props.student || !props.subjectId) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await parentService.getStudentTaskGrades(props.student.carnet, props.subjectId);
    if (res.success) {
      tasks.value = res.tasks;
    } else {
      error.value = 'No se pudieron obtener las tareas.';
    }
  } catch (err) {
    error.value = 'Error al obtener tareas.';
  } finally {
    loading.value = false;
  }
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
  background: #e3f2fd;
  font-weight: bold;
  border-top: 2px solid #1b9963;
}
.total-row td, .average-row td {
  border-top: 2px solid #dee2e6;
}
</style>
