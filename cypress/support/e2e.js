// ***********************************************************
// Support file for Login Tests Only
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Configuración global
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevenir que errores no manejados fallen las pruebas
  return false
})
