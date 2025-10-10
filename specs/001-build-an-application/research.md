# Technical Research: Agricultural Water Usage Estimator (Vue 3 Stack)

**Feature**: 001-build-an-application
**Date**: 2025-10-09
**Purpose**: Resolve all "NEEDS CLARIFICATION" items and document Vue 3 + Vite ecosystem decisions

---

## Research Questions

From Technical Context and Constitution Check, the following unknowns were identified:

1. **Vitest Configuration for Vue SFC Testing** (Constitution Check II)
2. **ECharts Integration Best Practices** (Constitution Check II)
3. **Pinia Store Testing Strategies** (Constitution Check II)
4. **CI/CD Pipeline for Vite Build** (Constitution Check II)

---

## 1. Vitest Configuration for Vue SFC Testing

### Decision: **Vitest + @vue/test-utils + happy-dom**

### Rationale:

**Vitest** is the natural choice for Vue 3 + Vite projects:

- **Native Vite Integration**: Shares the same config file (`vite.config.js`), instant HMR in tests
- **Vue SFC Support**: Out-of-the-box `.vue` file transformation with `@vitejs/plugin-vue`
- **Fast Execution**: Native ES modules, parallel test execution, smart watch mode
- **Jest-Compatible API**: Familiar `describe`, `it`, `expect` syntax
- **Vue Ecosystem**: Official support from Vue core team

**@vue/test-utils** provides Vue-specific testing utilities:
- Component mounting (`mount`, `shallowMount`)
- Props/emits testing
- Async component handling
- Slot and provide/inject testing

**happy-dom** over jsdom:
- 3-5x faster than jsdom
- Better Web API compatibility
- Smaller memory footprint

### Configuration:

```javascript
// vitest.config.js
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
        'src/main.js' // entry point
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

```javascript
// tests/setup.js
import { config } from '@vue/test-utils';

// Mock global properties if needed
config.global.mocks = {
  $t: (key) => key // Mock i18n if added later
};

// Stub ECharts globally for component tests
config.global.stubs = {
  'v-chart': true // Mock ECharts Vue wrapper
};
```

### Component Testing Example:

```javascript
// tests/component/CalculatorForm.test.js
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import CalculatorForm from '@/components/calculator/CalculatorForm.vue';

describe('CalculatorForm.vue', () => {
  it('validates bill amount input', async () => {
    const wrapper = mount(CalculatorForm, {
      global: {
        plugins: [createPinia()]
      }
    });

    const billInput = wrapper.find('input[name="billAmount"]');
    await billInput.setValue(-100); // Invalid negative value
    await billInput.trigger('blur');

    expect(wrapper.text()).toContain('電費金額必須大於 0 元');
  });

  it('emits calculate event with valid data', async () => {
    const wrapper = mount(CalculatorForm, {
      global: {
        plugins: [createPinia()]
      }
    });

    // Fill form
    await wrapper.find('input[name="billAmount"]').setValue(1250);
    await wrapper.find('select[name="cropType"]').setValue('水稻');
    await wrapper.find('input[name="fieldArea"]').setValue(10.5);

    // Submit
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('calculate')).toBeTruthy();
    expect(wrapper.emitted('calculate')[0][0]).toMatchObject({
      billAmount: 1250,
      cropType: '水稻',
      fieldArea: 10.5
    });
  });
});
```

### Alternatives Considered:

| Framework | Pros | Cons | Rejection Reason |
|-----------|------|------|------------------|
| **Jest + @vue/test-utils** | Mature, large ecosystem | Slow ES module support, requires Babel config | Vitest is faster and Vite-native |
| **Cypress Component Testing** | Real browser, visual debugging | Slower, heavier setup | Better for e2e; Vitest better for unit/component |
| **Testing Library (Vue)** | User-centric queries | Less Vue-specific features | @vue/test-utils has better Vue internals access |

---

## 2. ECharts Integration Best Practices

### Decision: **vue-echarts + Lazy Loading + Tree-Shaking**

### Rationale:

**vue-echarts** is the official Vue wrapper for ECharts:
- **Vue 3 Support**: Built for Vue 3 Composition API
- **Reactive Props**: Automatically updates charts when data changes
- **TypeScript Support**: Full type definitions
- **Event Handling**: Vue-friendly `@click`, `@mouseover` chart events

**Lazy Loading Strategy**:
```javascript
// src/components/dashboard/SeasonalChart.vue
<script setup>
import { defineAsyncComponent } from 'vue';

// Lazy load ECharts only when chart component is rendered
const VChart = defineAsyncComponent(() =>
  import('vue-echarts').then(module => module.default)
);
</script>
```

**Tree-Shaking Configuration** (reduce bundle size from 1MB to ~200KB):
```javascript
// src/config/echarts.js
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';

// Only import needed components
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

### Component Implementation:

```vue
<!-- src/components/dashboard/SeasonalChart.vue -->
<template>
  <v-chart
    class="chart"
    :option="chartOption"
    :loading="loading"
    autoresize
    @click="handleChartClick"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import VChart from 'vue-echarts';
import { useCalculationStore } from '@/stores/calculation';

const props = defineProps({
  cropType: String,
  baseVolume: Number
});

const calculationStore = useCalculationStore();
const loading = ref(false);

const chartOption = computed(() => ({
  title: {
    text: `${props.cropType} 季節用水量分析`,
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c} 噸/分地'
  },
  xAxis: {
    type: 'category',
    data: ['春季', '夏季', '秋季', '冬季']
  },
  yAxis: {
    type: 'value',
    name: '用水量 (噸/分地)'
  },
  series: [{
    name: '預估用水量',
    type: 'bar',
    data: calculationStore.getSeasonalData(props.baseVolume),
    itemStyle: {
      color: '#3b82f6'
    }
  }]
}));

const handleChartClick = (params) => {
  console.log('Chart clicked:', params);
};
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
```

### Performance Optimization:

```javascript
// vite.config.js - Manual chunk splitting for ECharts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts/core', 'echarts/charts', 'echarts/components'],
          'vue-echarts': ['vue-echarts']
        }
      }
    }
  }
});
```

### Alternatives Considered:

| Option | Pros | Cons | Rejection Reason |
|--------|------|------|------------------|
| **Chart.js + vue-chartjs** | Smaller bundle (~60KB) | Less professional charts, fewer chart types | Spec requires professional agricultural dashboard |
| **ApexCharts** | Modern, good docs | Not as feature-rich as ECharts | ECharts has better big data performance |
| **D3.js** | Ultimate flexibility | Steep learning curve, manual Vue integration | Too low-level; ECharts provides ready components |

---

## 3. Pinia Store Testing Strategies

### Decision: **Direct Store Import + createPinia() in Tests**

### Rationale:

Pinia stores are easy to test due to their simple structure:
- **Unit Testable**: Actions are plain async functions
- **No Mocking Required**: Can test stores in isolation
- **Reactive Testing**: Can test computed getters reactively

### Store Testing Pattern:

```javascript
// tests/unit/stores/calculation.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCalculationStore } from '@/stores/calculation';

describe('Calculation Store', () => {
  beforeEach(() => {
    // Create fresh Pinia instance for each test
    setActivePinia(createPinia());
  });

  it('calculates water flow rate correctly', () => {
    const store = useCalculationStore();

    store.setPumpParams({
      horsepower: 5.0,
      efficiency: 0.75,
      wellDepth: 20.0
    });

    expect(store.waterFlowRate).toBeCloseTo(2.35, 2);
  });

  it('stores calculation history', async () => {
    const store = useCalculationStore();

    await store.saveCalculation({
      billAmount: 1250,
      cropType: '水稻',
      calculatedKwh: 450.5,
      monthlyVolume: 1250.75
    });

    expect(store.history.length).toBe(1);
    expect(store.history[0].cropType).toBe('水稻');
  });

  it('handles API fetch errors', async () => {
    const store = useCalculationStore();

    // Mock fetch to throw error
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    await expect(store.fetchTaipowerPricing()).rejects.toThrow('無法連線至台電系統');
  });
});
```

### Store Implementation Example:

```javascript
// src/stores/calculation.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCalculationStore = defineStore('calculation', () => {
  // State
  const pumpHorsepower = ref(5.0);
  const pumpEfficiency = ref(0.75);
  const wellDepth = ref(20.0);
  const calculatedKwh = ref(0);

  // Getters (computed)
  const waterFlowRate = computed(() => {
    return (pumpHorsepower.value * pumpEfficiency.value) / (0.222 * wellDepth.value * 1.2);
  });

  const monthlyVolume = computed(() => {
    if (!fieldArea.value) return 0;
    return (waterFlowRate.value * 60 * calculatedKwh.value) / (2 * pumpHorsepower.value * fieldArea.value);
  });

  // Actions
  function setPumpParams(params) {
    pumpHorsepower.value = params.horsepower;
    pumpEfficiency.value = params.efficiency;
    wellDepth.value = params.wellDepth;
  }

  async function fetchTaipowerPricing() {
    try {
      const response = await fetch(import.meta.env.VITE_TAIPOWER_API_URL);
      if (!response.ok) throw new Error('Fetch failed');
      return await response.json();
    } catch (error) {
      throw new Error('無法連線至台電系統，請檢查網路');
    }
  }

  return {
    // State
    pumpHorsepower,
    pumpEfficiency,
    wellDepth,
    calculatedKwh,
    // Getters
    waterFlowRate,
    monthlyVolume,
    // Actions
    setPumpParams,
    fetchTaipowerPricing
  };
});
```

### Alternatives Considered:

| Approach | Pros | Cons | Rejection Reason |
|----------|------|------|------------------|
| **Vuex** | More mature | Verbose mutations, deprecated for Vue 3 | Pinia is official Vue 3 state library |
| **Composables Only** | No extra dependency | Manual persistence logic | Pinia has devtools + plugin ecosystem |
| **Zustand (React port)** | Minimal API | Not Vue-native | Pinia is better integrated with Vue |

---

## 4. CI/CD Pipeline for Vite Build

### Decision: **GitHub Actions + Netlify CLI + Vite Build**

### Rationale:

**GitHub Actions** advantages for Vite projects:
- **Fast Setup**: Pre-built Node.js actions
- **Caching**: npm dependencies caching (2-3x faster builds)
- **Matrix Testing**: Test across multiple Node versions
- **Deployment Integration**: Deploy to Netlify after tests pass

### Workflow Configuration:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, 001-build-an-application]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit -- --run

      - name: Run component tests
        run: npm run test:component -- --run

      - name: Build Vite app
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          VITE_TAIPOWER_API_URL: ${{ secrets.VITE_TAIPOWER_API_URL }}

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### Netlify Configuration:

```toml
# netlify.toml
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
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Package.json Scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:unit": "vitest --dir tests/unit",
    "test:component": "vitest --dir tests/component",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore",
    "format": "prettier --write src/"
  }
}
```

### Performance Optimizations:

**Vite Build Config**:
```javascript
// vite.config.js
export default defineConfig({
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
    chunkSizeWarningLimit: 600 // 600KB warning threshold
  }
});
```

### Alternatives Considered:

| Option | Pros | Cons | Rejection Reason |
|--------|------|------|------------------|
| **Vercel** | Great DX, instant previews | Vendor lock-in | Team prefers Netlify |
| **GitLab CI** | Powerful pipelines | Not on GitLab | Code hosted on GitHub |
| **Circle CI** | Fast, great caching | Paid for private repos | GitHub Actions is free |

---

## Summary of Decisions

| Research Question | Decision | Key Benefit | Bundle Impact |
|-------------------|----------|-------------|---------------|
| **Vue SFC Testing** | Vitest + @vue/test-utils + happy-dom | Native Vite integration, 3-5x faster | Dev only (0KB) |
| **ECharts Integration** | vue-echarts + lazy loading + tree-shaking | Professional charts, ~200KB after optimization | +200KB gzipped |
| **Store Testing** | Direct Pinia import + createPinia() | Simple, no mocking needed | Dev only (0KB) |
| **CI/CD** | GitHub Actions + Netlify CLI | Free, automated deploy previews | N/A |

---

## Final Technology Stack

```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "pinia": "^2.2.0",
    "vue-echarts": "^7.0.3",
    "echarts": "^5.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "happy-dom": "^12.10.0",
    "playwright": "^1.40.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-plugin-vue": "^9.19.0",
    "prettier": "^3.1.0"
  }
}
```

**Total Production Bundle Estimate**:
- Vue 3 runtime: ~30KB gzipped
- Pinia: ~5KB gzipped
- ECharts (tree-shaken): ~200KB gzipped
- vue-echarts: ~10KB gzipped
- Tailwind (purged): ~10KB gzipped
- App code: ~85KB gzipped
- **Total**: ~340KB gzipped ✅ (under 500KB target)

---

## Next Steps

1. **Phase 1**: Generate `data-model.md` (Pinia store schemas)
2. **Phase 1**: Generate `/contracts/` (Vue component props/emits, composables interfaces)
3. **Phase 1**: Generate `quickstart.md` (Vite setup, npm run dev)
4. **Phase 1**: Update `CLAUDE.md` (agent context with Vue 3 stack)
5. **Phase 2**: Generate `tasks.md` via `/speckit.tasks`

All technical decisions are documented and ready for Vue 3 implementation.
