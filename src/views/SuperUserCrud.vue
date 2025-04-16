<template>
    <div class="layout">
      <Sidebar :items="menuItems" />
      <main class="crud-container">
        <h1 class="page-title">Panel de Super Usuario</h1>
        <div class="separator"></div>
        
        <div class="crud-actions">
          <button @click="openCreateModal" class="action-btn create">
            <Plus class="action-icon" /> Nuevo Registro
          </button>
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar..." 
              class="search-input"
            >
            <Search class="search-icon" />
          </div>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="header in headers" :key="header.key">
                  {{ header.title }}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.id">
                <td v-for="header in headers" :key="header.key">
                  {{ item[header.key] }}
                </td>
                <td class="actions">
                  <button @click="editItem(item)" class="action-btn edit">
                    <Edit class="action-icon" />
                  </button>
                  <button @click="confirmDelete(item)" class="action-btn delete">
                    <Trash class="action-icon" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Modal para crear/editar -->
        <div v-if="showModal" class="modal-overlay">
          <div class="modal-content">
            <h2>{{ editingItem ? 'Editar Registro' : 'Nuevo Registro' }}</h2>
            <form @submit.prevent="saveItem">
              <div v-for="header in editableHeaders" :key="header.key" class="form-group">
                <label :for="header.key">{{ header.title }}</label>
                <input 
                  :type="header.type || 'text'" 
                  v-model="formData[header.key]" 
                  :id="header.key"
                  class="form-input"
                >
              </div>
              <div class="modal-actions">
                <button type="button" @click="closeModal" class="modal-btn cancel">
                  Cancelar
                </button>
                <button type="submit" class="modal-btn save">
                  {{ editingItem ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Modal de confirmación -->
        <ModalConfirmacion
            v-if="showConfirmModal"
            :visible="showConfirmModal"
            title="Confirmar Eliminación"
            message="¿Estás seguro de eliminar este registro?"
            confirm-text="Eliminar"
            cancel-text="Cancelar"
            confirm-button-class="delete"
            :loading="deleting"
            @confirm="deleteItem"
            @cancel="showConfirmModal = false"
        />
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import Sidebar from '@/components/Sidebar.vue'
  import {Settings, Plus, Search, Edit, Trash } from 'lucide-vue-next'
  import ModalConfirmacion from '@/components/dialogs/ModalConfirmation.vue'
  
  // Configuración del menú
  const menuItems = [
    { label: 'Super Usuario', icon: Settings, path: '/superuser' }
  ]
  
  // Configuración de columnas de la tabla
  const headers = [
    { key: 'id', title: 'ID' },
    { key: 'nombre', title: 'Nombre' },
    { key: 'email', title: 'Email' },
    { key: 'rol', title: 'Rol' },
    { key: 'fechaCreacion', title: 'Fecha Creación' }
  ]
  
  // Datos de ejemplo (esto solo es de momento)
  const items = ref([
    { id: 1, nombre: 'Admin Principal', email: 'superadmin@example.com', rol: 'SUP', fechaCreacion: '2023-01-15' },
    { id: 2, nombre: 'Elisabeth García', email: 'admin1@example.com', rol: 'Administrativo', fechaCreacion: '2023-02-20' },
    { id: 3, nombre: 'Marco López', email: 'maestro1@example.com', rol: 'Maestro', fechaCreacion: '2023-03-10' }
  ])
  
  // Estado del componente
  const searchQuery = ref('')
  const showModal = ref(false)
  const showConfirmModal = ref(false)
  const editingItem = ref(null)
  const itemToDelete = ref(null)
  const formData = ref({})
  
  // Headers editables (excluyendo campos como ID)
  const editableHeaders = computed(() => headers.filter(h => h.key !== 'id'))
  
  // Filtrar items basado en la búsqueda
  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    const query = searchQuery.value.toLowerCase()
    return items.value.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      )
    )
  })
  
  // Abrir modal para crear nuevo item
  const openCreateModal = () => {
    formData.value = {}
    editingItem.value = null
    showModal.value = true
  }
  
  // Abrir modal para editar item
  const editItem = (item) => {
    formData.value = { ...item }
    editingItem.value = item
    showModal.value = true
  }
  
  // Confirmar eliminación
  const confirmDelete = (item) => {
    itemToDelete.value = item
    showConfirmModal.value = true
  }
  
  // Cerrar modal
  const closeModal = () => {
    showModal.value = false
  }
  
  // Guardar item (crear o actualizar)
  const saveItem = () => {
    if (editingItem.value) {
      // Actualizar item existente
      const index = items.value.findIndex(i => i.id === editingItem.value.id)
      if (index !== -1) {
        items.value[index] = { ...formData.value }
      }
    } else {
      // Crear nuevo item
      const newId = Math.max(...items.value.map(i => i.id)) + 1
      items.value.push({ ...formData.value, id: newId })
    }
    closeModal()
  }
  
  // Eliminar item
  const deleteItem = () => {
    items.value = items.value.filter(item => item.id !== itemToDelete.value.id)
    showConfirmModal.value = false
  }
  
  // Cargar datos iniciales (acá solo es simulación de momento)
  onMounted(() => {
    // Aquí iría la llamada 
    console.log('Cargando datos...')
  })
  </script>
  
  <style scoped>
  .layout {
    display: flex;
    min-height: 100vh;
  }
  
  .crud-container {
    flex: 1;
    padding: 2rem;
    margin-left: 130px;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #000;
    margin-bottom: 1rem;
  }
  
  .separator {
    border-bottom: 2px solid #000;
    margin-bottom: 1.5rem;
  }
  
  .crud-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .action-btn.create {
    background-color: #1b9963;
    color: white;
    border: none;
  }
  
  .action-btn.create:hover {
    background-color: #158a50;
  }
  
  .action-icon {
    width: 18px;
    height: 18px;
  }
  
  .search-container {
    position: relative;
    flex: 1;
    max-width: 400px;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #666;
  }
  
  .table-container {
    overflow-x: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th, .data-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .data-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .data-table tr:hover {
    background-color: #f9f9f9;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn.edit, .action-btn.delete {
    padding: 0.5rem;
    border-radius: 6px;
  }
  
  .action-btn.edit {
    background-color: #f0ad4e;
    color: white;
    border: none;
  }
  
  .action-btn.delete {
    background-color: #d9534f;
    color: white;
    border: none;
  }
  
  /* Modales */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content.confirm {
    max-width: 400px;
  }
  
  .modal-content h2 {
    margin-top: 0;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .modal-btn.cancel {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
  }
  
  .modal-btn.save {
    background-color: #1b9963;
    color: white;
    border: none;
  }
  
  .modal-btn.delete {
    background-color: #d9534f;
    color: white;
    border: none;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .crud-container {
      padding: 1rem;
      margin-left: 0;
    }
    
    .sidebar {
      display: none;
    }
    
    .crud-actions {
      flex-direction: column;
    }
    
    .search-container {
      max-width: 100%;
    }
    
    .data-table th, .data-table td {
      padding: 0.75rem 0.5rem;
      font-size: 0.9rem;
    }
  }
  </style>