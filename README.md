# Frontend_PortalVJ

<br />

<div align="center">
  <h1>Portal de Gestión Escolar - Vanguardia Juvenil</h1> 
</div>

---

## Objetivos

- Desarrollar una interfaz de usuario moderna, clara y funcional para diferentes roles del sistema escolar: padres, maestros y administrativos.
- Utilizar **Vue.js** y **Vite** para una experiencia de desarrollo rápida y eficiente.
- Contenerizar el proyecto para facilitar su ejecución en cualquier entorno.

---

## Tecnologías Utilizadas

- **Vue 3 + Vite**
- **JavaScript moderno (ES6+)**
- **Docker**
- **Lucide Icons** para íconos SVG
- **CSS personalizado** (sin frameworks externos)

---

## Pasos de Construcción y Ejecución

### 1. Construir la imagen Docker

   ```
   docker build -t frontend_portalvj .
   ```

### 2. Ejecutar el contenedor
   ```
   docker run -p 5173:5173 frontend_portalvj
   ```
El sistema quedará accesible en: http://localhost:5173

### 3. Detener y eliminar el contenedor
* Para ver los contenedores en ejecución:
   ```
   docker ps
   ```
* Para detener el contenedor:
   ```
   docker stop <CONTAINER_ID>
   ```
* Para eliminar el contenedor:
   ```
   docker rm <CONTAINER_ID>
   ```
   
---

### Estructura del proyecto
Frontend_PortalVJ/

├── public/

│   └── logo.ico

├── src/

│   ├── assets/              # Imágenes del sistema

│   ├── components/          # Componentes Vue reutilizables (Sidebar, Cards, etc.)

│   ├── router/              # Rutas de Vue Router

│   ├── views/               # Vistas principales por rol (Login, Teacher, Admin, Parents)

│   ├── App.vue              # Componente raíz

│   └── main.js              # Punto de entrada de Vue

├── .editorconfig

├── .prettierrc.json

├── .gitignore

├── docker-compose.yml.example

├── Dockerfile

├── eslint.config.js

├── index.html

├── jsconfig.json

├── login.js

├── package.json

├── package-lock.json

├── README.md

├── styles.css

└── vite.config.js


---

### Archivos importantes
* Dockerfile: Define cómo construir la imagen del contenedor.
* docker-compose.yml: Ignorado por Git (configuración personalizada por equipo).
* docker-compose.yml.example: Archivo base que debe copiarse como docker-compose.yml.
* .gitignore: Evita subir node_modules y archivos específicos del entorno.

---

### Consideraciones
* Al construir el contenedor por primera vez, se generará automáticamente node_modules dentro del contenedor gracias al Dockerfile.
* El archivo .gitignore evita conflictos al no incluir node_modules ni docker-compose.yml personalizado.

---

### Contacto
* Estudiantes:
  - Felipe Aguilar - agu23195@uvg.edu.gt
  - Fernando Hernández - her23645@uvg.edu.gt
  - Fernando Rueda - rue23748@uvg.edu.gt
  - Nadissa Vela - vel23764@uvg.edu.gt
