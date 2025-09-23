// Course color management utility
import { ref, reactive } from 'vue'

// Color palette consistent across the application
export const COLOR_OPTIONS = [
  { name: 'Gris Oscuro', value: '#4a5568' },
  { name: 'Naranja', value: '#d97706' },
  { name: 'Púrpura', value: '#9f7aea' },
  { name: 'Azul', value: '#0891b2' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Amarillo', value: '#ca8a04' },
  { name: 'Verde', value: '#059669' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Índigo', value: '#4f46e5' },
  { name: 'Esmeralda', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Violeta', value: '#8b5cf6' }
]

// Reactive course colors store
const courseColorStore = reactive({})

// Event listeners for color changes
const colorChangeListeners = new Set()

/**
 * Get color for a course, either from localStorage or assign a default
 * @param {number|string} courseId - The course ID
 * @param {number} defaultIndex - Default color index to use if no saved color
 * @returns {string} The color hex value
 */
export function getCourseColor(courseId, defaultIndex = 0) {
  const key = `course_color_${courseId}`
  
  // Check reactive store first
  if (courseColorStore[courseId]) {
    return courseColorStore[courseId]
  }
  
  // Check localStorage
  const savedColor = localStorage.getItem(key)
  if (savedColor) {
    courseColorStore[courseId] = savedColor
    return savedColor
  }
  
  // Assign default color
  const defaultColor = COLOR_OPTIONS[defaultIndex % COLOR_OPTIONS.length].value
  courseColorStore[courseId] = defaultColor
  localStorage.setItem(key, defaultColor)
  
  return defaultColor
}

/**
 * Set color for a course and notify all listeners
 * @param {number|string} courseId - The course ID
 * @param {string} color - The color hex value
 */
export function setCourseColor(courseId, color) {
  const key = `course_color_${courseId}`
  
  // Update reactive store
  courseColorStore[courseId] = color
  
  // Update localStorage
  localStorage.setItem(key, color)
  
  // Notify all listeners
  colorChangeListeners.forEach(listener => {
    listener(courseId, color)
  })
}

/**
 * Subscribe to color change events
 * @param {Function} callback - Function to call when colors change
 * @returns {Function} Unsubscribe function
 */
export function subscribeToColorChanges(callback) {
  colorChangeListeners.add(callback)
  
  // Return unsubscribe function
  return () => {
    colorChangeListeners.delete(callback)
  }
}

/**
 * Get all course colors as a reactive object
 * @returns {Object} Reactive course colors object
 */
export function getCourseColorStore() {
  return courseColorStore
}

/**
 * Initialize colors for multiple courses
 * @param {Array} courseIds - Array of course IDs
 */
export function initializeCourseColors(courseIds) {
  courseIds.forEach((courseId, index) => {
    getCourseColor(courseId, index)
  })
}