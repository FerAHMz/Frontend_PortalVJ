<template>
  <div class="grades-view">
    <SelectChild v-if="children.length" :children="children" @child-selected="handleChildSelected" />
    <div v-else class="no-children">No se encontraron estudiantes asociados a su cuenta.</div>
    <StudentGrades v-if="selectedChild" :student="selectedChild" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SelectChild from './SelectChild.vue';
import StudentGrades from './StudentGrades.vue';
import { profileService } from '@/services/profileService.js';

const children = ref([]);
const selectedChild = ref(null);

const handleChildSelected = (child) => {
  selectedChild.value = child;
};

const fetchUserProfile = async () => {
  const response = await profileService.getCurrentUserProfile();
  if (response.success && response.user && response.user.estudiante) {
    children.value = [response.user.estudiante];
  } else {
    children.value = [];
  }
};

onMounted(fetchUserProfile);
</script>

<style scoped>
.grades-view { padding: 2rem; }
.no-children { text-align: center; color: #666; font-style: italic; }
</style>
