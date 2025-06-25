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

      <!-- Notification Dialog -->
      <NotificationDialog
        :show="notification.show"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        :auto-close="notification.type === 'success'"
        :auto-close-delay="2000"
        @close="closeNotification"
      />
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Eye, EyeOff } from 'lucide-vue-next'
  import NotificationDialog from '@/components/dialogs/NotificationDialog.vue'
  import { setAuthData, getHomeRouteForRole } from '@/utils/auth.js'

  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const router = useRouter()

  const notification = ref({
    show: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showNotification = (type, title, message) => {
    notification.value = {
      show: true,
      type,
      title,
      message
    }
  }

  const closeNotification = () => {
    notification.value.show = false
    // Si es un login exitoso, redirigir después de cerrar la notificación
    if (notification.value.type === 'success') {
      const role = localStorage.getItem('userRole')
      if (role) {
        router.push(getHomeRouteForRole(role))
      }
    }
  }

  const login = async () => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.value, password: password.value })
      })

      const data = await response.json()
      console.log('Login response:', data) // Debug log

      if (data.success) {
        // Store authentication data using the utility function
        setAuthData(data.token, data.user.id, data.user.rol)

        console.log('Auth data stored:', {
          token: data.token ? 'exists' : 'missing',
          userId: data.user.id,
          userRole: data.user.rol
        }) // Debug log

        showNotification('success', 'Inicio de sesión exitoso', 'Bienvenido al sistema')

        // The redirect will happen when the notification closes
      } else {
        showNotification('error', 'Error de autenticación', 'Credenciales incorrectas')
      }
    } catch (error) {
      console.error('Error en login:', error)
      showNotification('error', 'Error de conexión', 'Hubo un problema al conectarse al servidor.')
    }
  }
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
