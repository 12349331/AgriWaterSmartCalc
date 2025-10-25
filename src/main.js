import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import logger from '@/utils/logger'

// Import Tailwind CSS
import './assets/styles/main.css'

// Import Vant theme customization
import './assets/styles/vant-theme.css'

// Import Vant Locale and Traditional Chinese language pack
import { Locale } from 'vant'
import zhTW from 'vant/es/locale/lang/zh-TW'

// Configure Vant to use Traditional Chinese
Locale.use('zh-TW', zhTW)

// Import ECharts configuration (tree-shaking)
import './config/echarts'

// Import performance monitoring
import { usePerformance } from './composables/usePerformance'

// Import data migration utility
import { migrateHistoryOnStartup } from './utils/migrate-history'

// Initialize performance monitoring
const performance = usePerformance()
performance.init()

const app = createApp(App)

// Install Pinia
app.use(createPinia())

// Run data migration on startup (T023)
try {
  const migratedCount = migrateHistoryOnStartup()
  if (migratedCount > 0) {
  } else {
  }
} catch (error) {
  logger.error('[AquaMetrics Migration] Error during data migration:', error)
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
