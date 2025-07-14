<template>
  <div class="select-child">
    <h2>Seleccione un hijo</h2>
    <CardList :items="children" @item-clicked="selectChild">
      <template #item="{ item }">
        <div class="child-item">
          <span>{{ item.nombre }} {{ item.apellido }}</span>
          <span class="carnet">Carnet: {{ item.carnet }}</span>
        </div>
      </template>
    </CardList>
  </div>
</template>

<script setup>
import CardList from '@/components/CardList.vue';
const emit = defineEmits(['child-selected']);
const props = defineProps({
  children: {
    type: Array,
    required: true
  }
});

const selectChild = (child) => {
  emit('child-selected', child);
};
</script>

<style scoped>
.select-child {
  margin-bottom: 2rem;
}
.child-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.carnet {
  color: #1b9963;
  font-weight: bold;
}
</style>
