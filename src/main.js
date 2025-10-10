import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

// Import Tailwind CSS
import "./assets/styles/main.css";

// Import ECharts configuration (tree-shaking)
import "./config/echarts";

// Import performance monitoring
import { usePerformance } from "./composables/usePerformance";

// Initialize performance monitoring
const performance = usePerformance();
performance.init();

const app = createApp(App);

// Install Pinia
app.use(createPinia());

// Mount app
app.mount("#app");

// Register Service Worker (PWA support)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}
