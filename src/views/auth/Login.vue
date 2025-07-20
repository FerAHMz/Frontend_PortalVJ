<template>
    <div class="login-container">
      <header>
        <h1>Inicio de sesión</h1>
      </header>
      <main>
        <img src="@/assets/logo.png" alt="logo del colegio" width="150" height="150" />
        <form @submit.prevent="login">
          <input type="text" v-model="email" placeholder="Ingrese su correo" />
          <div class="password-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Contraseña"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" />
              <EyeOff v-else />
            </button>
          </div>
          <input type="submit" value="Ingresar" />
        </form>
      </main>

      <!-- Sin NotificationDialog local, usaremos el global -->
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
        userRole: data.user.rol,
        decodedToken: JSON.parse(atob(data.token.split('.')[1])) // Debug: decode token payload
      });

      showNotification('success', 'Inicio de sesión exitoso', 'Bienvenido al sistema');
      
      // Redirigir inmediatamente después del login exitoso
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
      showNotification('error', 'Error de autenticación', 'Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error en login:', error);
    showNotification('error', 'Error de conexión', 'Hubo un problema al conectarse al servidor.');
  }
};

  </script>

  <style scoped>
  .login-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  header {
    width: 100%;
    height: 30%;
    background-color: #008c1a;
    position: sticky;
    top: 0;
    align-items: center;
    font-family: 'Inter', sans-serif;
    padding-top: 0;
    text-align: center;
    color: white;
    font-size: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  main {
    position: relative;
    font-family: 'Inter', sans-serif;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0;
    height: 100%;
    flex: 1;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px;
    gap: 15px;
    width: 35%;
  }

  input {
    border-radius: 7px;
    border: 1px solid #ccc;
    width: 70%;
    height: 30px;
  }

  input[type='submit'] {
    background: #008c1a;
    color: white;
    font-size: 25px;
    width: 100%;
    height: 40px;
  }

  .password-container {
    position: relative;
    width: 70%;
    display: flex;
    align-items: center;
  }

  .password-container input {
    width: 100%;
    padding-right: 40px;
  }

  .toggle-password {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 5px;
  }

  .toggle-password:hover {
    color: #333;
  }
  </style>
