# Frontend CI/CD Pipeline

Pipeline de CI/CD específico para el frontend de PortalVJ que automatiza el proceso de integración continua y despliegue para garantizar la calidad del código y facilitar los deployments.

## Descripción General

El pipeline se ejecuta automáticamente en los siguientes eventos:
- **Push** a las ramas principales: `main`, `develop`, `master`
- **Pull Request** hacia las ramas: `main`, `master`

## Arquitectura del Pipeline

### Configuración Base
- **Runtime**: Ubuntu Latest
- **Node.js**: Versión 20.x
- **Gestión de dependencias**: npm con cache habilitado
- **Paralelización**: Jobs independientes con dependencias específicas

## Jobs Configurados

### 1. frontend-test
**Propósito**: Validación de calidad del código y tests unitarios

**Pasos ejecutados**:
- Instalación de dependencias con `npm ci`
- Análisis estático de código con ESLint
- Ejecución de tests unitarios con reporte de cobertura
- Upload de artefactos de cobertura para análisis posterior

**Criterios de fallo**: 
- Errores de linting (continue-on-error: false)
- Fallos en tests unitarios

### 2. frontend-security
**Propósito**: Auditoría de seguridad y análisis de dependencias

**Dependencias**: Requiere `frontend-test`

**Validaciones**:
- Auditoría de vulnerabilidades con `npm audit` (nivel moderado)
- Detección de paquetes desactualizados
- Análisis de dependencias obsoletas

### 3. frontend-build
**Propósito**: Compilación y empaquetado para producción

**Dependencias**: Requiere `frontend-test`

**Proceso**:
- Build optimizado con `NODE_ENV=production`
- Generación de artefactos estáticos en directorio `dist/`
- Upload de build artifacts con retención de 30 días

### 4. frontend-docker
**Propósito**: Containerización y publicación de imágenes

**Dependencias**: Requiere `frontend-test` y `frontend-build`

**Condiciones de ejecución**: Solo en ramas principales (`main`, `master`, `develop`)

**Funcionalidades**:
- **Develop**: Build de imagen de prueba local (sin push)
- **Main/Master**: Build y push a Docker Hub con tags versionados
- **Fallback**: Build sin push cuando faltan credenciales Docker

**Tags generados**:
- `latest`: Versión más reciente
- `{SHA}`: Tag específico del commit

**Metadatos OCI**:
- Título y descripción del proyecto
- URL del repositorio fuente
- SHA del commit y timestamp

### 5. e2e-tests
**Propósito**: Tests de integración End-to-End

**Dependencias**: Requiere `frontend-build`

**Condiciones**: Solo en Pull Requests

**Proceso**:
- Compilación del proyecto
- Inicio del servidor de preview (`npm run preview`)
- Ejecución de tests Cypress en modo headless
- Captura de screenshots y videos para debugging

**Artefactos generados**:
- Screenshots en caso de fallos
- Videos de todas las ejecuciones

### 6. lighthouse
**Propósito**: Auditoría de performance y optimización

**Dependencias**: Requiere `frontend-build`

**Condiciones**: Solo en Pull Requests

**Métricas evaluadas**:
- Performance web
- Accesibilidad
- Mejores prácticas
- SEO
- Progressive Web App

**Tolerancia**: `continue-on-error: true` para no bloquear el pipeline

### 7. deploy-staging
**Propósito**: Despliegue automático al entorno de staging

**Dependencias**: Requiere `frontend-test`, `frontend-security`, `frontend-build`

**Condiciones**: Solo en rama `develop`

**Environment**: `staging`

**Proceso**:
1. Descarga de artefactos de build
2. Despliegue a entorno de staging
3. Smoke tests para validación básica
4. Notificación de despliegue exitoso

**Proveedores soportados** (comentados en código):
- Netlify
- Vercel  
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

### 8. deploy-production
**Propósito**: Despliegue controlado a producción

**Dependencias**: Requiere `frontend-test`, `frontend-security`, `frontend-build`, `frontend-docker`

**Condiciones**: Solo en ramas `main` o `master`

**Environment**: `production`

**Validaciones**:
- Smoke tests exhaustivos
- Verificación de endpoints críticos
- Notificaciones automáticas

## Estrategia de Artefactos

### Upload de Artefactos
- **frontend-test-coverage**: Reportes de cobertura de tests
- **frontend-dist**: Build de producción (30 días retención)
- **cypress-screenshots**: Capturas de fallos E2E
- **cypress-videos**: Grabaciones completas de tests
- **lighthouse-reports**: Reportes de performance

### Cache y Optimización
- **Node modules cache**: Habilitado por defecto
- **Docker layer cache**: GitHub Actions cache para builds incrementales
- **Build cache**: Reutilización entre jobs

## Gestión de Secretos

### Secretos Requeridos
```
DOCKER_USERNAME    # Usuario de Docker Hub
DOCKER_PASSWORD    # Token de acceso Docker Hub
```

### Secretos Opcionales (según proveedor de hosting)
```
NETLIFY_AUTH_TOKEN     # Para Netlify
NETLIFY_SITE_ID        # ID del sitio Netlify
VERCEL_TOKEN          # Token de Vercel
FIREBASE_TOKEN        # Token de Firebase
AWS_ACCESS_KEY_ID     # Para AWS S3
AWS_SECRET_ACCESS_KEY # Para AWS S3
SLACK_WEBHOOK_URL     # Notificaciones Slack
```

## Configuración de Entornos

### Staging Environment
- **Trigger**: Push a `develop`
- **Protección**: Configuración de environment en GitHub
- **URL**: Configurable según proveedor

### Production Environment
- **Trigger**: Push a `main`/`master`
- **Protección**: Aprobaciones manuales recomendadas
- **URL**: Configurable según proveedor

## Gestión de Fallos

### Estrategias de Recuperación
- **Tests fallidos**: Pipeline se detiene, requiere corrección
- **Credenciales faltantes**: Build local sin push, con advertencias
- **E2E timeout**: Capturas automáticas para debugging
- **Performance regression**: Informativo, no bloquea deployment

### Monitoreo y Alertas
- Upload automático de artefactos de debugging
- Logs detallados en cada step
- Notificaciones configurables post-deployment

## Personalización

### Variables de Entorno Modificables
```yaml
NODE_VERSION: '20.x'  # Versión de Node.js
CI: true             # Modo CI para tests
NODE_ENV: production # Entorno de build
```

### Extensibilidad
El pipeline está diseñado para ser extendido con:
- Jobs adicionales de testing
- Múltiples entornos de staging
- Integración con herramientas de monitoreo
- Tests de carga automatizados
- Análisis de código adicionales

## Requisitos del Proyecto

### Scripts NPM Requeridos
```json
{
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src/",
  "test": "jest --coverage",
  "build": "vite build",
  "preview": "vite preview",
  "test:e2e:headless": "cypress run",
  "lighthouse": "lhci autorun"
}
```

### Archivos de Configuración
- `package.json`: Dependencias y scripts
- `.eslintrc.*`: Configuración de linting
- `cypress.config.js`: Configuración E2E
- `.lighthouserc.js`: Configuración de performance
- `Dockerfile`: Para containerización
