<template>
  <div class="solvency-block">
    <div class="block-icon">
      🔒
    </div>
    <h3>Acceso Bloqueado</h3>
    <p class="block-message">
      Para acceder a las calificaciones es necesario estar al día con los pagos mensuales.
    </p>
    <div class="solvency-details">
      <div class="solvency-stats">
        <div class="stat-item">
          <span class="stat-label">Estado de solvencia:</span>
          <span class="stat-value pending">{{ solvencyPercentage }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Meses pendientes:</span>
          <span class="stat-value">{{ pendingMonths }} de {{ totalMonths }}</span>
        </div>
      </div>
      
      <div v-if="pendingMonthsList.length > 0" class="pending-months">
        <h4>Meses con pagos pendientes:</h4>
        <div class="months-grid">
          <span 
            v-for="month in pendingMonthsList" 
            :key="month" 
            class="pending-month"
          >
            {{ month }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button @click="$emit('view-payments')" class="btn-primary">
        Ver Historial de Pagos
      </button>
      <button @click="$emit('refresh-solvency')" class="btn-secondary">
        Verificar Nuevamente
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  solvencyPercentage: {
    type: Number,
    default: 0
  },
  pendingMonths: {
    type: Number,
    default: 0
  },
  totalMonths: {
    type: Number,
    default: 0
  },
  pendingMonthsList: {
    type: Array,
    default: () => []
  }
});

defineEmits(['view-payments', 'refresh-solvency']);
</script>

<style scoped>
.solvency-block {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
}

.block-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.solvency-block h3 {
  color: #856404;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.block-message {
  color: #664d03;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.solvency-details {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  text-align: left;
}

.solvency-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-weight: 500;
  color: #664d03;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  font-size: 1.2rem;
  color: #1b9963;
}

.stat-value.pending {
  color: #dc3545;
}

.pending-months h4 {
  color: #856404;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.months-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pending-month {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background: #1b9963;
  color: white;
}

.btn-primary:hover {
  background: #157a50;
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #856404;
  border: 2px solid #ffc107;
}

.btn-secondary:hover {
  background: #ffc107;
  color: white;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .solvency-block {
    padding: 1.5rem;
    margin: 1rem 0;
  }
  
  .solvency-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .months-grid {
    justify-content: center;
  }
}
</style>
