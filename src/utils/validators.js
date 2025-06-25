/**
 * Validaciones comunes del sistema
 */

/**
 * Valida formato de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida número de teléfono (8 dígitos)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{8}$/
  return phoneRegex.test(phone)
}

/**
 * Valida contraseña (mínimo 8 caracteres)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 8
}

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value) => {
  return value && value.toString().trim().length > 0
}

/**
 * Valida un carnet estudiantil
 */
export const isValidCarnet = (carnet) => {
  return carnet && /^\d{6,10}$/.test(carnet.toString())
}

/**
 * Valida una calificación (0-100)
 */
export const isValidGrade = (grade) => {
  const num = parseFloat(grade)
  return !isNaN(num) && num >= 0 && num <= 100
}

/**
 * Valida una fecha
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date)
}

/**
 * Sanitiza input de texto
 */
export const sanitizeText = (text) => {
  if (!text) return ''
  return text.toString().trim().replace(/[<>]/g, '')
}
