<template>
  <div class="login-container">
    <header>
      <h1>Inicio de sesión</h1>
    </header>
    <main>
      <div class="login-form-wrapper">
        <img src="@/assets/logo.png" alt="logo del colegio" class="logo" />
        <form @submit.prevent="login" data-cy="login-form">
          <div class="form-group">
            <input 
              type="text" 
              v-model="email" 
              placeholder="Ingrese su correo" 
              class="form-input"
              data-cy="email-input"
              required
            />
          </div>
          <div class="form-group">
            <div class="password-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Contraseña"
                class="form-input"
                data-cy="password-input"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                aria-label="Mostrar/ocultar contraseña"
              >
                <Eye v-if="!showPassword" />
                <EyeOff v-else />
              </button>
            </div>
          </div>
          <button type="submit" class="submit-button" data-cy="login-button">
            Ingresar
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { setAuthData, getHomeRouteForRole } from '@/utils/auth.js'
import { useNotifications } from '@/utils/useNotifications.js'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const router = useRouter()
const { showNotification } = useNotifications()

const login = async () => {
  // Validación básica (evitar envío si campos están vacíos)
  if (!email.value || !password.value) {
    // Si hay campos vacíos, no hacer nada - dejar que la validación HTML5 maneje esto
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (data.success) {
      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.rol);

      console.log('Auth data stored:', {
        token: data.token ? 'exists' : 'missing',
        userId: data.user.id,
        userRole: data.user.rol
      });

      showNotification('success', 'Inicio de sesión exitoso', 'Bienvenido al sistema');
      
      // Redirigir después del login exitoso
      setTimeout(() => {
        const homeRoute = getHomeRouteForRole(data.user.rol);
        console.log('User role:', data.user.rol);
        console.log('Redirecting to:', homeRoute);
        
        if (homeRoute === '/login') {
          console.error('Failed to get valid home route for role:', data.user.rol);
          showNotification('error', 'Error', 'Rol de usuario no reconocido');
          return;
        }
        
        router.push(homeRoute);
      }, 1500); // Dar tiempo para que se vea la notificación
      
    } else {
      showNotification('error', 'Error de autenticación', data.error || 'Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error en login:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showNotification('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } else {
      showNotification('error', 'Error de conexión', 'Hubo un problema al conectarse al servidor.');
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  background-color: #f8f9fa;
}

header {
  width: 100%;
  background: linear-gradient(135deg, #008c1a 0%, #00a820 100%);
  color: white;
  text-align: center;
  padding: 2rem 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: 'Inter', sans-serif;
}

.login-form-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 1rem;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  width: 100%;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  background-color: #fafbfc;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #008c1a;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(0, 140, 26, 0.1);
}

.form-input::placeholder {
  color: #6c757d;
  font-weight: 400;
}

.password-container {
  position: relative;
  width: 100%;
}

.password-container .form-input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #008c1a;
  background-color: rgba(0, 140, 26, 0.05);
}

.toggle-password:focus {
  outline: 2px solid rgba(0, 140, 26, 0.2);
  outline-offset: 2px;
}

.submit-button {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #008c1a 0%, #00a820 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 140, 26, 0.3);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(0, 140, 26, 0.2);
}

.submit-button:focus {
  outline: 3px solid rgba(0, 140, 26, 0.3);
  outline-offset: 2px;
}

/* Responsive Design */

/* Tablets */
@media screen and (max-width: 768px) {
  header {
    padding: 1.5rem 1rem;
  }
  
  main {
    padding: 1.5rem 1rem;
  }
  
  .login-form-wrapper {
    padding: 2rem 1.5rem;
    max-width: 100%;
    margin: 0 auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
  
  .form-input {
    height: 50px;
    font-size: 16px; /* Evitar zoom en iOS */
  }
  
  .submit-button {
    height: 54px;
    font-size: 17px;
  }
}

/* Móviles */
@media screen and (max-width: 480px) {
  header {
    padding: 1rem;
  }
  
  header h1 {
    font-size: 1.75rem;
  }
  
  main {
    padding: 1rem 0.75rem;
  }
  
  .login-form-wrapper {
    padding: 1.5rem 1rem;
    border-radius: 12px;
    box-shadow: none;
    background: white;
    margin: 0;
  }
  
  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 0.5rem;
  }
  
  form {
    gap: 1.25rem;
  }
  
  .form-input {
    height: 48px;
    padding: 0 0.875rem;
    border-radius: 10px;
  }
  
  .password-container .form-input {
    padding-right: 2.75rem;
  }
  
  .toggle-password {
    right: 0.75rem;
    padding: 0.375rem;
  }
  
  .submit-button {
    height: 50px;
    font-size: 16px;
    border-radius: 10px;
  }
}

/* Móviles pequeños */
@media screen and (max-width: 360px) {
  .login-form-wrapper {
    padding: 1.25rem 0.75rem;
  }
  
  .logo {
    width: 70px;
    height: 70px;
  }
  
  .form-input {
    height: 46px;
    font-size: 15px;
  }
  
  .submit-button {
    height: 48px;
    font-size: 15px;
  }
}

/* Landscape móvil */
@media screen and (max-height: 500px) and (orientation: landscape) {
  header {
    padding: 0.75rem 1rem;
  }
  
  header h1 {
    font-size: 1.5rem;
  }
  
  main {
    padding: 1rem;
  }
  
  .login-form-wrapper {
    padding: 1.25rem;
    gap: 1rem;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 0;
  }
  
  form {
    gap: 1rem;
  }
  
  .form-input {
    height: 44px;
  }
  
  .submit-button {
    height: 46px;
  }
}

/* Accesibilidad y estados de focus mejorados */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>