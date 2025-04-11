<template>
    <div class="login-container">
      <header>
        <h1>Inicio de sesión</h1>
      </header>
      <main>
        <img src="@/assets/logo.png" alt="logo del colegio" width="150" height="150" />
        <form @submit.prevent="login">
          <input type="text" v-model="email" placeholder="Ingrese su correo" />
          <input type="password" v-model="password" placeholder="Contraseña" />
          <input type="submit" value="Ingresar" />
        </form>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const email = ref('')
  const password = ref('')
  const router = useRouter()
  
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
  
      if (data.success) {
        // Store the token in localStorage
        localStorage.setItem('token', data.token)
        
        alert('Inicio de sesión exitoso')
        const role = data.user.rol
        if (role === 'Padre') {
          router.push('/parent')
        } else if (role === 'Maestro') {
          router.push('/teacher')
        } else if (role === 'Administrativo') {
          router.push('/admin')
        } else {
          alert('Rol desconocido')
        }
      } else {
        alert('Credenciales incorrectas')
      }
    } catch (error) {
      console.error('Error en login:', error)
      alert('Hubo un problema al conectarse al servidor.')
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
  </style>
  