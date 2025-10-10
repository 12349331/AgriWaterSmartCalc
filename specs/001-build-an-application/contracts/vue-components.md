# Vue Component Contracts

**Feature**: 001-build-an-application
**Date**: 2025-10-09
**Purpose**: Define props, emits, and slots for all Vue 3 components and composables

---

## Component Interface Standards

All components follow Vue 3 **`<script setup>`** with TypeScript-style JSDoc annotations:

```vue
<script setup>
/**
 * @typedef {Object} Props
 * @property {string} propName - Description
 */

defineProps({
  propName: {
    type: String,
    required: true,
    validator: (value) => value.length > 0
  }
});

const emit = defineEmits(['eventName']);
</script>
```

---

## 1. Calculator Components

### 1.1 CalculatorForm.vue

**Purpose**: Main input form for electricity bill and field parameters.

**Props**:
```typescript
{
  modelValue: Object,           // v-model binding for form data
  disabled: Boolean             // Disable all inputs (offline mode)
}
```

**Emits**:
```typescript
{
  'update:modelValue': (formData: FormData) => void,
  'submit': (formData: FormData) => void,
  'reset': () => void
}

interface FormData {
  electricityType: string,
  billingSeason: '夏月' | '非夏月',
  billAmount: number,
  cropType: string,
  fieldArea: number,
  region: '北部' | '中部' | '南部'
}
```

**Slots**:
```typescript
{
  'actions': void,              // Custom action buttons
  'help-text': void             // Additional help text
}
```

**Usage Example**:
```vue
<template>
  <CalculatorForm
    v-model="formData"
    :disabled="uiStore.isOffline"
    @submit="handleCalculate"
  >
    <template #actions>
      <button @click="handleAdvanced">進階設定</button>
    </template>
  </CalculatorForm>
</template>

<script setup>
import { ref } from 'vue';
import { useUiStore } from '@/stores/ui';
import CalculatorForm from '@/components/calculator/CalculatorForm.vue';

const formData = ref({});
const uiStore = useUiStore();

const handleCalculate = (data) => {
  console.log('Calculate:', data);
};
</script>
```

---

### 1.2 ResultCard.vue

**Purpose**: Display calculated water flow rate (Q) and monthly volume (V).

**Props**:
```typescript
{
  waterFlowRate: Number,        // Q in tons/minute
  monthlyVolume: Number,        // V in tons/fen
  calculatedKwh: Number,        // Reverse-calculated electricity usage
  isOverExtraction: Boolean,    // Warning flag
  loading: Boolean              // Show loading state
}
```

**Emits**:
```typescript
{
  'save': () => void,           // User clicked save button
  'share': () => void           // User clicked share button (future)
}
```

**Slots**:
```typescript
{
  'header': void,               // Custom header
  'footer': void                // Custom footer
}
```

**Implementation**:
```vue
<template>
  <div class="result-card">
    <slot name="header">
      <h3>計算結果</h3>
    </slot>

    <div v-if="loading" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else class="results">
      <div class="result-item">
        <label>推算用電度數</label>
        <span>{{ calculatedKwh.toFixed(2) }} 度</span>
      </div>

      <div class="result-item">
        <label>每分鐘抽水量 (Q)</label>
        <span>{{ waterFlowRate.toFixed(2) }} 噸/分鐘</span>
      </div>

      <div class="result-item" :class="{ 'warning': isOverExtraction }">
        <label>每月用水量 (V)</label>
        <span>{{ monthlyVolume.toFixed(2) }} 噸/分地</span>
        <p v-if="isOverExtraction" class="warning-text">
          ⚠️ 用水量過高，可能超抽
        </p>
      </div>
    </div>

    <div class="actions">
      <button @click="$emit('save')">儲存紀錄</button>
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  waterFlowRate: { type: Number, required: true },
  monthlyVolume: { type: Number, required: true },
  calculatedKwh: { type: Number, required: true },
  isOverExtraction: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

defineEmits(['save', 'share']);
</script>
```

---

### 1.3 AdvancedParams.vue

**Purpose**: Collapsible advanced pump parameters (horsepower, efficiency, well depth).

**Props**:
```typescript
{
  modelValue: PumpParams,
  show: Boolean                 // Controlled by parent
}
```

**Emits**:
```typescript
{
  'update:modelValue': (params: PumpParams) => void,
  'update:show': (visible: Boolean) => void,
  'reset': () => void           // Reset to defaults
}

interface PumpParams {
  pumpHorsepower: number,       // HP
  pumpEfficiency: number,       // 0.0 - 1.0
  wellDepth: number             // meters
}
```

**Slots**: None

**Usage**:
```vue
<AdvancedParams
  v-model="pumpParams"
  v-model:show="showAdvanced"
  @reset="resetToDefaults"
/>
```

---

## 2. Dashboard Components

### 2.1 DashboardTabs.vue

**Purpose**: Tab navigation for seasonal/comparison/trend charts.

**Props**:
```typescript
{
  modelValue: string,           // Active tab ID
  tabs: Array<Tab>              // Tab definitions
}

interface Tab {
  id: string,                   // 'seasonal' | 'comparison' | 'trend'
  label: string,                // Display name
  icon?: string,                // Optional icon class
  disabled?: boolean            // Disable tab
}
```

**Emits**:
```typescript
{
  'update:modelValue': (tabId: string) => void,
  'change': (tabId: string) => void
}
```

**Slots**:
```typescript
{
  'tab-{id}': void,             // Custom tab content (e.g., 'tab-seasonal')
  'default': void               // Fallback content
}
```

---

### 2.2 SeasonalChart.vue

**Purpose**: ECharts bar chart showing seasonal water usage for selected crop.

**Props**:
```typescript
{
  cropType: string,             // Selected crop name
  baseVolume: number,           // Monthly volume (V) from calculation
  height: string,               // Chart height (default: '400px')
  loading: boolean              // Show loading animation
}
```

**Emits**:
```typescript
{
  'chart-click': (params: EChartsClickEvent) => void,
  'chart-ready': (chartInstance: EChartsInstance) => void
}

interface EChartsClickEvent {
  name: string,                 // Season name ('春季', '夏季', etc.)
  value: number,                // Volume value
  seriesName: string
}
```

**Slots**: None (chart only)

**Implementation**:
```vue
<template>
  <v-chart
    ref="chartRef"
    class="seasonal-chart"
    :style="{ height }"
    :option="chartOption"
    :loading="loading"
    autoresize
    @click="handleClick"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import VChart from 'vue-echarts';
import { useConfigStore } from '@/stores/config';

const props = defineProps({
  cropType: { type: String, required: true },
  baseVolume: { type: Number, required: true },
  height: { type: String, default: '400px' },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['chart-click', 'chart-ready']);

const configStore = useConfigStore();
const chartRef = ref(null);

const chartOption = computed(() => {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  const seasonNames = ['春季', '夏季', '秋季', '冬季'];
  const data = seasons.map(season =>
    props.baseVolume * configStore.getSeasonalFactor(props.cropType, season)
  );

  return {
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
      data: seasonNames
    },
    yAxis: {
      type: 'value',
      name: '用水量 (噸/分地)'
    },
    series: [{
      name: '預估用水量',
      type: 'bar',
      data,
      itemStyle: {
        color: '#3b82f6'
      }
    }]
  };
});

const handleClick = (params) => {
  emit('chart-click', params);
};

onMounted(() => {
  if (chartRef.value) {
    emit('chart-ready', chartRef.value.chart);
  }
});
</script>
```

---

### 2.3 CropComparisonChart.vue

**Purpose**: ECharts grouped bar chart comparing average water usage across crop types.

**Props**:
```typescript
{
  records: Array<EstimationRecord>,  // Historical records
  height: string,
  loading: boolean
}
```

**Emits**: Same as SeasonalChart

**Data Transformation**:
```javascript
const chartData = computed(() => {
  // Group records by crop type, calculate averages
  const grouped = props.records.reduce((acc, record) => {
    if (!acc[record.cropType]) acc[record.cropType] = [];
    acc[record.cropType].push(record.monthlyVolume);
    return acc;
  }, {});

  return Object.entries(grouped).map(([crop, volumes]) => ({
    name: crop,
    value: volumes.reduce((a, b) => a + b, 0) / volumes.length
  }));
});
```

---

### 2.4 AnnualTrendChart.vue

**Purpose**: ECharts line chart showing projected annual water usage trend.

**Props**:
```typescript
{
  baseVolume: number,
  monthlyFactors: Array<number>,     // 12 months (optional custom factors)
  height: string,
  loading: boolean
}
```

**Emits**: Same as SeasonalChart

**Slots**: None

---

## 3. History Components

### 3.1 HistoryTable.vue

**Purpose**: Sortable table displaying historical estimation records.

**Props**:
```typescript
{
  records: Array<EstimationRecord>,
  sortBy: string,                    // 'timestamp' | 'cropType' | 'monthlyVolume'
  sortOrder: 'asc' | 'desc',
  loading: boolean,
  emptyText: string                  // Custom empty state text
}
```

**Emits**:
```typescript
{
  'update:sortBy': (column: string) => void,
  'update:sortOrder': (order: 'asc' | 'desc') => void,
  'row-click': (record: EstimationRecord) => void,
  'delete': (recordId: string) => void
}
```

**Slots**:
```typescript
{
  'empty': void,                     // Custom empty state
  'actions': { record: EstimationRecord } // Custom row actions
}
```

**Implementation**:
```vue
<template>
  <div class="history-table">
    <table>
      <thead>
        <tr>
          <th @click="handleSort('timestamp')">
            日期
            <SortIcon :active="sortBy === 'timestamp'" :order="sortOrder" />
          </th>
          <th @click="handleSort('cropType')">作物類型</th>
          <th @click="handleSort('billAmount')">電費金額</th>
          <th @click="handleSort('calculatedKwh')">推算度數</th>
          <th @click="handleSort('monthlyVolume')">用水量</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody v-if="sortedRecords.length > 0">
        <tr
          v-for="record in sortedRecords"
          :key="record.id"
          @click="$emit('row-click', record)"
        >
          <td>{{ formatDate(record.timestamp) }}</td>
          <td>{{ record.cropType }}</td>
          <td>{{ record.billAmount.toFixed(2) }} 元</td>
          <td>{{ record.calculatedKwh.toFixed(2) }} 度</td>
          <td>{{ record.monthlyVolume.toFixed(2) }} 噸/分</td>
          <td>
            <slot name="actions" :record="record">
              <button @click.stop="$emit('delete', record.id)">刪除</button>
            </slot>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="6" class="empty">
            <slot name="empty">
              {{ emptyText || '尚無歷史紀錄' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  records: { type: Array, required: true },
  sortBy: { type: String, default: 'timestamp' },
  sortOrder: { type: String, default: 'desc' },
  loading: { type: Boolean, default: false },
  emptyText: String
});

const emit = defineEmits(['update:sortBy', 'update:sortOrder', 'row-click', 'delete']);

const sortedRecords = computed(() => {
  const sorted = [...props.records].sort((a, b) => {
    const aVal = a[props.sortBy];
    const bVal = b[props.sortBy];
    return props.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });
  return sorted;
});

const handleSort = (column) => {
  if (props.sortBy === column) {
    emit('update:sortOrder', props.sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    emit('update:sortBy', column);
    emit('update:sortOrder', 'desc');
  }
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-TW');
};
</script>
```

---

### 3.2 ClearHistoryButton.vue

**Purpose**: Button with confirmation dialog for clearing all history.

**Props**:
```typescript
{
  disabled: boolean,
  variant: 'primary' | 'danger'
}
```

**Emits**:
```typescript
{
  'confirm': () => void,            // User confirmed deletion
  'cancel': () => void              // User cancelled
}
```

**Slots**:
```typescript
{
  'dialog-title': void,
  'dialog-message': void
}
```

---

## 4. Common Components

### 4.1 LoadingSpinner.vue

**Props**:
```typescript
{
  size: 'sm' | 'md' | 'lg',
  color: string                      // Tailwind color class
}
```

**Emits**: None

**Slots**: None

---

### 4.2 ErrorMessage.vue

**Props**:
```typescript
{
  message: string,
  type: 'error' | 'warning' | 'info',
  dismissible: boolean,
  autoDismiss: number               // Auto-dismiss after N milliseconds
}
```

**Emits**:
```typescript
{
  'dismiss': () => void
}
```

**Slots**:
```typescript
{
  'icon': void,
  'actions': void
}
```

---

### 4.3 OfflineNotice.vue

**Purpose**: Full-screen overlay when offline (per FR-017).

**Props**:
```typescript
{
  show: boolean
}
```

**Emits**: None

**Slots**:
```typescript
{
  'default': void                    // Custom offline message
}
```

**Implementation**:
```vue
<template>
  <Transition name="fade">
    <div v-if="show" class="offline-overlay">
      <div class="offline-content">
        <slot>
          <h2>無法連線</h2>
          <p>請檢查網路連線後重試</p>
        </slot>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true }
});
</script>

<style scoped>
.offline-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 5. Composables Contracts

### 5.1 usePowerCalculator()

**Returns**:
```typescript
{
  reverseBillToKwh: (
    billAmount: number,
    electricityType: string,
    billingSeason: string,
    pricingData: Array
  ) => number,

  isValidBillAmount: (amount: number) => boolean
}
```

**Usage**:
```javascript
import { usePowerCalculator } from '@/composables/usePowerCalculator';

const { reverseBillToKwh } = usePowerCalculator();
const kwh = reverseBillToKwh(1250, '表燈非營業用', '夏月', pricingData);
```

---

### 5.2 useWaterCalculator()

**Returns**:
```typescript
{
  calculateWaterFlowRate: (
    horsepower: number,
    efficiency: number,
    wellDepth: number
  ) => number,

  calculateMonthlyVolume: (
    flowRate: number,
    kwh: number,
    horsepower: number,
    fieldArea: number
  ) => number,

  checkOverExtraction: (volume: number, threshold: number) => boolean
}
```

---

### 5.3 useValidation()

**Returns**:
```typescript
{
  rules: {
    billAmount: (value: number) => string | null,
    fieldArea: (value: number) => string | null,
    pumpEfficiency: (value: number) => string | null,
    wellDepth: (value: number) => string | null
  },

  validateForm: (formData: Object) => { valid: boolean, errors: Object }
}
```

---

### 5.4 useStorage()

**Returns**:
```typescript
{
  loadFromLocalStorage: (key: string) => Promise<any>,
  saveToLocalStorage: (key: string, data: any) => Promise<void>,
  clearStorage: (key: string) => Promise<void>,
  isQuotaExceeded: () => boolean
}
```

---

## Testing Component Contracts

### Component Test Example (Vitest + Vue Test Utils)

```javascript
// tests/component/CalculatorForm.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import CalculatorForm from '@/components/calculator/CalculatorForm.vue';

describe('CalculatorForm.vue', () => {
  it('emits submit event with form data', async () => {
    const wrapper = mount(CalculatorForm, {
      global: {
        plugins: [createPinia()]
      }
    });

    // Test props
    expect(wrapper.props('disabled')).toBe(false);

    // Test emits
    await wrapper.find('form').trigger('submit');
    expect(wrapper.emitted('submit')).toBeTruthy();

    // Test slots
    expect(wrapper.find('[name="actions"]').exists()).toBe(true);
  });
});
```

---

## Next Steps

1. **Phase 1 Final**: Generate `quickstart.md` (Vite setup guide)
2. **Phase 2**: Generate `tasks.md` via `/speckit.tasks`

All Vue component interfaces are now fully specified and ready for implementation.
