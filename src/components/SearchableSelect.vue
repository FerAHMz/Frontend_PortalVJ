<template>
  <div class="searchable-select" :class="{ 'is-open': isOpen }">
    <div 
      class="select-trigger" 
      @click="toggleDropdown"
      :class="{ 'has-value': selectedOption }"
    >
      <span class="selected-text">
        {{ selectedOption ? getDisplayText(selectedOption) : placeholder }}
      </span>
      <svg class="dropdown-arrow" :class="{ 'rotated': isOpen }" viewBox="0 0 24 24" width="20" height="20">
        <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </div>
    
    <div v-if="isOpen" class="dropdown-panel">
      <div class="search-box">
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="search-input"
          @keydown.escape="closeDropdown"
          @keydown.enter.prevent="selectFirstFiltered"
          @keydown.arrow-down.prevent="highlightNext"
          @keydown.arrow-up.prevent="highlightPrevious"
        />
        <Search class="search-icon" size="16" />
      </div>
      
      <div class="options-container">
        <div 
          v-if="filteredOptions.length === 0" 
          class="no-options"
        >
          No se encontraron resultados
        </div>
        
        <div
          v-for="(option, index) in filteredOptions"
          :key="getOptionKey(option)"
          class="option-item"
          :class="{ 
            'highlighted': index === highlightedIndex,
            'selected': isSelected(option) 
          }"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          <span class="option-main">{{ getMainText(option) }}</span>
          <span class="option-secondary">{{ getSecondaryText(option) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar...'
  },
  displayField: {
    type: String,
    default: 'name'
  },
  valueField: {
    type: String,
    default: 'id'
  },
  searchFields: {
    type: Array,
    default: () => ['name']
  },
  secondaryField: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// Reactive state
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const searchInput = ref(null)

// Computed properties
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find(option => 
    getOptionValue(option) === props.modelValue
  )
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => {
    return props.searchFields.some(field => {
      const value = getNestedValue(option, field)
      return value && value.toString().toLowerCase().includes(query)
    })
  })
})

// Helper functions
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const getOptionValue = (option) => {
  return getNestedValue(option, props.valueField)
}

const getMainText = (option) => {
  return getNestedValue(option, props.displayField) || ''
}

const getSecondaryText = (option) => {
  if (!props.secondaryField) return ''
  return getNestedValue(option, props.secondaryField) || ''
}

const getDisplayText = (option) => {
  const main = getMainText(option)
  const secondary = getSecondaryText(option)
  return secondary ? `${main} - ${secondary}` : main
}

const getOptionKey = (option) => {
  return getOptionValue(option) || Math.random()
}

const isSelected = (option) => {
  return getOptionValue(option) === props.modelValue
}

// Methods
const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  isOpen.value = true
  highlightedIndex.value = -1
  await nextTick()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', option)
  closeDropdown()
}

const selectFirstFiltered = () => {
  if (filteredOptions.value.length > 0) {
    selectOption(filteredOptions.value[0])
  }
}

const highlightNext = () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
  }
}

const highlightPrevious = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.searchable-select')) {
    closeDropdown()
  }
}

// Watchers
watch(filteredOptions, () => {
  highlightedIndex.value = -1
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.select-trigger:hover {
  border-color: #cbd5e0;
}

.select-trigger.has-value {
  border-color: #3b82f6;
}

.is-open .select-trigger {
  border-color: #3b82f6;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.selected-text {
  flex: 1;
  text-align: left;
  color: #374151;
  font-weight: 500;
}

.select-trigger:not(.has-value) .selected-text {
  color: #9ca3af;
}

.dropdown-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #3b82f6;
  border-top: none;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow: hidden;
}

.search-box {
  position: relative;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.options-container {
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  border-left: 3px solid transparent;
}

.option-item:hover,
.option-item.highlighted {
  background-color: #f3f4f6;
}

.option-item.selected {
  background-color: #eff6ff;
  border-left-color: #3b82f6;
}

.option-main {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.option-secondary {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.no-options {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
  font-size: 0.875rem;
}

/* Scrollbar styling */
.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.options-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
