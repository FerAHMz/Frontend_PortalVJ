<template>
  <div class="layout">
    <Sidebar :items="menuItems" @item-clicked="handleItemClick" />
    
    <main class="payments-control">
      <h1 class="page-title">Control de pagos</h1>
      <div class="separator"></div>

      <div class="options">
        <ul>
          <li>
            <router-link to="/admin/payments/control-de-pagos" class="payment-link">
              Control de pagos
            </router-link>
          </li>
          <li>
            <router-link to="/admin/payments/registro-de-pagos" class="payment-link">
              Registro de pagos
            </router-link>
          </li>
          <li>
            <router-link to="/admin/payments/upload" class="payment-link">
              Subir información de los pagos
            </router-link>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { useRouter } from 'vue-router'
import { User, CreditCard } from 'lucide-vue-next'

const router = useRouter()

const menuItems = [
  { label: 'Perfil', icon: User, path: '/admin' },
  { label: 'Control de pagos', icon: CreditCard, path: '/admin/payments' }
]

const handleItemClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.payments-control {
  flex: 1;
  padding: 2rem;
  background: white;
  overflow: auto;
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
  width: 100%;
}

.options ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem; 
}

.options li {
  margin-bottom: 0; 
  padding: 0.75rem 1rem;
  background-color: #f8f9fa; 
  border-radius: 8px; 
  border-left: 4px solid #1b9963; 
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
}

.options li:hover {
  background-color: #e9f5ef; 
  transform: translateX(2px); 
}

.payment-link {
  color: #000;
  text-decoration: none;
  font-size: 1.1rem;
  display: block; 
  padding: 0.25rem 0;
}

.payment-link:hover {
  color: #1b9963;
  text-decoration: none; 
}

/* Estilos para tablets (768px - 1024px) */
@media (max-width: 1024px) {
  .payments-control {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .payment-link {
    font-size: 1rem;
  }
  
  .options li {
    padding: 0.6rem 0.8rem;
  }
}

/* Estilos para móviles (hasta 768px) */
@media (max-width: 768px) {
  .payments-control {
    padding: 1rem;
    padding-top: 5rem; /* Espacio para el botón hamburguesa */
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .separator {
    margin-bottom: 1rem;
  }
  
  .options li {
    padding: 0.8rem 1rem;
    border-radius: 6px;
  }
  
  .payment-link {
    font-size: 0.95rem;
    padding: 0.5rem 0;
  }
}

/* Estilos para móviles pequeños (hasta 480px) */
@media (max-width: 480px) {
  .payments-control {
    padding: 0.75rem;
    padding-top: 4.5rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .options li {
    padding: 0.6rem 0.75rem;
    gap: 0.25rem;
  }
  
  .payment-link {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .mobile-menu-toggle {
    width: 45px;
    height: 45px;
    top: 0.75rem;
    left: 0.75rem;
  }
  
  .mobile-menu-toggle span {
    width: 22px;
    height: 2px;
  }
}

.payments-table {
  margin: 2rem 0;
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

tr:hover {
  background-color: #f8f9fa;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input,
.grade-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.grade-select {
  width: 150px;
}

.status-ok {
  color: #1b9963;
  font-weight: 600;
}

.status-pending {
  color: #dc3545;
  font-weight: 600;
}

/* Responsive para controles */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-input,
  .grade-select {
    width: 100%;
    min-width: unset;
  }
  
  .payments-table {
    margin: 1.5rem 0;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  th, td {
    padding: 0.5rem 0.25rem;
    font-size: 0.85rem;
  }
  
  .controls {
    gap: 0.5rem;
  }
  
  .search-input,
  .grade-select {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>