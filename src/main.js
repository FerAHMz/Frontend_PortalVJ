import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles.css'
import { preloadCriticalComponents } from './utils/preloader.js'

const app = createApp(App)

app.use(router)
app.mount('#app')

// Precargar componentes críticos después del montaje inicial
preloadCriticalComponents()
