<template>
  <div class="skeleton-container">
    <div class="skeleton-header">
      <div class="skeleton-title"></div>
      <div class="skeleton-subtitle"></div>
    </div>
    
    <div class="skeleton-filters">
      <div class="skeleton-filter"></div>
      <div class="skeleton-filter"></div>
    </div>
    
    <div class="skeleton-cards">
      <div v-for="i in 5" :key="i" class="skeleton-card">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-name"></div>
          <div class="skeleton-course"></div>
        </div>
        <div class="skeleton-buttons">
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-container {
  padding: 2rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  margin-bottom: 2rem;
}

.skeleton-title {
  height: 2rem;
  width: 40%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-subtitle {
  height: 1rem;
  width: 25%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.skeleton-filter {
  height: 2.5rem;
  width: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  height: 1.2rem;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-course {
  height: 1rem;
  width: 80%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-buttons {
  display: flex;
  gap: 0.5rem;
}

.skeleton-btn {
  width: 60px;
  height: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}
</style>
