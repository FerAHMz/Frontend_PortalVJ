# Frontend PortalVJ CI/CD Pipeline

## 🚀 Pipeline de Integración y Despliegue Continuo

Este repositorio contiene el frontend del sistema PortalVJ desarrollado en Vue.js 3 con Vite.

## 🏗️ Arquitectura del Frontend

- **Framework**: Vue 3 con Composition API
- **Build Tool**: Vite
- **Testing**: Vitest (unit) + Cypress (E2E)
- **Linting**: ESLint + Prettier
- **Puerto**: 5173 (desarrollo), 4173 (preview)
- **Router**: Vue Router 4

## 🔄 Workflow CI/CD

### **Triggers**
- **Push**: `main`, `develop`, `master`
- **Pull Request**: `main`, `master`

### **Jobs Configurados**

#### 1. **Frontend Tests** (`frontend-test`)
- ✅ Instalación de dependencias
- ✅ ESLint + Prettier validation
- ✅ Tests unitarios con Vitest
- ✅ Build de producción
- ✅ Coverage reports

#### 2. **Code Quality** (`frontend-quality`)
- ✅ Security audit con npm audit
- ✅ Bundle size analysis
- ✅ Outdated packages check

#### 3. **E2E Tests** (`e2e-tests`)
- ✅ Cypress tests en ambiente real
- ✅ Screenshots/videos en fallos
- ✅ Solo en PRs y releases

#### 4. **Lighthouse Audit** (`lighthouse-audit`)
- ✅ Performance testing
- ✅ Accessibility validation
- ✅ SEO analysis
- ✅ Solo en Pull Requests

#### 5. **Docker Build** (`frontend-docker`)
- ✅ Build de imagen Docker
- ✅ Push a Docker Hub (producción)
- ✅ Multi-stage builds

#### 6. **Deploy Staging** (`deploy-staging`)
- 🔄 Branch: `develop`
- 🔄 Environment: staging
- 🔄 Smoke tests

#### 7. **Deploy Production** (`deploy-production`)
- 🔄 Branch: `main`/`master`
- 🔄 Environment: production
- 🔄 Validaciones completas

#### 8. **Accessibility Tests** (`accessibility-tests`)
- ✅ axe-core validation
- ✅ WCAG compliance
- ✅ Solo en Pull Requests

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (Vite)
npm run preview      # Preview del build

# Build
npm run build        # Build para producción

# Testing
npm test            # Tests unitarios
npm run test:watch  # Tests en modo watch
npm run test:coverage  # Tests con coverage
npm run test:e2e    # Tests End-to-End
npm run test:e2e:headless  # E2E sin interfaz

# Calidad de código
npm run lint        # ESLint con auto-fix
npm run lint:check  # ESLint solo verificación
npm run format      # Prettier format
npm run format:check  # Prettier verificación

# Bundle analysis
npm run bundlesize  # Análisis de tamaño del bundle
```

## 🛠️ Variables de Entorno

### **Desarrollo Local**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=PortalVJ Development
NODE_ENV=development
```

### **CI/CD (Automáticas)**
```yaml
NODE_VERSION: '18.x'
```

## 🔐 GitHub Secrets Necesarios

```bash
# Docker Registry (opcional)
DOCKER_USERNAME=tu_usuario_docker
DOCKER_PASSWORD=tu_password_docker

# Deployment
NETLIFY_AUTH_TOKEN=xxx    # Para Netlify
VERCEL_TOKEN=xxx          # Para Vercel
AWS_ACCESS_KEY_ID=xxx     # Para AWS S3

# Performance (opcional)
LIGHTHOUSE_TOKEN=xxx      # Para Lighthouse CI
```

## 🐳 Docker Support

### **Multi-stage Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Comandos Docker**
```bash
# Build
docker build -t portalvj-frontend .

# Run
docker run -p 80:80 portalvj-frontend
```

## ⚡ Performance & Quality

### **Lighthouse Thresholds**
```javascript
// lighthouserc.js
assertions: {
  'categories:performance': ['error', { minScore: 0.8 }],
  'categories:accessibility': ['error', { minScore: 0.9 }],
  'categories:best-practices': ['error', { minScore: 0.8 }],
  'categories:seo': ['error', { minScore: 0.8 }],
}
```

### **Bundle Size Limits**
- Main bundle: < 500KB
- Vendor bundle: < 1MB
- CSS bundle: < 100KB

### **ESLint Configuration**
```javascript
// eslint.config.js
rules: {
  'vue/html-self-closing': 'error',
  'vue/component-name-in-template-casing': 'error',
  '@typescript-eslint/no-unused-vars': 'error'
}
```

## 🧪 Testing Strategy

### **Unit Tests (Vitest)**
```bash
# Estructura de tests
src/
├── components/
│   └── __tests__/
├── composables/
│   └── __tests__/
└── utils/
    └── __tests__/
```

### **E2E Tests (Cypress)**
```bash
# Estructura de tests E2E
cypress/
├── e2e/
│   ├── auth.cy.js
│   ├── dashboard.cy.js
│   └── payments.cy.js
├── fixtures/
└── support/
```

### **Coverage Thresholds**
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 85%
- **Statements**: 85%

## 📋 Providers de Deployment

### **Netlify**
```bash
# Configuración automática
netlify deploy --dir=dist --prod --site=$NETLIFY_SITE_ID
```

### **Vercel**
```bash
# Deploy automático
vercel --token=$VERCEL_TOKEN --prod dist
```

### **AWS S3 + CloudFront**
```bash
# Sync y invalidación
aws s3 sync dist/ s3://your-bucket/ --delete
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

## 🔍 Quality Gates

### **Pre-commit Hooks**
```json
// package.json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "*.{js,vue}": ["eslint --fix", "git add"],
  "*.{css,vue}": ["prettier --write", "git add"]
}
```

### **Automated Checks**
- ✅ ESLint (sin errores)
- ✅ Prettier (formato consistente)
- ✅ Tests unitarios (> 80% coverage)
- ✅ Build exitoso
- ✅ Bundle size < limits
- ✅ Lighthouse score > thresholds

## 🚀 Deployment Workflow

### **Staging (develop)**
1. Push a `develop`
2. Tests + Quality checks
3. Build optimizado
4. Deploy a staging
5. Smoke tests automáticos
6. URL staging disponible

### **Production (main)**
1. Push a `main`
2. Tests completos + E2E
3. Lighthouse audit
4. Build y Docker image
5. Deploy a producción
6. Validaciones post-deploy

## 📊 Monitoreo

### **Performance Metrics**
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift
- Time to Interactive

### **Error Tracking**
```javascript
// Sentry integration
import * as Sentry from "@sentry/vue";
Sentry.init({ dsn: process.env.VITE_SENTRY_DSN });
```

### **Analytics**
```javascript
// Google Analytics
import { gtag } from 'vue-gtag';
gtag('config', process.env.VITE_GA_ID);
```

## 🔧 Troubleshooting

### **Build Fallando**
```bash
# Limpiar cache
rm -rf node_modules dist .vite
npm ci
npm run build
```

### **Tests E2E Fallando**
```bash
# Verificar servidor local
npm run dev &
npm run test:e2e:open  # Debug mode
```

### **Lighthouse Score Bajo**
```bash
# Analizar bundle
npm run build
npx vite-bundle-analyzer dist
```

## 📈 Roadmap

- [ ] **Progressive Web App** (PWA)
- [ ] **Server-Side Rendering** (Nuxt.js)
- [ ] **Component Library** separation
- [ ] **Micro-frontend** architecture
- [ ] **Real User Monitoring** (RUM)

---

## 📄 Documentación Adicional

- [Component Guidelines](./docs/components.md)
- [State Management](./docs/state.md)
- [Deployment Guide](./docs/deployment.md)

**Repositorio Frontend PortalVJ**  
**CI/CD Pipeline v2.0**  
**Vue.js 3 + Vite + TypeScript**
