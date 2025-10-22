<template>
  <div class="forgot-password-container">
    <header>
      <h1>Recuperar Contraseña</h1>
    </header>
    <main>
      <div class="forgot-password-form-wrapper">
        <img src="@/assets/logo.png" alt="logo del colegio" class="logo" />
        
        <div v-if="!emailSent" class="form-section">
          <p class="form-description">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.
          </p>
          
          <form @submit.prevent="requestReset" data-cy="forgot-password-form">
            <div class="form-group">
              <input 
                type="email" 
                v-model="email" 
                placeholder="Ingrese su correo electrónico" 
                class="form-input"
                data-cy="email-input"
                required
              />
            </div>
            
            <button 
              type="submit" 
              class="submit-button"
              :disabled="loading"
              data-cy="submit-button"
            >
              {{ loading ? 'Enviando...' : 'Enviar Instrucciones' }}
            </button>
          </form>
          
          <div class="back-to-login">
            <router-link to="/login" class="back-link">
              ← Volver al inicio de sesión
            </router-link>
          </div>
        </div>
        
        <div v-else class="success-section">
          <div class="success-icon">✓</div>
          <h2>Instrucciones Enviadas</h2>
          <p class="success-message">
            Si el correo electrónico existe en nuestro sistema, recibirás las instrucciones para recuperar tu contraseña.
          </p>
          
          <!-- Solo para desarrollo -->
          <div v-if="developmentToken" class="development-section">
            <p class="development-note">
              <strong>Modo Desarrollo:</strong>
            </p>
            <p class="development-token">
              Token: {{ developmentToken }}
            </p>
            <router-link 
              :to="`/reset-password?token=${developmentToken}`" 
              class="development-link"
            >
              Ir a cambiar contraseña (Desarrollo)
            </router-link>
          </div>
          
          <div class="back-to-login">
            <router-link to="/login" class="back-link">
              ← Volver al inicio de sesión
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotifications } from '@/utils/useNotifications.js'
import { passwordResetService } from '@/services/passwordResetService.js'

const email = ref('')
const loading = ref(false)
const emailSent = ref(false)
const developmentToken = ref('')
const { showNotification } = useNotifications()

const requestReset = async () => {
  if (!email.value) {
    showNotification('error', 'Error', 'Por favor ingresa tu correo electrónico')
    return
  }

  loading.value = true

  try {
    const data = await passwordResetService.requestReset(email.value)
    
    emailSent.value = true
    // Solo para desarrollo
    if (data.developmentToken) {
      developmentToken.value = data.developmentToken
    }
    showNotification('success', 'Éxito', data.message)
  } catch (error) {
    console.error('Error requesting password reset:', error)
    showNotification('error', 'Error', error.message || 'No se pudo conectar con el servidor')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  font-family: 'Inter', 'Segoe UI', sans-serif;
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
}

.forgot-password-form-wrapper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
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

.form-section,
.success-section {
  width: 100%;
  text-align: center;
}

.form-description {
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.5;
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

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 140, 26, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.back-to-login {
  margin-top: 2rem;
}

.back-link {
  color: #008c1a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #00a820;
  text-decoration: underline;
}

/* Success Section */
.success-section {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00a820 0%, #008c1a 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1.5rem;
}

.success-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.success-message {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 2rem;
}

/* Development Section */
.development-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: left;
}

.development-note {
  color: #856404;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.development-token {
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  word-break: break-all;
  margin-bottom: 1rem;
}

.development-link {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.development-link:hover {
  background: #0056b3;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .forgot-password-form-wrapper {
    padding: 2rem 1.5rem;
    max-width: 100%;
    margin: 0 auto;
  }
  
  .logo {
    width: 100px;
    height: 100px;
  }
}

@media screen and (max-width: 480px) {
  header {
    padding: 1rem;
  }
  
  main {
    padding: 1rem 0.75rem;
  }
  
  .forgot-password-form-wrapper {
    padding: 1.5rem 1rem;
    border-radius: 12px;
  }
  
  .logo {
    width: 80px;
    height: 80px;
  }
  
  .form-input {
    height: 48px;
    border-radius: 10px;
  }
  
  .submit-button {
    height: 50px;
    font-size: 16px;
    border-radius: 10px;
  }
}
</style>
