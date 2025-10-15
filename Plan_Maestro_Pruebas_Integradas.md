# Plan Maestro de Pruebas Integradas - Portal Vanguardia Juvenil

## 📋 Información General del Proyecto

| Campo | Descripción |
|-------|-------------|
| **Proyecto** | Portal Vanguardia Juvenil - Sistema Educativo Integral |
| **Versión** | 2.0 - Integración Frontend/Backend |
| **Fecha de Creación** | 29 de Agosto, 2025 |
| **Responsable QA** | Equipo de Desarrollo |
| **Arquitectura** | Vue.js 3 + Node.js + PostgreSQL + Docker |
| **Almacenamiento de archivos** | Cloudflare R2 |

---

## 🎯 Objetivos de las Pruebas

### **Objetivo Principal:**
Validar la funcionalidad completa del sistema educativo integrado, asegurando que todos los módulos funcionen correctamente de manera individual y en conjunto.

### **Objetivos Específicos:**
- ✅ Verificar la integridad de datos entre frontend y backend
- ✅ Validar la seguridad del sistema (autenticación/autorización)
- ✅ Confirmar el rendimiento bajo carga normal y estrés
- ✅ Asegurar la compatibilidad cross-platform y cross-browser
- ✅ Validar la funcionalidad de almacenamiento en la nube (Cloudflare R2)
- ✅ Confirmar la responsividad en dispositivos móviles

---

## 📊 Alcance de las Pruebas

### **Módulos Incluidos:**

#### **🔐 Sistema de Autenticación**
- Login/Logout para todos los roles
- Validación de tokens JWT
- Control de sesiones
- Recuperación de contraseñas

#### **👥 Gestión de Usuarios**
- CRUD de maestros, directores, administradores
- Asignación de roles y permisos
- Validación de datos de usuario
- Importación masiva desde Excel

#### **📚 Gestión Académica**
- Creación y gestión de cursos
- Administración de grados y secciones
- Planificaciones académicas
- Sistema de calificaciones

#### **📁 Sistema de Archivos**
- Subida de archivos a Cloudflare R2
- Descarga mediante URLs presignadas
- Validación de tipos de archivo
- Gestión de metadatos

#### **💬 Sistema de Observaciones**
- Creación de observaciones por directores
- Visualización para maestros
- Edición y eliminación
- Historial de cambios

#### **💌 Sistema de Mensajería**
- Envío de mensajes entre usuarios
- Notificaciones en tiempo real
- Gestión de conversaciones
- Filtros por rol

#### **📱 Interfaz Responsiva**
- Adaptación a dispositivos móviles
- Navegación touch-friendly
- Optimización de carga

### **Módulos Excluidos:**
- Integración con sistemas externos (fuera del alcance actual)
- Funcionalidades de backup automático
- Reportes avanzados (fase futura)

---

## 🛠️ Herramientas y Tecnologías

### **Frontend Testing Stack:**
```json
{
  "unitTesting": {
    "framework": "Vitest",
    "utilities": "@vue/test-utils",
    "assertions": "Chai",
    "coverage": "c8"
  },
  "e2eTesting": {
    "framework": "Cypress",
    "plugins": ["cypress-file-upload", "cypress-axe"],
    "browsers": ["Chrome", "Firefox", "Edge"]
  },
  "componentTesting": {
    "framework": "Cypress Component Testing",
    "mounting": "@cypress/vue"
  }
}
```

### **Backend Testing Stack:**
```json
{
  "unitTesting": {
    "framework": "Jest",
    "supertest": "API endpoint testing",
    "coverage": "Istanbul"
  },
  "integrationTesting": {
    "database": "Jest + pg-mem",
    "apiTesting": "Supertest + Nock"
  },
  "loadTesting": {
    "framework": "Artillery",
    "monitoring": "Docker stats"
  }
}
```

### **Infrastructure Testing:**
```json
{
  "containerTesting": {
    "docker": "Docker Compose health checks",
    "networking": "Container connectivity tests"
  },
  "cloudTesting": {
    "storage": "Cloudflare R2 integration tests",
    "cdn": "File delivery validation"
  }
}
```

---

## 🧪 Estrategia de Pruebas

### **1. Pruebas Unitarias (40% del esfuerzo)**

#### **Frontend Components:**
```javascript
// Ejemplo de estructura de pruebas
describe('PlanificationsByGrade.vue', () => {
  describe('File Display', () => {
    it('should render file list when files are available', () => {
      // Test file rendering
    });
    
    it('should show empty state when no files exist', () => {
      // Test empty state
    });
    
    it('should handle file download correctly', () => {
      // Test download functionality
    });
  });
  
  describe('User Interactions', () => {
    it('should open planification detail modal', () => {
      // Test modal opening
    });
    
    it('should filter planifications by grade', () => {
      // Test filtering logic
    });
  });
});
```

#### **Backend Controllers:**
```javascript
describe('PlanificationController', () => {
  describe('File Management', () => {
    it('should upload file to Cloudflare R2', async () => {
      // Test file upload integration
    });
    
    it('should generate presigned download URLs', async () => {
      // Test URL generation
    });
    
    it('should validate file types and sizes', async () => {
      // Test file validation
    });
  });
  
  describe('CRUD Operations', () => {
    it('should create planification with proper validation', async () => {
      // Test creation logic
    });
    
    it('should retrieve planifications by teacher', async () => {
      // Test data retrieval
    });
  });
});
```

### **2. Pruebas de Integración (35% del esfuerzo)**

#### **API Integration Tests:**
```javascript
describe('Planification API Integration', () => {
  let teacherToken, directorToken, superUserToken;
  
  beforeAll(async () => {
    // Setup test tokens for each role
    teacherToken = await getTestToken('teacher');
    directorToken = await getTestToken('director');
    superUserToken = await getTestToken('superuser');
  });
  
  describe('Teacher Workflow', () => {
    it('should complete full planification lifecycle', async () => {
      // 1. Create planification
      const planification = await request(app)
        .post('/api/teacher/courses/1/planning')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(planificationData);
      
      // 2. Upload file
      const fileUpload = await request(app)
        .post(`/api/teacher/planning/${planification.body.id}/upload`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .attach('file', 'test-files/sample.pdf');
      
      // 3. Verify file is accessible
      const files = await request(app)
        .get(`/api/teacher/planning/${planification.body.id}/files`)
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(files.body.files).toHaveLength(1);
    });
  });
  
  describe('Director Workflow', () => {
    it('should allow director to add observations', async () => {
      // Test observation creation flow
    });
  });
  
  describe('Cross-Role Permissions', () => {
    it('should deny teacher access to superuser endpoints', async () => {
      const response = await request(app)
        .get('/api/superuser/planifications/by-grade')
        .set('Authorization', `Bearer ${teacherToken}`);
      
      expect(response.status).toBe(403);
    });
  });
});
```

#### **Database Integration Tests:**
```javascript
describe('Database Integration', () => {
  describe('File Metadata Consistency', () => {
    it('should maintain referential integrity between planifications and files', async () => {
      // Test database constraints
    });
    
    it('should cascade delete files when planification is deleted', async () => {
      // Test cascade operations
    });
  });
  
  describe('Transaction Management', () => {
    it('should rollback file upload if database insert fails', async () => {
      // Test transaction consistency
    });
  });
});
```

### **3. Pruebas End-to-End (20% del esfuerzo)**

#### **Critical User Journeys:**
```javascript
// cypress/e2e/teacher-planification-flow.cy.js
describe('Teacher Planification Complete Flow', () => {
  beforeEach(() => {
    cy.login('maestro1@example.com', 'password123');
  });
  
  it('should complete full planification workflow', () => {
    // Navigate to courses
    cy.visit('/teacher/courses');
    cy.get('[data-cy=course-card]').first().click();
    
    // Create new planification
    cy.get('[data-cy=create-planification]').click();
    cy.fillPlanificationForm({
      mes: 'enero',
      ciclo_escolar: '2025'
    });
    cy.get('[data-cy=submit-planification]').click();
    
    // Upload file
    cy.get('[data-cy=upload-file]').selectFile('cypress/fixtures/test-plan.pdf');
    cy.get('[data-cy=confirm-upload]').click();
    
    // Verify file appears in list
    cy.get('[data-cy=file-list]').should('contain', 'test-plan.pdf');
    
    // Test file download
    cy.get('[data-cy=download-file]').first().click();
    cy.verifyDownload('test-plan.pdf');
  });
  
  it('should display director observations', () => {
    cy.visit('/teacher/courses/1/planning/1/tasks');
    cy.get('[data-cy=observations-section]').should('be.visible');
    
    // Should show empty state when no observations
    cy.get('[data-cy=no-observations]').should('contain', 'No hay retroalimentación');
  });
});
```

#### **Cross-Browser Testing:**
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:5173',
    browsers: [
      {
        name: 'chrome',
        family: 'chromium',
        displayName: 'Chrome'
      },
      {
        name: 'firefox',
        family: 'firefox',
        displayName: 'Firefox'
      },
      {
        name: 'edge',
        family: 'chromium',
        displayName: 'Edge'
      }
    ]
  }
};
```

### **4. Pruebas de Rendimiento (5% del esfuerzo)**

#### **Load Testing Configuration:**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 20  # 20 users per second
    - duration: 600  # 10 minutes  
      arrivalRate: 50  # 50 users per second
  payload:
    path: "test-data/users.csv"
    fields:
      - "email"
      - "password"

scenarios:
  - name: "Login and File Upload Workflow"
    weight: 70
    flow:
      - post:
          url: "/api/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.token"
              as: "token"
      
      - get:
          url: "/api/teacher/courses"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - post:
          url: "/api/teacher/planning/1/upload"
          headers:
            Authorization: "Bearer {{ token }}"
          formData:
            file: "@test-files/sample.pdf"

  - name: "File Download Workflow"
    weight: 30
    flow:
      - get:
          url: "/api/teacher/planning/1/files"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - get:
          url: "/api/teacher/planning/files/1/download"
          headers:
            Authorization: "Bearer {{ token }}"
```

---

## 📋 Casos de Prueba Específicos

### **CP001: Autenticación de Usuario**
```gherkin
Feature: User Authentication
  As a system user
  I want to securely login to the portal
  So that I can access my role-specific features

  Scenario: Successful teacher login
    Given I am on the login page
    When I enter valid teacher credentials
    And I click the login button
    Then I should be redirected to the teacher dashboard
    And I should see my name in the header
    And the JWT token should be stored in localStorage

  Scenario: Failed login attempt
    Given I am on the login page
    When I enter invalid credentials
    And I click the login button
    Then I should see an error message
    And I should remain on the login page
    And no token should be stored
```

### **CP002: Planification File Upload**
```gherkin
Feature: File Upload to Planification
  As a teacher
  I want to upload files to my planifications
  So that I can share resources with administrators

  Scenario: Successful PDF upload
    Given I am logged in as a teacher
    And I am viewing a planification detail
    When I select a valid PDF file
    And I click upload
    Then the file should be uploaded to Cloudflare R2
    And the file metadata should be saved to database
    And the file should appear in the file list
    And I should see a success message

  Scenario: Invalid file type rejection
    Given I am logged in as a teacher
    And I am viewing a planification detail
    When I select an .exe file
    And I click upload
    Then I should see an error message
    And the file should not be uploaded
    And the file list should remain unchanged
```

### **CP003: Cross-Role File Access**
```gherkin
Feature: File Access Control
  As a system administrator
  I want to ensure proper file access controls
  So that users only see files they're authorized to access

  Scenario: SuperUser can view all planification files
    Given I am logged in as a SuperUser
    When I view planifications by grade
    And I select a planification
    Then I should see all files uploaded to that planification
    And I should be able to download any file

  Scenario: Teacher can only view their own planification files
    Given I am logged in as Teacher A
    When I try to access Teacher B's planification files directly
    Then I should receive a 403 Forbidden response
    And no file data should be returned
```

---

## 📊 Métricas y Criterios de Aceptación

### **Criterios de Cobertura:**
| Tipo de Prueba | Cobertura Mínima | Herramienta de Medición |
|----------------|------------------|-------------------------|
| **Código Frontend** | 85% | c8/Istanbul |
| **Código Backend** | 90% | Jest Coverage |
| **API Endpoints** | 100% | Supertest |
| **Componentes Vue** | 80% | Vue Test Utils |
| **E2E Scenarios** | 90% de flujos críticos | Cypress |

### **Criterios de Rendimiento:**
| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| **Tiempo de Respuesta API** | < 200ms (95% percentil) | Artillery |
| **Carga de Página** | < 2 segundos | Lighthouse |
| **Upload de Archivos** | < 5 segundos (archivos 10MB) | Custom metrics |
| **Concurrencia** | 100 usuarios simultáneos | Load testing |

### **Criterios de Calidad:**
| Aspecto | Estándar | Validación |
|---------|----------|------------|
| **Accesibilidad** | WCAG 2.1 AA | Cypress-axe |
| **Seguridad** | OWASP Top 10 | Manual + automated |
| **Cross-browser** | Chrome, Firefox, Edge, Safari | Cypress |
| **Mobile Responsive** | > 375px width | Manual testing |

---

## 🎯 Estrategia de Automatización

### **Pipeline de CI/CD:**
```yaml
# .github/workflows/test-pipeline.yml
name: Test Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./Frontend_PortalVJ
      
      - name: Run unit tests
        run: npm run test:unit
        working-directory: ./Frontend_PortalVJ
      
      - name: Run component tests
        run: npm run test:component
        working-directory: ./Frontend_PortalVJ
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: admin123.
          POSTGRES_DB: portalvj_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./Backend_PortalVJ/backend
      
      - name: Run unit tests
        run: npm run test:unit
        working-directory: ./Backend_PortalVJ/backend
      
      - name: Run integration tests
        run: npm run test:integration
        working-directory: ./Backend_PortalVJ/backend
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: postgres
          DB_PASSWORD: admin123.
          DB_NAME: portalvj_test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start application stack
        run: docker-compose up -d
      
      - name: Wait for services
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'
          timeout 60 bash -c 'until curl -f http://localhost:5173; do sleep 2; done'
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: ./Frontend_PortalVJ
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
      
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: ./Frontend_PortalVJ/cypress/screenshots
```

### **Test Data Management:**
```javascript
// test-data/fixtures.js
export const testData = {
  users: {
    teacher: {
      email: 'test.teacher@portalvj.com',
      password: 'TestPassword123!',
      role: 'Maestro'
    },
    director: {
      email: 'test.director@portalvj.com',
      password: 'TestPassword123!',
      role: 'Director'
    },
    superuser: {
      email: 'test.superuser@portalvj.com',
      password: 'TestPassword123!',
      role: 'SUP'
    }
  },
  
  planifications: {
    valid: {
      mes: 'enero',
      ciclo_escolar: '2025'
    },
    invalid: {
      mes: 'invalid_month',
      ciclo_escolar: null
    }
  },
  
  files: {
    validPdf: 'cypress/fixtures/test-planification.pdf',
    invalidFile: 'cypress/fixtures/malware.exe',
    largePdf: 'cypress/fixtures/large-document.pdf'
  }
};
```

---

## 🗓️ Cronograma de Ejecución

### **Fase 1: Preparación (Semana 1)**
- ✅ Configuración de herramientas de testing
- ✅ Creación de datos de prueba
- ✅ Setup de entorno de testing

### **Fase 2: Pruebas Unitarias (Semanas 2-3)**
- 🧪 Frontend component testing
- 🧪 Backend controller testing
- 🧪 Service layer testing
- 📊 Análisis de cobertura

### **Fase 3: Pruebas de Integración (Semanas 4-5)**
- 🔗 API integration testing
- 🔗 Database integration testing
- 🔗 File storage integration testing
- 🔗 Cross-service communication testing

### **Fase 4: Pruebas E2E (Semana 6)**
- 🎭 Critical user journey testing
- 🎭 Cross-browser testing
- 🎭 Mobile responsive testing
- 🎭 Accessibility testing

### **Fase 5: Pruebas de Rendimiento (Semana 7)**
- ⚡ Load testing
- ⚡ Stress testing
- ⚡ File upload performance
- ⚡ Concurrent user testing

### **Fase 6: Consolidación y Reporte (Semana 8)**
- 📋 Compilación de resultados
- 📋 Análisis de métricas
- 📋 Reporte final
- 📋 Recomendaciones

---

## 📊 Encuesta NSP (Nivel de Satisfacción del Usuario)

### **Metodología de Implementación:**

#### **Segmentación por Rol:**
```javascript
const nspSurvey = {
  roles: ['maestro', 'director', 'superuser'],
  
  commonQuestions: [
    {
      id: 'usability_navigation',
      question: '¿Qué tan fácil es navegar por el portal?',
      type: 'scale',
      scale: [1, 2, 3, 4, 5],
      category: 'usabilidad'
    },
    {
      id: 'performance_speed',
      question: '¿Las páginas cargan en tiempo razonable?',
      type: 'scale',
      scale: [1, 2, 3, 4, 5],
      category: 'rendimiento'
    }
  ],
  
  roleSpecificQuestions: {
    maestro: [
      {
        id: 'planification_creation',
        question: '¿El proceso de crear planificaciones es eficiente?',
        type: 'scale',
        scale: [1, 2, 3, 4, 5],
        category: 'funcionalidad'
      },
      {
        id: 'file_upload_ease',
        question: '¿Es fácil subir archivos a las planificaciones?',
        type: 'scale',
        scale: [1, 2, 3, 4, 5],
        category: 'funcionalidad'
      }
    ],
    
    director: [
      {
        id: 'observation_system',
        question: '¿El sistema de observaciones es útil para dar retroalimentación?',
        type: 'scale',
        scale: [1, 2, 3, 4, 5],
        category: 'funcionalidad'
      }
    ],
    
    superuser: [
      {
        id: 'admin_tools',
        question: '¿Las herramientas de administración son completas?',
        type: 'scale',
        scale: [1, 2, 3, 4, 5],
        category: 'funcionalidad'
      }
    ]
  }
};
```

#### **Sistema de Cálculo NSP:**
```javascript
// nsp-calculator.js
class NSPCalculator {
  constructor() {
    this.weights = {
      usabilidad: 0.30,
      funcionalidad: 0.40,
      rendimiento: 0.20,
      satisfaccion_general: 0.10
    };
  }
  
  calculateNSP(responses, userRole) {
    const categoryScores = this.calculateCategoryScores(responses);
    
    const weightedScore = Object.keys(this.weights).reduce((total, category) => {
      const score = categoryScores[category] || 0;
      return total + (score * this.weights[category]);
    }, 0);
    
    // Convert to percentage (0-100)
    return (weightedScore / 5) * 100;
  }
  
  calculateCategoryScores(responses) {
    const categories = {};
    
    responses.forEach(response => {
      const category = response.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(response.score);
    });
    
    // Calculate average for each category
    Object.keys(categories).forEach(category => {
      const scores = categories[category];
      categories[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });
    
    return categories;
  }
  
  generateReport(nspScore, responses) {
    return {
      overall_nsp: nspScore,
      rating: this.getRating(nspScore),
      category_breakdown: this.calculateCategoryScores(responses),
      recommendations: this.generateRecommendations(nspScore, responses),
      timestamp: new Date().toISOString()
    };
  }
  
  getRating(score) {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bueno';
    if (score >= 70) return 'Bueno';
    if (score >= 60) return 'Regular';
    return 'Necesita Mejoras';
  }
  
  generateRecommendations(score, responses) {
    const recommendations = [];
    
    if (score < 80) {
      recommendations.push('Considerar mejoras en la experiencia de usuario');
    }
    
    // Analyze by category
    const categoryScores = this.calculateCategoryScores(responses);
    
    if (categoryScores.usabilidad < 3.5) {
      recommendations.push('Mejorar la navegación y diseño de la interfaz');
    }
    
    if (categoryScores.rendimiento < 3.5) {
      recommendations.push('Optimizar el rendimiento del sistema');
    }
    
    if (categoryScores.funcionalidad < 3.5) {
      recommendations.push('Revisar y mejorar las funcionalidades principales');
    }
    
    return recommendations;
  }
}
```

### **Implementación de Recolección:**
```javascript
// survey-implementation.js
class SurveyManager {
  constructor() {
    this.surveyTriggers = {
      first_week: 7, // days after first login
      monthly: 30,   // every 30 days
      post_update: 1 // 1 day after system update
    };
  }
  
  async shouldShowSurvey(userId) {
    const userActivity = await this.getUserActivity(userId);
    const lastSurvey = await this.getLastSurveyDate(userId);
    
    // Check if user qualifies for survey
    if (this.isFirstWeekUser(userActivity)) return true;
    if (this.isMonthlyDue(lastSurvey)) return true;
    if (this.isPostUpdateDue(userActivity)) return true;
    
    return false;
  }
  
  async collectSurveyResponse(userId, responses) {
    const calculator = new NSPCalculator();
    const nspScore = calculator.calculateNSP(responses);
    const report = calculator.generateReport(nspScore, responses);
    
    await this.saveSurveyResponse({
      userId,
      responses,
      nspScore,
      report,
      timestamp: new Date()
    });
    
    return report;
  }
  
  async generateAggregateReport(timeframe = 'monthly') {
    const responses = await this.getSurveyResponses(timeframe);
    
    return {
      total_responses: responses.length,
      average_nsp: this.calculateAverageNSP(responses),
      nsp_by_role: this.calculateNSPByRole(responses),
      trends: this.calculateTrends(responses),
      recommendations: this.generateSystemRecommendations(responses)
    };
  }
}
```

---

## 📈 Reportes y Documentación

### **Estructura de Reportes:**

#### **Reporte Diario de Pruebas:**
```markdown
# Reporte Diario - [Fecha]

## Resumen Ejecutivo
- ✅ Pruebas Ejecutadas: X
- ❌ Pruebas Fallidas: Y
- 🔄 Pruebas en Progreso: Z
- 📊 Cobertura Actual: W%

## Defectos Encontrados
| ID | Severidad | Módulo | Descripción | Estado |
|----|-----------|---------|-------------|---------|
| DEF-001 | Alta | File Upload | Error en validación de archivos | Abierto |

## Métricas de Rendimiento
- Tiempo promedio de respuesta: Xms
- Throughput: Y req/sec
- Errores por minuto: Z
```

#### **Reporte de NSP Mensual:**
```javascript
// monthly-nsp-report.js
const monthlyReport = {
  period: '2025-08',
  summary: {
    total_surveys: 150,
    response_rate: 75.5,
    average_nsp: 82.3,
    improvement_vs_last_month: +3.2
  },
  
  by_role: {
    maestro: { nsp: 84.1, responses: 89 },
    director: { nsp: 81.7, responses: 34 },
    superuser: { nsp: 79.8, responses: 27 }
  },
  
  category_breakdown: {
    usabilidad: 4.1,
    funcionalidad: 4.0,
    rendimiento: 3.8,
    satisfaccion_general: 4.2
  },
  
  top_issues: [
    'Tiempo de carga en dispositivos móviles',
    'Complejidad en el proceso de subida de archivos',
    'Falta de notificaciones push'
  ],
  
  recommendations: [
    'Optimizar assets para mobile',
    'Simplificar UI de upload',
    'Implementar sistema de notificaciones'
  ]
};
```

---

## ✅ Criterios de Finalización

### **Criterios de Éxito:**
- ✅ 100% de casos de prueba críticos ejecutados
- ✅ 0 defectos de severidad alta pendientes
- ✅ Cobertura de código ≥ 85% (frontend) / 90% (backend)
- ✅ NSP promedio ≥ 80%
- ✅ Rendimiento dentro de objetivos definidos
- ✅ Documentación completa y actualizada

### **Entregables:**
1. **Suite de Pruebas Automatizadas** - Configurada y funcional
2. **Reporte de Cobertura** - Con métricas detalladas
3. **Documentación de Casos de Prueba** - Para referencia futura
4. **Manual de Testing** - Para el equipo de desarrollo
5. **Dashboard de NSP** - Sistema de monitoreo continuo
6. **Plan de Mejora Continua** - Basado en resultados obtenidos

---

## 🔒 PLAN DE PRUEBAS DE SEGURIDAD OWASP TOP 10 2021

### **📋 Información General de Pruebas de Seguridad**

| Campo | Descripción |
|-------|-------------|
| **Estándar de Referencia** | OWASP Top 10 2021 |
| **Tipo de Pruebas** | Pruebas No Funcionales - Seguridad |
| **Metodología** | Análisis de Vulnerabilidades, Pruebas de Penetración, Auditoría de Código |
| **Herramientas** | OWASP ZAP, Burp Suite, Manual Testing |
| **Cobertura Mínima** | 4 áreas críticas del OWASP Top 10 2021 |

---

### **🎯 Áreas de Seguridad a Evaluar**

#### **A01:2021 - Pérdida de Control de Acceso**
#### **A03:2021 - Inyección**
#### **A05:2021 - Configuración de Seguridad Incorrecta**
#### **A07:2021 - Fallas de Identificación y Autenticación**

---

## 🔐 A01:2021 - PÉRDIDA DE CONTROL DE ACCESO

### **Descripción:**
Validación de que los controles de acceso implementen correctamente las políticas de autorización, evitando que los usuarios actúen fuera de sus permisos asignados.

### **Módulos del Sistema a Evaluar:**
- Sistema de autenticación y autorización
- Dashboard de roles (Teacher, Director, Admin, SuperUser, Parent)
- API endpoints de backend
- Acceso a rutas del frontend

---

### **Casos de Prueba - Control de Acceso**

#### **🧪 Caso PS-A01-001: Validación de Acceso por Roles**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A01-001 |
| **Título** | Verificar acceso restringido por roles de usuario |
| **Prioridad** | Alta |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Iniciar sesión como usuario "Parent" (padre de familia)
2. Intentar acceder directamente a la URL `/teacher/dashboard`
3. Intentar acceder directamente a la URL `/director/planning-course`
4. Intentar acceder directamente a la URL `/admin/manual-payments`
5. Verificar que todas las rutas restringidas redirijan al login o muestren error 403

**Parámetros de Entrada:**
- Usuario: parent@test.com / password123
- URLs no autorizadas: `/teacher/*`, `/director/*`, `/admin/*`, `/superuser/*`

**Resultados Esperados:**
- ❌ Acceso denegado a rutas no autorizadas
- ✅ Redirección automática al login o página de error
- ✅ Mensaje de error claro sobre falta de permisos
- ✅ No exposición de información sensible en respuestas de error

---

#### **🧪 Caso PS-A01-002: Manipulación de URLs y Parámetros**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A01-002 |
| **Título** | Verificar protección contra manipulación de URLs |
| **Prioridad** | Alta |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Iniciar sesión como usuario "Teacher"
2. Acceder a la gestión de estudiantes: `/teacher/students`
3. Modificar parámetros en la URL: `/teacher/students?userId=123&role=director`
4. Intentar acceder a datos de otros usuarios: `/api/users/456` (ID no propio)
5. Verificar que no se puedan ver datos de otros usuarios

**Parámetros de Entrada:**
- Usuario legítimo: teacher@test.com
- IDs de usuarios no autorizados: 456, 789, admin_id
- Parámetros maliciosos: `?role=admin`, `?permissions=all`

**Resultados Esperados:**
- ❌ No acceso a datos de otros usuarios
- ✅ Validación servidor-side de permisos
- ✅ Respuesta con error 403 o datos vacíos
- ✅ Log de intento de acceso no autorizado

---

#### **🧪 Caso PS-A01-003: Validación de Tokens JWT**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A01-003 |
| **Título** | Verificar integridad y validación de tokens JWT |
| **Prioridad** | Crítica |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Interceptar token JWT válido usando herramientas de desarrollo
2. Modificar el payload del token (cambiar rol de "teacher" a "admin")
3. Realizar petición a API con token modificado
4. Verificar que el servidor rechace el token alterado
5. Probar con token expirado

**Parámetros de Entrada:**
- Token JWT válido original
- Token JWT con payload modificado
- Token JWT expirado
- Token JWT con firma inválida

**Resultados Esperados:**
- ❌ Rechazo de tokens modificados
- ❌ Rechazo de tokens expirados
- ✅ Error 401 Unauthorized
- ✅ Limpieza automática de sesión inválida

---

## 💉 A03:2021 - INYECCIÓN

### **Descripción:**
Validación de que la aplicación esté protegida contra ataques de inyección SQL, NoSQL, comandos del sistema operativo y otras formas de inyección de código malicioso.

### **Módulos del Sistema a Evaluar:**
- Formularios de login y registro
- Búsquedas de estudiantes, maestros y cursos
- Carga masiva de datos desde Excel/CSV
- API endpoints que reciben parámetros de usuario

---

### **Casos de Prueba - Inyección**

#### **🧪 Caso PS-A03-001: Inyección SQL en Formularios de Login**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A03-001 |
| **Título** | Verificar protección contra inyección SQL en login |
| **Prioridad** | Crítica |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Acceder al formulario de login
2. Introducir payloads de inyección SQL en campo email:
   - `admin@test.com' OR '1'='1' --`
   - `'; DROP TABLE users; --`
   - `admin@test.com' UNION SELECT * FROM users --`
3. Introducir payloads en campo password
4. Verificar que el sistema rechace todos los intentos

**Parámetros de Entrada:**
- Email malicioso: `admin' OR '1'='1' --`
- Password malicioso: `password' OR 1=1 --`
- Combinaciones con UNION, DROP, INSERT, UPDATE

**Resultados Esperados:**
- ❌ No bypass de autenticación
- ✅ Error de credenciales inválidas
- ✅ Sanitización de entrada implementada
- ✅ Uso de consultas parametrizadas/prepared statements

---

#### **🧪 Caso PS-A03-002: Inyección en Búsquedas de Sistema**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A03-002 |
| **Título** | Verificar protección contra inyección en búsquedas |
| **Prioridad** | Alta |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Iniciar sesión como usuario autorizado
2. Acceder a funcionalidad de búsqueda de estudiantes
3. Introducir payloads de inyección en campo de búsqueda:
   - `'; SELECT * FROM payments --`
   - `student" UNION SELECT password FROM users --`
4. Repetir en búsquedas de maestros y cursos

**Parámetros de Entrada:**
- Búsqueda: `Juan'; DROP TABLE students; --`
- Filtros: `grade=1' OR '1'='1`
- Parámetros GET/POST con inyección SQL

**Resultados Esperados:**
- ❌ No ejecución de comandos SQL maliciosos
- ✅ Resultados de búsqueda normales o vacíos
- ✅ Validación y sanitización de entrada
- ✅ Escape de caracteres especiales

---

#### **🧪 Caso PS-A03-003: Inyección en Carga de Archivos**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A03-003 |
| **Título** | Verificar protección en procesamiento de archivos CSV/Excel |
| **Prioridad** | Alta |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Crear archivo CSV con datos maliciosos:
   - Nombres con caracteres SQL: `Juan'; DROP TABLE --`
   - Emails con inyección: `user@test.com'; UPDATE users --`
2. Subir archivo usando funcionalidad de carga masiva
3. Verificar que el sistema sanitice los datos antes de insertar
4. Confirmar que no se ejecuten comandos maliciosos

**Parámetros de Entrada:**
- Archivo CSV con payloads de inyección
- Datos con caracteres especiales: `<>'"&`
- Comandos de sistema en campos de texto

**Resultados Esperados:**
- ✅ Sanitización de datos del archivo
- ❌ No ejecución de comandos maliciosos
- ✅ Validación de formato y contenido
- ✅ Log de errores sin exposición de estructura DB

---

## ⚙️ A05:2021 - CONFIGURACIÓN DE SEGURIDAD INCORRECTA

### **Descripción:**
Evaluación de configuraciones de seguridad en servidores web, aplicaciones, bases de datos y servicios en la nube para identificar configuraciones inseguras.

### **Módulos del Sistema a Evaluar:**
- Configuración de Docker containers
- Configuración de servidor web (nginx/apache)
- Headers de seguridad HTTP
- Configuración de base de datos PostgreSQL
- Configuración de Cloudflare R2

---

### **Casos de Prueba - Configuración de Seguridad**

#### **🧪 Caso PS-A05-001: Validación de Headers de Seguridad HTTP**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A05-001 |
| **Título** | Verificar implementación de headers de seguridad |
| **Prioridad** | Media |
| **Tipo** | Positiva |

**Pasos de Ejecución:**
1. Realizar petición HTTP al dominio principal
2. Inspeccionar headers de respuesta usando herramientas de desarrollo
3. Verificar presencia de headers de seguridad críticos
4. Validar configuración correcta de cada header

**Parámetros de Entrada:**
- URL del sistema: `https://portal-vanguardia.com`
- Herramientas: Browser DevTools, curl, OWASP ZAP

**Resultados Esperados:**
- ✅ `Content-Security-Policy` configurado
- ✅ `X-Frame-Options: DENY` o `SAMEORIGIN`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Strict-Transport-Security` con HTTPS
- ✅ `X-XSS-Protection: 1; mode=block`
- ❌ No exposición de `Server` header con versión

---

#### **🧪 Caso PS-A05-002: Verificación de Configuración de Base de Datos**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A05-002 |
| **Título** | Validar configuración segura de PostgreSQL |
| **Prioridad** | Alta |
| **Tipo** | Positiva/Negativa |

**Pasos de Ejecución:**
1. Verificar que la BD no esté expuesta públicamente
2. Confirmar uso de contraseñas fuertes para usuarios de BD
3. Validar que no existan usuarios por defecto activos
4. Verificar cifrado de conexiones (SSL/TLS)
5. Confirmar logs de acceso habilitados

**Parámetros de Entrada:**
- Host de BD: no debe ser accesible desde internet
- Usuarios por defecto: postgres, admin, root
- Puertos: 5432 (no debe estar abierto públicamente)

**Resultados Esperados:**
- ❌ No acceso directo desde internet a BD
- ✅ Autenticación requerida para acceso
- ✅ Cifrado SSL/TLS habilitado
- ❌ No usuarios con contraseñas por defecto
- ✅ Logs de auditoría activos

---

#### **🧪 Caso PS-A05-003: Configuración de Contenedores Docker**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A05-003 |
| **Título** | Verificar configuración segura de contenedores |
| **Prioridad** | Media |
| **Tipo** | Positiva |

**Pasos de Ejecución:**
1. Inspeccionar Dockerfile para mejores prácticas
2. Verificar que contenedores no corran como root
3. Confirmar que puertos innecesarios no estén expuestos
4. Validar que secretos no estén hardcodeados
5. Verificar actualizaciones de imágenes base

**Parámetros de Entrada:**
- Archivos: Dockerfile, docker-compose.yml
- Comandos: `docker inspect`, `docker ps`

**Resultados Esperados:**
- ✅ Usuario no-root para procesos de aplicación
- ❌ No exposición de puertos innecesarios
- ✅ Variables de entorno para configuración sensible
- ✅ Imágenes base actualizadas
- ✅ Uso de multi-stage builds cuando aplique

---

## 🔑 A07:2021 - FALLAS DE IDENTIFICACIÓN Y AUTENTICACIÓN

### **Descripción:**
Evaluación de los mecanismos de autenticación, gestión de sesiones y políticas de contraseñas para identificar debilidades que podrían permitir ataques automatizados o compromiso de cuentas.

### **Módulos del Sistema a Evaluar:**
- Sistema de login/logout
- Gestión de sesiones JWT
- Recuperación de contraseñas
- Políticas de contraseñas
- Autenticación multi-factor (si aplicable)

---

### **Casos de Prueba - Identificación y Autenticación**

#### **🧪 Caso PS-A07-001: Validación de Políticas de Contraseñas**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A07-001 |
| **Título** | Verificar implementación de políticas de contraseñas fuertes |
| **Prioridad** | Alta |
| **Tipo** | Positiva/Negativa |

**Pasos de Ejecución:**
1. Intentar crear cuenta con contraseñas débiles:
   - `123456`
   - `password`
   - `admin`
   - `qwerty`
2. Verificar que el sistema rechace contraseñas comunes
3. Validar requisitos mínimos de complejidad
4. Confirmar que no se reutilicen contraseñas anteriores

**Parámetros de Entrada:**
- Contraseñas débiles: lista top 10,000 contraseñas más comunes
- Contraseñas cortas: menos de 8 caracteres
- Contraseñas sin complejidad: solo letras o solo números

**Resultados Esperados:**
- ❌ Rechazo de contraseñas en lista negra
- ✅ Requisito mínimo: 8+ caracteres
- ✅ Combinación de letras, números y símbolos
- ✅ Validación tanto frontend como backend
- ✅ Mensajes claros sobre requisitos

---

#### **🧪 Caso PS-A07-002: Protección contra Ataques de Fuerza Bruta**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A07-002 |
| **Título** | Verificar protección contra ataques automatizados |
| **Prioridad** | Crítica |
| **Tipo** | Negativa |

**Pasos de Ejecución:**
1. Identificar cuenta de usuario válida: `teacher@test.com`
2. Realizar intentos de login fallidos consecutivos (10-15 intentos)
3. Verificar implementación de rate limiting
4. Confirmar bloqueo temporal de cuenta o IP
5. Validar que se generen logs de seguridad

**Parámetros de Entrada:**
- Usuario válido: `teacher@test.com`
- Contraseñas incorrectas: lista de 20 contraseñas comunes
- Frecuencia: 1 intento por segundo
- Origen: misma IP para verificar bloqueo

**Resultados Esperados:**
- ✅ Bloqueo después de 5-10 intentos fallidos
- ✅ Incremento progresivo de tiempo de espera
- ✅ Log de intentos sospechosos
- ✅ Notificación al administrador
- ❌ No denegación de servicio para otros usuarios

---

#### **🧪 Caso PS-A07-003: Gestión Segura de Sesiones**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A07-003 |
| **Título** | Verificar gestión segura de tokens y sesiones |
| **Prioridad** | Alta |
| **Tipo** | Positiva |

**Pasos de Ejecución:**
1. Iniciar sesión y obtener token JWT
2. Verificar que token tenga tiempo de expiración
3. Realizar logout y confirmar invalidación de token
4. Intentar usar token después de logout
5. Verificar renovación automática de token antes de expiración

**Parámetros de Entrada:**
- Credenciales válidas de prueba
- Tokens JWT generados
- Diferentes navegadores/dispositivos

**Resultados Esperados:**
- ✅ Tokens con tiempo de vida limitado (< 24 horas)
- ✅ Invalidación efectiva en logout
- ❌ Tokens inválidos rechazados por API
- ✅ Renovación automática antes de expiración
- ✅ Un token por sesión (no reutilización)

---

#### **🧪 Caso PS-A07-004: Recuperación Segura de Contraseñas**
| Campo | Detalle |
|-------|---------|
| **ID del Caso** | PS-A07-004 |
| **Título** | Verificar proceso seguro de recuperación de contraseñas |
| **Prioridad** | Media |
| **Tipo** | Positiva |

**Pasos de Ejecución:**
1. Usar función "Olvidé mi contraseña"
2. Verificar que no se revele información sobre existencia de usuario
3. Confirmar que token de recuperación expire en tiempo razonable
4. Validar que token solo sea utilizable una vez
5. Verificar que nueva contraseña cumpla políticas

**Parámetros de Entrada:**
- Email existente en sistema
- Email no existente en sistema
- Tokens de recuperación generados

**Resultados Esperados:**
- ✅ Mensaje genérico sin revelar existencia de usuario
- ✅ Token de recuperación de una sola vez
- ✅ Expiración de token en 15-30 minutos
- ✅ Invalidación de sesiones activas al cambiar contraseña
- ✅ Notificación por email de cambio de contraseña

---

## 📊 RESUMEN DE COBERTURA DE PRUEBAS DE SEGURIDAD

### **Estadísticas de Casos de Prueba**

| Categoría OWASP | Casos de Prueba | Prioridad Crítica | Prioridad Alta | Prioridad Media |
|-----------------|----------------|-------------------|----------------|-----------------|
| **A01 - Control de Acceso** | 3 | 1 | 2 | 0 |
| **A03 - Inyección** | 3 | 1 | 2 | 0 |
| **A05 - Configuración** | 3 | 0 | 1 | 2 |
| **A07 - Autenticación** | 4 | 1 | 2 | 1 |
| **TOTAL** | **13** | **3** | **7** | **3** |

---

### **Herramientas de Seguridad Recomendadas**

#### **🔧 Herramientas Automatizadas**
- **OWASP ZAP:** Proxy de interceptación y scanner de vulnerabilidades
- **Burp Suite Community:** Análisis manual de seguridad web
- **SQLMap:** Detección y explotación de inyección SQL
- **Nmap:** Escaneo de puertos y servicios
- **OWASP Dependency Check:** Análisis de componentes vulnerables

#### **🔧 Herramientas de Análisis de Código**
- **SonarQube:** Análisis estático de calidad y seguridad
- **ESLint Security Plugin:** Reglas de seguridad para JavaScript
- **Bandit:** Análisis de seguridad para código Python (si aplicable)

#### **🔧 Herramientas de Configuración**
- **Docker Security Scanning:** Análisis de vulnerabilidades en imágenes
- **SSL Labs Test:** Evaluación de configuración HTTPS
- **Mozilla Observatory:** Análisis de headers de seguridad

---

### **Cronograma de Ejecución de Pruebas de Seguridad**

| Fase | Semana | Actividades | Responsable |
|------|--------|-------------|-------------|
| **Preparación** | 1 | Configuración de herramientas y entorno de pruebas | Equipo QA |
| **A01 - Control de Acceso** | 2 | Ejecución de casos PS-A01-001 a PS-A01-003 | Security Tester |
| **A03 - Inyección** | 3 | Ejecución de casos PS-A03-001 a PS-A03-003 | Security Tester |
| **A05 - Configuración** | 4 | Ejecución de casos PS-A05-001 a PS-A05-003 | DevOps + QA |
| **A07 - Autenticación** | 5 | Ejecución de casos PS-A07-001 a PS-A07-004 | Security Tester |
| **Análisis y Reporte** | 6 | Compilación de resultados y recomendaciones | Equipo QA |
| **Remediación** | 7-8 | Corrección de vulnerabilidades identificadas | Desarrollo |
| **Re-testing** | 9 | Verificación de correcciones implementadas | Equipo QA |

---

### **Criterios de Aceptación de Seguridad**

#### **✅ Criterios de Éxito**
- **100%** de casos críticos deben pasar
- **≥ 95%** de casos de alta prioridad deben pasar
- **≥ 90%** de casos de media prioridad deben pasar
- **Cero vulnerabilidades críticas** en producción
- **Implementación completa** de headers de seguridad

#### **📋 Entregables de Seguridad**
1. **Reporte de Vulnerabilidades:** Detalle de todas las vulnerabilidades encontradas
2. **Plan de Remediación:** Priorización y cronograma de correcciones
3. **Configuración de Seguridad:** Documentación de configuraciones seguras
4. **Guía de Buenas Prácticas:** Recomendaciones para el equipo de desarrollo

---

### **Gestión de Riesgos de Seguridad**

#### **🔴 Riesgo Alto**
- **Acceso no autorizado a datos sensibles:** Implementar controles de acceso estrictos
- **Inyección SQL exitosa:** Utilizar prepared statements y validación de entrada
- **Sesiones comprometidas:** Implementar gestión segura de tokens JWT

#### **🟡 Riesgo Medio**
- **Configuraciones inseguras:** Establecer hardening de servidores
- **Headers de seguridad faltantes:** Implementar CSP y otros headers
- **Contraseñas débiles:** Aplicar políticas de contraseñas robustas

#### **🟢 Riesgo Bajo**
- **Exposición de información de versiones:** Ocultar headers de servidor
- **Logs insuficientes:** Mejorar logging de eventos de seguridad

---

## 👨‍👩‍👧‍👦 PRUEBAS DE EXPERIENCIA DE USUARIO (UX) - PERFIL PADRES

### **📋 Información General de Pruebas UX**

| Campo | Descripción |
|-------|-------------|
| **Tipo de Pruebas** | Experiencia de Usuario (UX Testing) |
| **Usuario Objetivo** | Padres de Familia |
| **Metodología** | Task-based Testing, Think Aloud Protocol |
| **Métricas UX** | Task Success Rate, Time on Task, User Satisfaction (SUS) |
| **Dispositivos** | Desktop, Tablet, Mobile |
| **Criterio de Éxito** | ≥85% Task Success Rate, ≥4.0/5.0 Satisfaction Score |

---

### **📝 RESUMEN EJECUTIVO DE CASOS UX - PADRES**

| ID Caso | Título Corto | Descripción Resumida | Tiempo | Prioridad |
|---------|--------------|---------------------|---------|-----------|
| **UX-P001** | Consulta de Calificaciones | Padre revisa notas de su hijo, interpreta sistema de calificaciones y descarga reporte académico en PDF desde móvil | 7-12 min | Alta |
| **UX-P002** | Comunicación con Maestros | Padre envía mensaje al maestro sobre dificultades académicas, responde mensajes recibidos y programa reunión virtual | 9-14 min | Alta |
| **UX-P003** | Gestión de Pagos Escolares | Madre consulta estado financiero de 2 hijos, realiza pago online con tarjeta y genera reporte de gastos para empleador | 11-17 min | Media |

---

### **🎯 Objetivos de las Pruebas UX para Padres**

**Objetivo Principal:**
Validar que los padres de familia puedan completar sus tareas principales de manera intuitiva, eficiente y satisfactoria en el sistema educativo.

**Objetivos Específicos:**
- ✅ Verificar facilidad de navegación en funcionalidades clave
- ✅ Evaluar comprensibilidad de la información académica presentada  
- ✅ Validar eficiencia en procesos de comunicación con maestros
- ✅ Confirmar usabilidad en dispositivos móviles (principal dispositivo de acceso)
- ✅ Identificar puntos de fricción en el flujo de usuario

### **⚡ TAREAS RESUMIDAS POR CASO**

| Caso | Tarea 1 | Tarea 2 | Tarea 3 |
|------|---------|---------|---------|
| **UX-P001** | Login y navegación a calificaciones (2-3 min) | Interpretar notas y buscar comentarios del maestro (3-5 min) | Descargar reporte académico en PDF (2-4 min) |
| **UX-P002** | Enviar mensaje nuevo al maestro de matemáticas (3-5 min) | Responder mensaje y adjuntar foto de tarea (2-3 min) | Programar reunión virtual con horarios disponibles (4-6 min) |
| **UX-P003** | Consultar estado financiero de 2 hijos (3-4 min) | Realizar pago de matrícula con tarjeta (5-8 min) | Generar reporte anual para empleador (3-5 min) |

---

## 📱 CASO UX-P001: CONSULTA DE CALIFICACIONES Y PROGRESO ACADÉMICO

### **🎯 Escenario de Prueba**
**Título:** "Consulta integral del rendimiento académico de mi hijo/a"

**Contexto:** 
María Rodríguez es madre de familia, tiene 35 años y usa principalmente su teléfono móvil para acceder a internet. Quiere revisar las calificaciones de su hijo Juan (grado 5°) porque se acercan las reuniones de padres y necesita prepararse.

**Usuario Tipo:** Padre/Madre trabajador(a), nivel tecnológico básico-intermedio

---

### **📋 Tareas de Prueba UX-P001**

#### **Tarea 1: Acceso inicial al sistema**
**Objetivo:** Evaluar la facilidad de login y orientación inicial
**Tiempo Esperado:** 2-3 minutos

**Pasos del Usuario:**
1. Abrir navegador móvil y acceder al portal
2. Introducir credenciales de acceso (email y contraseña)
3. Navegar hasta encontrar información de su hijo Juan
4. Localizar sección de calificaciones/notas

**Métricas a Evaluar:**
- **Task Success Rate:** ¿Logra acceder exitosamente? (Sí/No)
- **Time on Task:** Tiempo total para completar login y llegar a calificaciones
- **Error Rate:** Número de clics incorrectos o páginas erróneas visitadas
- **User Confidence:** Escala 1-5 sobre confianza durante el proceso

**Criterios de Éxito:**
- ✅ Acceso exitoso en ≤ 3 minutos
- ✅ Máximo 2 errores de navegación
- ✅ Confianza del usuario ≥ 4/5

#### **Tarea 2: Interpretación de calificaciones**
**Objetivo:** Validar comprensibilidad de la información académica
**Tiempo Esperado:** 3-5 minutos

**Pasos del Usuario:**
1. Revisar calificaciones del mes actual
2. Identificar materia con calificación más baja
3. Buscar comentarios o observaciones del maestro
4. Comparar rendimiento con período anterior

**Métricas a Evaluar:**
- **Information Findability:** ¿Encuentra la información buscada? (Tiempo)
- **Comprehension Rate:** ¿Entiende el sistema de calificaciones? (Test de comprensión)
- **Visual Clarity:** ¿Los gráficos/tablas son claros? (Escala 1-5)
- **Actionable Insights:** ¿Puede identificar áreas de mejora? (Sí/No)

**Criterios de Éxito:**
- ✅ Identificación correcta de materia más baja en ≤ 2 minutos
- ✅ Comprensión del sistema de calificación ≥ 80%
- ✅ Claridad visual ≥ 4/5

#### **Tarea 3: Descarga de reporte académico**
**Objetivo:** Evaluar facilidad para obtener documentos oficiales
**Tiempo Esperado:** 2-4 minutos

**Pasos del Usuario:**
1. Buscar opción para generar/descargar reporte de calificaciones
2. Seleccionar período académico (último trimestre)
3. Generar y descargar documento PDF
4. Verificar que el archivo se descargó correctamente

**Métricas a Evaluar:**
- **Feature Discoverability:** ¿Encuentra la función de descarga fácilmente?
- **Process Completion:** ¿Completa la descarga exitosamente?
- **Mobile Usability:** ¿El proceso funciona bien en móvil?
- **File Quality:** ¿El PDF generado es legible y completo?

**Criterios de Éxito:**
- ✅ Descarga exitosa en ≤ 4 minutos
- ✅ Proceso intuitivo (máximo 1 ayuda requerida)
- ✅ PDF legible y con información completa

---

## 💬 CASO UX-P002: COMUNICACIÓN CON MAESTROS

### **🎯 Escenario de Prueba**
**Título:** "Comunicación efectiva con el maestro sobre el desempeño de mi hijo/a"

**Contexto:**
Carlos Méndez es padre soltero, trabaja en horarios rotativos y necesita comunicarse con la maestra de su hija Ana (grado 3°) sobre algunas dificultades que ha observado en matemáticas. Prefiere usar mensajes escritos porque no siempre puede llamar.

**Usuario Tipo:** Padre ocupado, necesidad de comunicación asíncrona

---

### **📋 Tareas de Prueba UX-P002**

#### **Tarea 1: Envío de mensaje nuevo**
**Objetivo:** Evaluar facilidad para iniciar comunicación con maestros
**Tiempo Esperado:** 3-5 minutos

**Pasos del Usuario:**
1. Acceder a la sección de mensajes/comunicación
2. Buscar al maestro de matemáticas de su hija Ana
3. Redactar mensaje sobre dificultades observadas en casa
4. Enviar mensaje y confirmar que se envió correctamente

**Métricas a Evaluar:**
- **Navigation Efficiency:** Tiempo para llegar a la función de mensajes
- **Teacher Findability:** Facilidad para encontrar al maestro correcto
- **Message Composition:** Claridad del editor de mensajes
- **Send Confirmation:** Feedback claro sobre envío exitoso

**Criterios de Éxito:**
- ✅ Envío de mensaje en ≤ 5 minutos
- ✅ Identificación correcta del maestro
- ✅ Confirmación clara de envío recibida

#### **Tarea 2: Respuesta a mensaje del maestro**
**Objetivo:** Validar flujo de comunicación bidireccional
**Tiempo Esperado:** 2-3 minutos

**Pasos del Usuario:**
1. Verificar si hay mensajes nuevos (notificación)
2. Leer respuesta del maestro con recomendaciones
3. Responder confirmando que implementará las sugerencias
4. Adjuntar foto de tarea donde se ve la dificultad

**Métricas a Evaluar:**
- **Notification Visibility:** ¿Las notificaciones son claras?
- **Message Threading:** ¿Se entiende la conversación completa?
- **File Attachment:** ¿Es fácil adjuntar archivos desde móvil?
- **Response Speed:** Tiempo para completar la respuesta

**Criterios de Éxito:**
- ✅ Notificación de mensaje nuevo visible
- ✅ Respuesta exitosa con archivo adjunto en ≤ 3 minutos
- ✅ Hilo de conversación claro y organizado

#### **Tarea 3: Programación de reunión virtual**
**Objetivo:** Evaluar funcionalidad de coordinación de citas
**Tiempo Esperado:** 4-6 minutos

**Pasos del Usuario:**
1. Solicitar reunión virtual con el maestro
2. Ver horarios disponibles del maestro
3. Seleccionar horario que coincida con su disponibilidad
4. Confirmar cita y recibir detalles de acceso (link, hora)

**Métricas a Evaluar:**
- **Scheduling Interface:** Claridad del calendario/horarios
- **Availability Display:** ¿Se muestran claramente los horarios disponibles?
- **Booking Completion:** ¿El proceso de reserva es exitoso?
- **Confirmation Details:** ¿Recibe toda la información necesaria?

**Criterios de Éxito:**
- ✅ Reserva de cita exitosa en ≤ 6 minutos
- ✅ Horarios disponibles claramente visibles
- ✅ Confirmación con detalles completos (fecha, hora, link)

---

## 💳 CASO UX-P003: CONSULTA Y GESTIÓN DE PAGOS ESCOLARES

### **🎯 Escenario de Prueba**
**Título:** "Gestión completa de pagos y obligaciones financieras escolares"

**Contexto:**
Ana López es madre de dos hijos (Sofía en grado 8° y Diego en grado 2°) y necesita revisar los pagos pendientes del mes, verificar el historial de pagos realizados, y generar un comprobante para su empleador que le reembolsa gastos educativos.

**Usuario Tipo:** Madre organizada, maneja múltiples hijos, necesita documentación formal

---

### **📋 Tareas de Prueba UX-P003**

#### **Tarea 1: Consulta de estado financiero**
**Objetivo:** Evaluar claridad en la presentación de información financiera
**Tiempo Esperado:** 3-4 minutos

**Pasos del Usuario:**
1. Acceder a la sección de pagos/finanzas
2. Ver resumen de estado financiero de ambos hijos
3. Identificar pagos pendientes y fechas de vencimiento
4. Revisar montos y conceptos de cada pago

**Métricas a Evaluar:**
- **Information Architecture:** ¿La información está bien organizada?
- **Multi-Child Management:** ¿Es fácil alternar entre hijos?
- **Payment Status Clarity:** ¿Se distingue claramente pendiente vs pagado?
- **Amount Visibility:** ¿Los montos son prominentes y claros?

**Criterios de Éxito:**
- ✅ Identificación de todos los pagos pendientes en ≤ 4 minutos
- ✅ Claridad en diferenciación entre hijos
- ✅ Comprensión completa del estado financiero

#### **Tarea 2: Realización de pago online**
**Objetivo:** Validar proceso de pago digital
**Tiempo Esperado:** 5-8 minutos

**Pasos del Usuario:**
1. Seleccionar pago pendiente de matrícula de Sofía
2. Elegir método de pago (tarjeta de crédito)
3. Introducir datos de tarjeta de forma segura
4. Confirmar pago y recibir comprobante digital

**Métricas a Evaluar:**
- **Payment Flow:** ¿El proceso es intuitivo y sin fricciones?
- **Security Perception:** ¿Se siente seguro introduciendo datos financieros?
- **Error Prevention:** ¿El sistema previene errores comunes?
- **Receipt Generation:** ¿Recibe comprobante inmediato?

**Criterios de Éxito:**
- ✅ Pago completado exitosamente en ≤ 8 minutos
- ✅ Proceso percibido como seguro (≥4/5 confianza)
- ✅ Comprobante generado automáticamente

#### **Tarea 3: Generación de reporte financiero**
**Objetivo:** Evaluar funcionalidad de reportes para reembolsos
**Tiempo Esperado:** 3-5 minutos

**Pasos del Usuario:**
1. Acceder a historial de pagos del año actual
2. Generar reporte de gastos educativos por hijo
3. Descargar reporte en formato PDF para empleador
4. Verificar que incluya todos los datos requeridos (fechas, montos, conceptos)

**Métricas a Evaluar:**
- **Report Customization:** ¿Puede filtrar por período y tipo de gasto?
- **Data Completeness:** ¿El reporte incluye toda la información necesaria?
- **Export Functionality:** ¿La descarga funciona correctamente?
- **Professional Format:** ¿El documento es apropiado para uso oficial?

**Criterios de Éxito:**
- ✅ Generación de reporte en ≤ 5 minutos
- ✅ Reporte incluye todos los datos requeridos
- ✅ Formato profesional adecuado para empleador

---

## 📊 MÉTRICAS Y EVALUACIÓN DE PRUEBAS UX

### **🎯 Métricas Cuantitativas**

| Métrica | Objetivo | Herramienta de Medición |
|---------|----------|------------------------|
| **Task Success Rate** | ≥ 85% | Observación directa |
| **Time on Task** | Dentro de rangos esperados | Cronómetro |
| **Error Rate** | ≤ 2 errores por tarea | Conteo de clics erróneos |
| **Navigation Efficiency** | ≤ 3 clics para funciones principales | Screen recording |
| **Mobile Usability** | ≥ 90% funcionalidad móvil | Testing en dispositivos |

### **🎯 Métricas Cualitativas**

| Aspecto | Escala de Evaluación | Criterio de Éxito |
|---------|---------------------|-------------------|
| **User Satisfaction (SUS)** | 1-5 puntos | ≥ 4.0 promedio |
| **Perceived Security** | 1-5 puntos | ≥ 4.0 en pagos |
| **Information Clarity** | 1-5 puntos | ≥ 4.0 promedio |
| **Visual Design** | 1-5 puntos | ≥ 3.8 promedio |
| **Overall Experience** | 1-5 puntos | ≥ 4.0 promedio |

---

### **👥 Perfil de Usuarios de Prueba**

#### **Participante Tipo A: "Padre Tecnológico"**
- **Edad:** 28-40 años
- **Nivel Tecnológico:** Intermedio-Avanzado
- **Dispositivos:** Smartphone, laptop, tablet
- **Expectativas:** Eficiencia, funciones avanzadas

#### **Participante Tipo B: "Madre Ocupada"**
- **Edad:** 35-45 años  
- **Nivel Tecnológico:** Básico-Intermedio
- **Dispositivos:** Principalmente smartphone
- **Expectativas:** Simplicidad, información clara

#### **Participante Tipo C: "Padre Poco Tecnológico"**
- **Edad:** 40-55 años
- **Nivel Tecnológico:** Básico
- **Dispositivos:** Smartphone básico, acceso ocasional a PC
- **Expectativas:** Facilidad extrema, soporte claro

---

### **🔄 Metodología de Ejecución**

#### **Preparación:**
1. **Reclutamiento:** 6-9 padres (2-3 por perfil)
2. **Ambiente:** Laboratorio UX + testing remoto
3. **Dispositivos:** iPhone, Android, Desktop
4. **Duración:** 45-60 minutos por sesión

#### **Ejecución:**
1. **Brief inicial:** Explicación del contexto (5 min)
2. **Tareas moderated:** Think-aloud protocol (35 min)
3. **Cuestionario post-test:** SUS y satisfaction (10 min)
4. **Entrevista corta:** Feedback cualitativo (10 min)

#### **Análisis:**
1. **Análisis cuantitativo:** Métricas de rendimiento
2. **Análisis cualitativo:** Patrones de comportamiento
3. **Identificación de pain points:** Fricciones principales
4. **Recomendaciones de mejora:** Priorizadas por impacto

---

### **📈 Entregables de Pruebas UX**

#### **Reporte Ejecutivo:**
- **Resumen de hallazgos principales**
- **Task success rates por escenario**
- **Ranking de usabilidad por funcionalidad**
- **Recomendaciones prioritarias**

#### **Reporte Detallado:**
- **Análisis por tarea y métrica**
- **Heatmaps y user journeys**
- **Quotes representativos de usuarios**
- **Mockups de mejoras sugeridas**

#### **Plan de Mejoras:**
- **Quick wins** (implementación inmediata)
- **Mejoras de mediano plazo** (1-3 meses)
- **Iniciativas estratégicas** (6+ meses)
- **Métricas de seguimiento** para validar mejoras

---

**Aprobado por:** Equipo de Desarrollo  
**Fecha de Aprobación:** 29 de Agosto, 2025  
**Próxima Revisión:** 29 de Septiembre, 2025

---

*Este documento es un plan vivo que se actualizará según evolucione el proyecto y se identifiquen nuevas necesidades de testing.*
