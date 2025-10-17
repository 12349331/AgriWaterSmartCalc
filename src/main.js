import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import Tailwind CSS
import './assets/styles/main.css'

// Import Vant theme customization
import './assets/styles/vant-theme.css'

// Import ECharts configuration (tree-shaking)
import './config/echarts'

// Import performance monitoring
import { usePerformance } from './composables/usePerformance'

// Initialize performance monitoring
const performance = usePerformance()
performance.init()

const app = createApp(App)

// Install Pinia
app.use(createPinia())

// Run data migration on startup (T023)
import { migrateHistoryOnStartup } from './utils/migrate-history'
try {
  const migratedCount = migrateHistoryOnStartup()
  if (migratedCount > 0) {
  } else {
  }
} catch (error) {
  console.error('[AquaMetrics Migration] Error during data migration:', error)
}

// Mount app
app.mount('#app')

// Register Service Worker (PWA support)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
      })
      .catch((error) => {
      })
  })
}
