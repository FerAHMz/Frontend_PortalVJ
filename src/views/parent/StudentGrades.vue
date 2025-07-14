<template>
  <div class="grades-view">
    <h2>Calificaciones por Asignatura y Trimestre</h2>
    <div v-if="loading" class="loading">Cargando calificaciones...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
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
              <button @click="viewTasks(grade.materia_id)">Ver tareas</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { parentService } from '@/services/parentService.js';

const props = defineProps({
  student: Object
});
const grades = ref([]);
const loading = ref(false);
const error = ref(null);
const emit = defineEmits(['subject-selected']);

const fetchGrades = async () => {
  if (!props.student) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await parentService.getStudentGrades(props.student.carnet);
    if (res.success) {
      grades.value = res.grades;
    } else {
      error.value = 'No se pudieron obtener las calificaciones.';
    }
  } catch (err) {
    error.value = 'Error al obtener calificaciones.';
  } finally {
    loading.value = false;
  }
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
</style>
