<template>
  <div class="reset-password-container">
    <header>
      <h1>Cambiar Contraseña</h1>
    </header>
    <main>
      <div class="reset-password-form-wrapper">
        <img src="@/assets/logo.png" alt="logo del colegio" class="logo" />
        
        <div v-if="!passwordReset" class="form-section">
          <div v-if="tokenValid === null" class="loading-section">
            <div class="spinner"></div>
            <p>Validando token...</p>
          </div>
          
          <div v-else-if="!tokenValid" class="error-section">
            <div class="error-icon">✕</div>
            <h2>Token Inválido</h2>
            <p class="error-message">
              El enlace para recuperar tu contraseña ha expirado o no es válido.
            </p>
            <router-link to="/forgot-password" class="action-link">
              Solicitar nuevo enlace
            </router-link>
          </div>
          
          <div v-else class="form-content">
            <p class="form-description">
              Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
            </p>
            
            <form @submit.prevent="resetPassword" data-cy="reset-password-form">
              <div class="form-group">
                <div class="password-container">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="newPassword"
                    placeholder="Nueva contraseña"
                    class="form-input"
                    data-cy="password-input"
                    required
                    minlength="8"
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
              
              <div class="form-group">
                <div class="password-container">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    placeholder="Confirmar nueva contraseña"
                    class="form-input"
                    data-cy="confirm-password-input"
                    required
                    minlength="8"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showConfirmPassword = !showConfirmPassword"
                    aria-label="Mostrar/ocultar confirmación de contraseña"
                  >
                    <Eye v-if="!showConfirmPassword" />
                    <EyeOff v-else />
                  </button>
                </div>
              </div>
              
              <div v-if="passwordError" class="password-error">
                {{ passwordError }}
              </div>
              
              <button 
                type="submit" 
                class="submit-button"
                :disabled="loading || !passwordsMatch"
                data-cy="submit-button"
              >
                {{ loading ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </form>
          </div>
        </div>
        
        <div v-else class="success-section">
          <div class="success-icon">✓</div>
          <h2>Contraseña Cambiada</h2>
          <p class="success-message">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          
          <router-link to="/login" class="action-link primary">
            Ir a Iniciar Sesión
          </router-link>
        </div>
        
        <div class="back-to-login">
          <router-link to="/login" class="back-link">
            ← Volver al inicio de sesión
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useNotifications } from '@/utils/useNotifications.js'
import { passwordResetService } from '@/services/passwordResetService.js'

const route = useRoute()
const { showNotification } = useNotifications()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const tokenValid = ref(null)
const passwordReset = ref(false)

const passwordsMatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value
})

const passwordError = computed(() => {
  if (!newPassword.value && !confirmPassword.value) return ''
  
  if (newPassword.value && newPassword.value.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres'
  }
  
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    return 'Las contraseñas no coinciden'
  }
  
  return ''
})

const validateToken = async () => {
  if (!token.value) {
    tokenValid.value = false
    return
  }

  try {
    const data = await passwordResetService.validateToken(token.value)
    tokenValid.value = data.success
  } catch (error) {
    console.error('Error validating token:', error)
    tokenValid.value = false
    showNotification('error', 'Token inválido', error.message || 'No se pudo validar el token')
  }
}

const resetPassword = async () => {
  if (!passwordsMatch.value) {
    showNotification('error', 'Error', 'Las contraseñas no coinciden')
    return
  }

  if (newPassword.value.length < 8) {
    showNotification('error', 'Error', 'La contraseña debe tener al menos 8 caracteres')
    return
  }

  loading.value = true

  try {
    const data = await passwordResetService.resetPassword(token.value, newPassword.value)
    passwordReset.value = true
    showNotification('success', 'Éxito', data.message)
  } catch (error) {
    console.error('Error resetting password:', error)
    showNotification('error', 'Error', error.message || 'No se pudo cambiar la contraseña')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  token.value = route.query.token || ''
  validateToken()
})
</script>

<style scoped>
.reset-password-container {
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

.reset-password-form-wrapper {
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

/* Loading Section */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #008c1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Section */
.error-section {
  text-align: center;
  padding: 1rem 0;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1.5rem;
}

.error-section h2 {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.error-message {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 2rem;
}

/* Form Content */
.form-content {
  width: 100%;
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

.password-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: left;
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

/* Success Section */
.success-section {
  text-align: center;
  padding: 1rem 0;
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

/* Links */
.action-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.action-link.primary {
  background: linear-gradient(135deg, #008c1a 0%, #00a820 100%);
  color: white;
}

.action-link.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 140, 26, 0.3);
}

.action-link:not(.primary) {
  background: #f8f9fa;
  color: #008c1a;
  border: 2px solid #008c1a;
}

.action-link:not(.primary):hover {
  background: #008c1a;
  color: white;
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

/* Responsive Design */
@media screen and (max-width: 768px) {
  .reset-password-form-wrapper {
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
  
  .reset-password-form-wrapper {
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
  
  .toggle-password {
    right: 0.75rem;
    padding: 0.375rem;
  }
}
</style>
