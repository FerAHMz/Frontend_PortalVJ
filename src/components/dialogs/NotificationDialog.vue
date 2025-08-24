<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div 
        v-for="(notification, index) in notifications" 
        :key="notification.id" 
        class="notification-toast" 
        :class="getNotificationClass(notification.type)"
        :style="{ top: `${20 + index * 80}px` }"
        :data-cy="`notification-${notification.type}`"
      >
        <div class="notification-content">
          <div class="notification-header">
            <div class="notification-icon">
              <component :is="getIcon(notification.type)" />
            </div>
            <div class="notification-text">
              <h4 :data-cy="'notification-title'">{{ notification.title }}</h4>
              <p v-if="notification.message" :data-cy="'notification-message'">{{ notification.message }}</p>
            </div>
            <button @click="removeNotification(notification.id)" class="notification-close">
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'
import { watch } from 'vue'

const { notifications, removeNotification } = useNotifications()

// Debug: watch notifications changes
watch(notifications, (newNotifications) => {
  console.log('NotificationDialog: notifications changed:', newNotifications.length)
}, { deep: true })

const getIcon = (type) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }
  return icons[type] || Info
}

const getNotificationClass = (type) => {
  return `notification-${type}`
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}

.notification-toast {
  position: fixed;
  right: 20px;
  min-width: 350px;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  margin-bottom: 10px;
  pointer-events: auto;
}

.notification-content {
  padding: 16px;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.notification-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #666;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Success styles */
.notification-success {
  border-left-color: #10b981;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-success h4 {
  color: #065f46;
}

/* Error styles */
.notification-error {
  border-left-color: #ef4444;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-error h4 {
  color: #991b1b;
}

/* Warning styles */
.notification-warning {
  border-left-color: #f59e0b;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}

.notification-warning h4 {
  color: #92400e;
}

/* Info styles */
.notification-info {
  border-left-color: #3b82f6;
}

.notification-info .notification-icon {
  color: #3b82f6;
}

.notification-info h4 {
  color: #1e40af;
}

/* TransitionGroup animations */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>