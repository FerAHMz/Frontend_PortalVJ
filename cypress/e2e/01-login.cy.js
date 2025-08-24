describe('Login and Authentication', () => {
  beforeEach(() => {
    //Limpiar cualquier autenticación previa
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/login')
  })

  it('should display login form correctly', () => {
    cy.get('[data-cy="login-form"]').should('be.visible')
    cy.get('[data-cy="email-input"]').should('be.visible')
    cy.get('[data-cy="password-input"]').should('be.visible')
    cy.get('[data-cy="login-button"]').should('be.visible')
    cy.contains('Inicio de sesión').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    //Intentar enviar formulario con campos vacíos
    cy.get('[data-cy="login-button"]').click()
    
    //Verificar que no se almacenó token (login falló)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
    
    //Los campos deberían tener validación HTML5
    cy.get('[data-cy="email-input"]').should('have.attr', 'required')
    cy.get('[data-cy="password-input"]').should('have.attr', 'required')
  })

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        success: false,
        error: 'Credenciales inválidas'
      }
    }).as('loginFailed')

    cy.get('[data-cy="email-input"]').type('wrong@email.com')
    cy.get('[data-cy="password-input"]').type('wrongpassword')
    cy.get('[data-cy="login-button"]').click()
    
    cy.wait('@loginFailed')
    
    //Verificar que no se almacenó token (login falló)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
  })

  it('should successfully login as teacher and redirect to dashboard', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 1,
          email: 'teacher@test.com',
          rol: 'Maestro',
          nombre: 'Juan',
          apellido: 'Pérez'
        },
        token: 'fake-jwt-token'
      }
    }).as('loginSuccess')

    cy.get('[data-cy="email-input"]').type('teacher@test.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()
    
    cy.wait('@loginSuccess')
    
    //Verificar que se almacenó el token (login exitoso)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token')
      expect(win.localStorage.getItem('userRole')).to.equal('Maestro')
    })
    
    //Esperar redirección (dar tiempo para notificación y redirección)
    cy.url({ timeout: 5000 }).should('include', '/teacher')
  })

  it('should successfully login as parent and redirect to parent dashboard', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 2,
          email: 'parent@test.com',
          rol: 'Padre',
          nombre: 'María',
          apellido: 'García'
        },
        token: 'fake-jwt-token'
      }
    }).as('loginParentSuccess')

    cy.get('[data-cy="email-input"]').type('parent@test.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()
    
    cy.wait('@loginParentSuccess')
    
    //Verificar que se almacenó el token (login exitoso)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token')
      expect(win.localStorage.getItem('userRole')).to.equal('Padre')
    })
    
    //Esperar redirección
    cy.url({ timeout: 5000 }).should('include', '/parent')
  })

  it('should handle network errors gracefully', () => {
    cy.intercept('POST', '**/login', {
      forceNetworkError: true
    }).as('networkError')

    cy.get('[data-cy="email-input"]').type('teacher@test.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()
    
    cy.wait('@networkError')
    
    //Verificar que no se almacenó token (login falló)
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
  })
})
