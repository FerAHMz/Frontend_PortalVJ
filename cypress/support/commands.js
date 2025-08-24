// ***********************************************
// Commands for Login Tests Only
// ***********************************************

// Comando personalizado para login
Cypress.Commands.add('login', (userType = 'teacher') => {
  const users = {
    teacher: {
      email: 'teacher@test.com',
      password: 'password123',
      role: 'Maestro'
    },
    parent: {
      email: 'parent@test.com',
      password: 'password123',
      role: 'Padre'
    },
    admin: {
      email: 'admin@test.com',
      password: 'password123',
      role: 'Administrativo'
    }
  }

  const user = users[userType]
  
  // Interceptar la llamada de login
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: {
      success: true,
      user: {
        id: 1,
        email: user.email,
        rol: user.role,
        nombre: 'Test',
        apellido: 'User'
      },
      token: 'fake-jwt-token'
    }
  }).as('loginSuccess')

  cy.visit('/login')
  cy.get('[data-cy="email-input"]').type(user.email)
  cy.get('[data-cy="password-input"]').type(user.password)
  cy.get('[data-cy="login-button"]').click()
  cy.wait('@loginSuccess')
})
