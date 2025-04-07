<div align="center">
  <h1>Portal Vanguardia Juvenil - Frontend</h1> 
</div>


## Objectives

- Develop a modern, clear, and functional user interface for different school system roles: parents, teachers, and administrators.
- Use **Vue.js** and **Vite** for a fast and efficient development experience.
- Containerize the project to facilitate execution in any environment.

---

## Technologies Used

- **Vue 3 + Vite**
- **Modern JavaScript (ES6+)**
- **Docker**
- **Lucide Icons** for SVG icons
- **Custom CSS** (no external frameworks)

---

## Build and Execution Steps

### 1. Build Docker Image

   ```
   docker build -t frontend_portalvj .
   ```

### 2. Run the Container
   ```
   docker run -p 5173:5173 frontend_portalvj
   ```
The system will be accessible at: http://localhost:5173

### 3. Stop and Remove the Container
* To view running containers:
   ```
   docker ps
   ```
* To stop the container:
   ```
   docker stop <CONTAINER_ID>
   ```
* To remove the container:
   ```
   docker rm <CONTAINER_ID>
   ```
   
---

## Estructura del proyecto
Frontend_PortalVJ/

├── public/

│   └── logo.ico

├── src/

│   ├── assets/              # System images

│   ├── components/          # Reusable Vue components (Sidebar, Cards, etc.)

│   ├── router/              # Vue Router routes

│   ├── views/               # Main views by role (Login, Teacher, Admin, Parents)

│   ├── App.vue              # Root component

│   └── main.js              # Vue entry point

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

## Important Files
* Dockerfile: Defines how to build the container image.
* docker-compose.yml: Ignored by Git (team-specific configuration).
* docker-compose.yml.example: Base file that should be copied as docker-compose.yml.
* .gitignore: Prevents uploading node_modules and environment-specific files.

---

## Considerations
* When building the container for the first time, node_modules will be automatically generated inside the container thanks to the Dockerfile.
* The .gitignore file prevents conflicts by not including node_modules or personalized docker-compose.yml.

---

## Contact
* Students:
- Felipe Aguilar - agu23195@uvg.edu.gt
- Fernando Hernández - her23645@uvg.edu.gt
- Fernando Rueda - rue23748@uvg.edu.gt
- Nadissa Vela - vel23764@uvg.edu.gt
