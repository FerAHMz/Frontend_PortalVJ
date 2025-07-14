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
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { parentService } from '@/services/parentService.js';

const props = defineProps({
  student: Object,
  subjectId: [String, Number]
});
const tasks = ref([]);
const loading = ref(false);
const error = ref(null);

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
</style>
