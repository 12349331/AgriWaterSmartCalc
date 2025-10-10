# Developer Quickstart Guide (Vue 3 + Vite)

**Feature**: Agricultural Water Usage Estimator (AquaMetrics)
**Branch**: `001-build-an-application`
**Last Updated**: 2025-10-09
**Stack**: Vue 3.5+ | Vite 5.0+ | Pinia 2.2+ | ECharts 5.5+ | Tailwind CSS 3.4+

---

## 🚀 Quick Setup (5 minutes)

### Prerequisites

- **Node.js 18+** or **Node.js 20+** (recommended)
- **npm 9+** or **pnpm 8+** (faster alternative)
- **Git**
- **Modern web browser** (Chrome 90+, Firefox 88+, Safari 14+)

**Check versions**:
```bash
node --version  # Should be v18.x or v20.x
npm --version   # Should be v9.x or higher
```

---

## Step 1: Create Vite Project

```bash
# Clone repository
git clone <repository-url>
cd AquaMetrics
git checkout 001-build-an-application

# Initialize Vite + Vue 3 project (if not already done)
npm create vite@latest . -- --template vue

# Install dependencies
npm install

# Install additional dependencies
npm install pinia vue-echarts echarts uuid
npm install -D @vitejs/plugin-vue tailwindcss postcss autoprefixer
npm install -D vitest @vue/test-utils happy-dom @vitest/ui
npm install -D playwright @playwright/test
npm install -D eslint eslint-plugin-vue prettier
```

---

## Step 2: Configure Vite

**Create `vite.config.js`**:

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'pinia'],
          'echarts': ['echarts/core', 'vue-echarts'],
          'utils': ['./src/utils/formulas.js', './src/utils/validators.js']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
```

---

## Step 3: Configure Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p
```

**Edit `tailwind.config.js`**:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981'
      }
    },
  },
  plugins: [],
}
```

**Create `src/assets/styles/main.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition;
  }

  .input-field {
    @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary;
  }

  .result-card {
    @apply bg-white shadow-md rounded-lg p-6;
  }
}
```

---

## Step 4: Configure Vitest

**Create `vitest.config.js`**:

```javascript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        'src/main.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**Create `tests/setup.js`**:

```javascript
import { config } from '@vue/test-utils';

// Mock global properties
config.global.mocks = {
  $t: (key) => key  // Mock i18n if needed
};

// Stub ECharts globally
config.global.stubs = {
  'v-chart': true
};
```

---

## Step 5: Configure Playwright (E2E Tests)

```bash
# Initialize Playwright
npx playwright install
```

**Create `playwright.config.js`**:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Step 6: Update package.json Scripts

**Add/modify scripts in `package.json`**:

```json
{
  "name": "aquametrics",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:unit": "vitest --dir tests/unit",
    "test:component": "vitest --dir tests/component",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "pinia": "^2.2.0",
    "vue-echarts": "^7.0.3",
    "echarts": "^5.5.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "@vitest/ui": "^1.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "happy-dom": "^12.10.0",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-plugin-vue": "^9.19.0",
    "prettier": "^3.1.0"
  }
}
```

---

## Step 7: Create Initial Project Structure

```bash
# Create directory structure
mkdir -p src/{components/{calculator,dashboard,history,common},composables,stores,utils,config,assets/styles}
mkdir -p tests/{unit/{composables,stores,utils},component,e2e}

# Create initial files
touch src/main.js
touch src/App.vue
touch src/stores/{calculation,history,config,ui}.js
touch src/composables/{usePowerCalculator,useWaterCalculator,useValidation,useStorage}.js
touch src/config/{crops,regions,constants}.js
```

---

## Step 8: Setup Main Entry Point

**Edit `src/main.js`**:

```javascript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Import Tailwind CSS
import './assets/styles/main.css';

// Import ECharts configuration (tree-shaking)
import '@/config/echarts';

const app = createApp(App);

// Install Pinia
app.use(createPinia());

// Mount app
app.mount('#app');
```

---

## Step 9: Create Root Component

**Edit `src/App.vue`**:

```vue
<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Offline Notice -->
    <OfflineNotice :show="uiStore.isOffline" />

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">智慧農業水資源管理平台</h1>
        <p class="text-gray-600">以電推水 - 農業用水量估算工具</p>
      </header>

      <!-- Loading State -->
      <LoadingSpinner v-if="uiStore.isLoading" size="lg" />

      <!-- Error Message -->
      <ErrorMessage
        v-if="uiStore.error"
        :message="uiStore.error"
        type="error"
        dismissible
        @dismiss="uiStore.error = null"
      />

      <!-- Calculator Form -->
      <section class="mb-8">
        <CalculatorForm
          v-model="formData"
          :disabled="uiStore.isOffline"
          @submit="handleCalculate"
        />
      </section>

      <!-- Results -->
      <section v-if="calculationStore.monthlyVolume > 0" class="mb-8">
        <ResultCard
          :water-flow-rate="calculationStore.waterFlowRate"
          :monthly-volume="calculationStore.monthlyVolume"
          :calculated-kwh="calculationStore.calculatedKwh"
          :is-over-extraction="calculationStore.isOverExtraction"
          @save="handleSaveRecord"
        />
      </section>

      <!-- Dashboard -->
      <section v-if="historyStore.records.length > 0" class="mb-8">
        <DashboardTabs v-model="uiStore.activeTab" :tabs="dashboardTabs" />
        <SeasonalChart
          v-if="uiStore.activeTab === 'seasonal'"
          :crop-type="calculationStore.cropType"
          :base-volume="calculationStore.monthlyVolume"
        />
        <CropComparisonChart
          v-else-if="uiStore.activeTab === 'comparison'"
          :records="historyStore.records"
        />
        <AnnualTrendChart
          v-else-if="uiStore.activeTab === 'trend'"
          :base-volume="calculationStore.monthlyVolume"
        />
      </section>

      <!-- History Table -->
      <section>
        <h2 class="text-2xl font-bold mb-4">歷史紀錄</h2>
        <HistoryTable
          :records="historyStore.sortedRecords"
          @delete="handleDeleteRecord"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCalculationStore } from '@/stores/calculation';
import { useHistoryStore } from '@/stores/history';
import { useUiStore } from '@/stores/ui';

// Components
import OfflineNotice from '@/components/common/OfflineNotice.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ErrorMessage from '@/components/common/ErrorMessage.vue';
import CalculatorForm from '@/components/calculator/CalculatorForm.vue';
import ResultCard from '@/components/calculator/ResultCard.vue';
import DashboardTabs from '@/components/dashboard/DashboardTabs.vue';
import SeasonalChart from '@/components/dashboard/SeasonalChart.vue';
import CropComparisonChart from '@/components/dashboard/CropComparisonChart.vue';
import AnnualTrendChart from '@/components/dashboard/AnnualTrendChart.vue';
import HistoryTable from '@/components/history/HistoryTable.vue';

// Stores
const calculationStore = useCalculationStore();
const historyStore = useHistoryStore();
const uiStore = useUiStore();

// State
const formData = ref({});

const dashboardTabs = [
  { id: 'seasonal', label: '季節分析' },
  { id: 'comparison', label: '作物比較' },
  { id: 'trend', label: '年度趨勢' }
];

// Methods
const handleCalculate = async (data) => {
  try {
    uiStore.setLoading(true);

    // Fetch Taipower pricing if needed
    if (calculationStore.taipowerPricing.length === 0) {
      await calculationStore.fetchTaipowerPricing();
    }

    // Update form data in store
    calculationStore.setFormData(data);

    uiStore.setSuccess('計算完成');
  } catch (error) {
    uiStore.setError(error.message);
  } finally {
    uiStore.setLoading(false);
  }
};

const handleSaveRecord = async () => {
  try {
    const record = {
      electricityType: calculationStore.electricityType,
      billingSeason: calculationStore.billingSeason,
      billAmount: calculationStore.billAmount,
      cropType: calculationStore.cropType,
      fieldArea: calculationStore.fieldArea,
      region: calculationStore.region,
      pumpHorsepower: calculationStore.pumpHorsepower,
      pumpEfficiency: calculationStore.pumpEfficiency,
      wellDepth: calculationStore.wellDepth,
      calculatedKwh: calculationStore.calculatedKwh,
      waterFlowRate: calculationStore.waterFlowRate,
      monthlyVolume: calculationStore.monthlyVolume
    };

    await historyStore.saveRecord(record);
    uiStore.setSuccess('紀錄已儲存');
  } catch (error) {
    uiStore.setError(error.message);
  }
};

const handleDeleteRecord = async (id) => {
  try {
    await historyStore.deleteRecord(id);
    uiStore.setSuccess('紀錄已刪除');
  } catch (error) {
    uiStore.setError(error.message);
  }
};

// Lifecycle
onMounted(async () => {
  try {
    // Check online status
    uiStore.checkOnlineStatus();

    // Load history from LocalStorage
    await historyStore.loadFromStorage();

    // Fetch Taipower pricing
    await calculationStore.fetchTaipowerPricing();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});
</script>
```

---

## Step 10: Configure ECharts Tree-Shaking

**Create `src/config/echarts.js`**:

```javascript
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';

// Register only needed components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Changes will hot-reload automatically.

---

### Run Tests

```bash
# Unit tests (watch mode)
npm test

# Component tests
npm run test:component

# E2E tests (requires dev server running)
npm run test:e2e

# Test UI (visual test runner)
npm run test:ui

# Coverage report
npm run test:coverage
```

---

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

**Output**: `dist/` directory (ready for Netlify deployment)

---

### Lint & Format

```bash
# Lint Vue files
npm run lint

# Format code
npm run format
```

---

## Environment Variables

**Create `.env` file**:

```env
VITE_TAIPOWER_API_URL=https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json
VITE_APP_TITLE=智慧農業水資源管理平台
```

**Usage in code**:
```javascript
const apiUrl = import.meta.env.VITE_TAIPOWER_API_URL;
```

---

## Netlify Deployment

**Create `netlify.toml`**:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Deploy**:
```bash
# Via Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Or connect your GitHub repository to Netlify for automatic deployments.

---

## Troubleshooting

### Issue: Vite not starting

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: ECharts not rendering

**Solution**: Ensure tree-shaking config is imported in `main.js`
```javascript
import '@/config/echarts';
```

---

### Issue: Pinia store not reactive

**Solution**: Use `storeToRefs` for destructuring
```javascript
import { storeToRefs } from 'pinia';
const { waterFlowRate } = storeToRefs(useCalculationStore());
```

---

### Issue: Tests failing with "Cannot find module"

**Solution**: Check `vitest.config.js` has correct alias
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

---

## VS Code Extensions (Recommended)

- **Volar** (Vue Language Features)
- **Vue VSCode Snippets**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier**
- **Playwright Test for VSCode**

---

## Useful Commands Cheatsheet

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm test` | Run unit tests (watch mode) |
| `npm run test:e2e` | Run E2E tests |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

---

## Next Steps

1. Review all stores in `src/stores/`
2. Implement Vue components (see `contracts/vue-components.md`)
3. Write tests for each component/composable
4. Test on multiple browsers (Chrome, Firefox, Safari)
5. Deploy to Netlify
6. Run Lighthouse audit for performance

---

## Resources

- **Vue 3 Docs**: https://vuejs.org/guide/
- **Vite Docs**: https://vitejs.dev/guide/
- **Pinia Docs**: https://pinia.vuejs.org/
- **ECharts Docs**: https://echarts.apache.org/handbook/en/get-started/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev/guide/
- **Playwright**: https://playwright.dev/

---

**Happy coding! 🚀**

如有問題，請參考 `/specs/001-build-an-application/` 中的其他規劃文件。
