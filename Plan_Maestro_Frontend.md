
# Plan Maestro de Pruebas - Frontend PortalVJ

**Preparado por:** Fernando Rueda 
**Fecha:** 1 de Agosto, 2025  
**Proyecto:** Portal Vanguardia Juvenil 

---

## Introducción

Este plan de pruebas cubre las pruebas automatizadas para el **Frontend del Portal Vanguardia Juvenil**, específicamente para los módulos **Services** y **Utils**. Estas pruebas están diseñadas para validar la lógica de los componentes, la integración con servicios mock, y las utilidades de validación de entrada y formateo de datos. Se han identificado 27 casos de prueba críticos que validan la funcionalidad principal del sistema.

---

## Recursos

| Tester | % de participación |
|--------|--------------------|
| Sistema de Pruebas Automatizadas (Vitest) | 100% |

---

## Alcance

Este plan de pruebas abarca dos módulos principales del proyecto:

- **Services.spec.js**: 14 pruebas de servicios mock y lógica de negocio.
- **Utils.spec.js**: 13 pruebas de validaciones y utilidades del sistema.

Las pruebas incluyen simulaciones de servicios de asistencia, autenticación, y funcionalidades de validación de datos como el correo electrónico, el formato de nombres y fechas. Las pruebas de regresión manual de baja prioridad se ejecutarán solo si el tiempo lo permite.

---

## Fuera del Alcance

Este plan no incluye las pruebas de integración con servicios reales de backend ni pruebas de componentes Vue complejos, los cuales se sub-contratarán a testing manual.

---

## Características a probar

### Descripción de las pruebas a realizar

Las pruebas automatizadas cubren lo siguiente:

#### Pruebas de Servicios (Services.spec.js):

| ID Caso Prueba | Escenario | Variable 1 | Variable 2 | Resultado esperado |
|----------------|-----------|------------|------------|-------------------|
| SRV-001 | Obtener lista de estudiantes | courseId: 'course1' | fecha: '2023-12-01' | Lista con 2 estudiantes y estado vacío |
| SRV-002 | Guardar asistencia | courseId: 'course1' | attendanceData: objeto | {success: true} |
| SRV-003 | Autenticación exitosa | email: 'test@test.com' | password: 'password123' | {success: true, token: 'mock-token'} |
| SRV-004 | Autenticación fallida | email: 'wrong@test.com' | password: 'wrong' | Error de credenciales |

#### Pruebas de Utilidades (Utils.spec.js):

| ID Caso Prueba | Escenario | Variable 1 | Variable 2 | Resultado esperado |
|----------------|-----------|------------|------------|-------------------|
| UTL-001 | Validar email válido | email: 'test@example.com' | - | true |
| UTL-002 | Validar email inválido | email: 'invalid-email' | - | false |
| UTL-003 | Validar teléfono válido | phone: '1234-5678' | - | true |
| UTL-004 | Formatear fecha | date: '2023-12-01' | - | '01/12/2023' |
| UTL-005 | LocalStorage mock | key: 'testKey' | value: 'testValue' | Almacenamiento exitoso |

---

## Infraestructura

Especificación del entorno de desarrollo, herramientas y frameworks utilizados:

- **Framework de Testing:** Vitest v2.0.5
- **Framework Frontend:** Vue.js 3 + Vite
- **Entorno de Pruebas:** happy-dom (jsdom simulado)
- **Herramientas de Mock:** vi.fn() de Vitest
- **Coverage Provider:** V8
- **Navegadores Objetivo:** Chrome, Firefox, Safari (simulados)

---

## Suposiciones

- Los servicios reales de backend estarán disponibles para integración con los mocks.
- Los datos de prueba reflejan un entorno de producción representativo.
- Las validaciones de entrada del frontend son adecuadas para cubrir la seguridad básica.
- Los mocks simulan correctamente el comportamiento de los servicios reales.

---

## Riesgos

| No | Riesgos | Probabilidad (1-5) | Impacto (1-5) | Severidad (Prob*Impact) | Plan de Mitigación |
|----|---------|-------------------|---------------|-----------------------|-------------------|
| 1 | Cambios en la API de servicios mock | 3 | 4 | 12 | Mantener mocks actualizados y versionado de API |
| 2 | Dependencias de librerías desactualizadas | 2 | 3 | 6 | Monitoreo constante de dependencias y actualizaciones programadas |

---

## Criterios de aceptación o fallo

Son los criterios que serán considerados para dar por completado el Plan de Pruebas:

- **Porcentaje de cobertura esperado:** Mínimo 85% en funciones críticas.
- **Casos exitosos requeridos:** 100% de los 27 casos de prueba deben pasar.
- **Porcentaje de defectos permitidos:** 0% en funcionalidades core.
- **Tiempo de ejecución máximo:** 30 segundos para toda la suite.
- **Criterios de validación:** Todas las validaciones de entrada deben funcionar correctamente.

| Id criterio | Descripción | Aprobación | Fallo |
|-------------|-------------|------------|-------|
| CRIT-001 | Ejecución exitosa de todas las pruebas | 27/27 tests ✅ | <27 tests ❌ |
| CRIT-002 | Cobertura de código | ≥85% | <85% |
| CRIT-003 | Tiempo de ejecución | ≤30 seg | >30 seg |

---

## Criterios de suspensión y reanudación

### Criterio de suspensión
- Fallo de más del 10% de las pruebas críticas.
- Problemas de infraestructura que impidan la ejecución.
- Cambios críticos en dependencias que rompan la compatibilidad.

### Criterio de reanudación
- Corrección de todos los fallos identificados.
- Verificación de la infraestructura de testing.
- Actualización y validación de dependencias críticas.

---

## Casos de Prueba Implementados

### 🧪 **Services.spec.js (14 pruebas)**

#### o Pruebas de Carga:
| Identificador de la prueba | Parte de la aplicación probada | Condición | Resultado Esperado | Método o herramienta a utilizar |
|---------------------------|-------------------------------|-----------|-------------------|--------------------------------|
| SRV-LOAD-001 | AttendanceService Mock | courseId válido | Lista de estudiantes | vi.fn().mockResolvedValue() |
| SRV-LOAD-002 | AuthService Mock | Credenciales válidas | Token de autenticación | Mock function simulation |

#### o Pruebas de Seguridad:
| Identificador de la prueba | Condición | Elemento a probar | Resultado esperado |
|---------------------------|-----------|-------------------|-------------------|
| SRV-SEC-001 | Login con datos incorrectos | Función de autenticación | Error controlado |
| SRV-SEC-002 | Validación de entrada | Filtros de estudiantes | Datos sanitizados |

### 🛠️ **Utils.spec.js (13 pruebas)**

#### o Pruebas de Validación:
| Identificador de la prueba | Parte de la aplicación probada | Condición | Resultado Esperado | Método o herramienta a utilizar |
|---------------------------|-------------------------------|-----------|-------------------|--------------------------------|
| UTL-VAL-001 | validateEmail | Email válido/inválido | true/false | Regex validation |
| UTL-VAL-002 | validatePhone | Teléfono válido/inválido | true/false | Format validation |
| UTL-VAL-003 | validateName | Nombre válido/inválido | true/false | String validation |

#### o Pruebas de Formato:
| Identificador de la prueba | Condición | Elemento a probar | Resultado esperado |
|---------------------------|-----------|-------------------|-------------------|
| UTL-FMT-001 | Formateo de fecha | Fecha ISO válida | Formato DD/MM/YYYY |
| UTL-FMT-002 | Formateo de texto | String con espacios | String capitalizado |

---

