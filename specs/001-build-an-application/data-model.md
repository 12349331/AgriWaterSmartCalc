# Data Model: Agricultural Water Usage Estimator (Vue 3 + Pinia)

**Feature**: 001-build-an-application
**Date**: 2025-10-09
**Source**: Extracted from spec.md and adapted for Vue 3 + Pinia architecture

---

## Overview

This application uses **Pinia stores** for reactive state management and **LocalStorage** for data persistence. All data models are defined as Pinia stores with computed getters and actions.

---

## Pinia Store Architecture

### Store Hierarchy

```
app (Vue 3 instance)
├── calculation store    # Current calculation state & formulas
├── history store        # Historical estimation records
├── config store         # Static config (crops, regions, constants)
└── ui store            # UI state (loading, errors, modals)
```

---

## Store 1: Calculation Store

**Purpose**: Manages current calculation session, input parameters, and computed results.

**File**: `src/stores/calculation.js`

### State Schema

```typescript
{
  // Step 1: User Inputs (Bill Analysis)
  electricityType: string,      // e.g., "表燈非營業用"
  billingSeason: string,        // "夏月" | "非夏月"
  billAmount: number,           // TWD, e.g., 1250.50

  // Step 2: Field & Pump Parameters
  cropType: string,             // e.g., "水稻"
  fieldArea: number,            // 分地, e.g., 10.5
  region: string,               // "北部" | "中部" | "南部"

  // Advanced Parameters
  pumpHorsepower: number,       // HP, e.g., 5.0
  pumpEfficiency: number,       // 0.0 - 1.0, e.g., 0.75
  wellDepth: number,            // meters, e.g., 20.0

  // Computed Results (from getters)
  calculatedKwh: number,        // Reverse-calculated kWh
  waterFlowRate: number,        // Q (tons/minute)
  monthlyVolume: number,        // V (tons/fen)

  // Taipower API Data (cached)
  taipowerPricing: Array,       // Cached pricing tiers
  pricingCacheTimestamp: number // Unix timestamp for cache expiry
}
```

### Getters (Computed Properties)

```javascript
// src/stores/calculation.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCalculationStore = defineStore('calculation', () => {
  // State
  const billAmount = ref(0);
  const electricityType = ref('表燈非營業用');
  const billingSeason = ref('夏月');
  const cropType = ref('');
  const fieldArea = ref(0);
  const region = ref('南部');
  const pumpHorsepower = ref(5.0);
  const pumpEfficiency = ref(0.75);
  const wellDepth = ref(20.0);
  const taipowerPricing = ref([]);
  const pricingCacheTimestamp = ref(0);

  // Getters
  const calculatedKwh = computed(() => {
    if (!billAmount.value || !taipowerPricing.value.length) return 0;
    return reverseBillToKwh(
      billAmount.value,
      electricityType.value,
      billingSeason.value,
      taipowerPricing.value
    );
  });

  const waterFlowRate = computed(() => {
    // Q = (P * η) / (0.222 * H * 1.2)
    if (!pumpHorsepower.value || !wellDepth.value) return 0;
    return (pumpHorsepower.value * pumpEfficiency.value) /
           (0.222 * wellDepth.value * 1.2);
  });

  const monthlyVolume = computed(() => {
    // V = (Q * 60 * C) / (2 * P * A_fen)
    if (!waterFlowRate.value || !fieldArea.value) return 0;
    return (waterFlowRate.value * 60 * calculatedKwh.value) /
           (2 * pumpHorsepower.value * fieldArea.value);
  });

  const isOverExtraction = computed(() => {
    return monthlyVolume.value > 2000; // Threshold from config
  });

  // Actions
  async function fetchTaipowerPricing() {
    const cacheAge = Date.now() - pricingCacheTimestamp.value;
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

    if (cacheAge < CACHE_TTL && taipowerPricing.value.length > 0) {
      return taipowerPricing.value; // Return cached data
    }

    try {
      const response = await fetch(import.meta.env.VITE_TAIPOWER_API_URL);
      if (!response.ok) throw new Error('Fetch failed');

      const data = await response.json();
      taipowerPricing.value = data;
      pricingCacheTimestamp.value = Date.now();

      // Persist to LocalStorage
      localStorage.setItem('aquametrics_taipower_pricing', JSON.stringify(data));
      localStorage.setItem('aquametrics_pricing_timestamp', Date.now().toString());

      return data;
    } catch (error) {
      throw new Error('無法連線至台電系統，請檢查網路');
    }
  }

  function setPumpParams(params) {
    pumpHorsepower.value = params.horsepower;
    pumpEfficiency.value = params.efficiency;
    wellDepth.value = params.wellDepth;
  }

  function setFormData(data) {
    billAmount.value = data.billAmount;
    electricityType.value = data.electricityType;
    billingSeason.value = data.billingSeason;
    cropType.value = data.cropType;
    fieldArea.value = data.fieldArea;
    region.value = data.region;
  }

  function reset() {
    billAmount.value = 0;
    cropType.value = '';
    fieldArea.value = 0;
    // Keep advanced params (user preference)
  }

  return {
    // State
    billAmount,
    electricityType,
    billingSeason,
    cropType,
    fieldArea,
    region,
    pumpHorsepower,
    pumpEfficiency,
    wellDepth,
    taipowerPricing,
    // Getters
    calculatedKwh,
    waterFlowRate,
    monthlyVolume,
    isOverExtraction,
    // Actions
    fetchTaipowerPricing,
    setPumpParams,
    setFormData,
    reset
  };
});
```

### Validation Rules

**Implemented as a separate composable**: `src/composables/useValidation.js`

```javascript
export function useValidation() {
  const rules = {
    billAmount: (value) => {
      if (value <= 0) return '電費金額必須大於 0 元';
      if (value > 50000) return '電費金額異常，請檢查輸入';
      return null;
    },
    fieldArea: (value) => {
      if (value < 0.5 || value > 50) return '耕作面積需介於 0.5 至 50 分地之間';
      return null;
    },
    pumpEfficiency: (value) => {
      if (value <= 0 || value > 1.0) return '抽水效率需介於 0 至 1.0 之間';
      return null;
    },
    wellDepth: (value) => {
      if (value <= 0) return '水井深度必須大於 0 公尺';
      return null;
    }
  };

  return { rules };
}
```

---

## Store 2: History Store

**Purpose**: Manages historical estimation records with LocalStorage persistence.

**File**: `src/stores/history.js`

### State Schema

```typescript
{
  records: Array<EstimationRecord>  // Array of estimation records
}

// EstimationRecord interface
interface EstimationRecord {
  id: string,               // UUID v4
  timestamp: number,        // Unix timestamp
  recordDate: string,       // ISO 8601 date string

  // User Inputs
  electricityType: string,
  billingSeason: string,
  billAmount: number,
  cropType: string,
  fieldArea: number,
  region: string,
  pumpHorsepower: number,
  pumpEfficiency: number,
  wellDepth: number,

  // Computed Results
  calculatedKwh: number,
  waterFlowRate: number,
  monthlyVolume: number,

  // Optional
  notes: string             // Max 500 chars
}
```

### Store Implementation

```javascript
// src/stores/history.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export const useHistoryStore = defineStore('history', () => {
  const records = ref([]);

  // Getters
  const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => b.timestamp - a.timestamp);
  });

  const recordsByRegion = computed(() => (region) => {
    return records.value.filter(r => r.region === region);
  });

  const recordsByCrop = computed(() => (cropType) => {
    return records.value.filter(r => r.cropType === cropType);
  });

  const averageVolumeByCrop = computed(() => {
    const grouped = records.value.reduce((acc, record) => {
      if (!acc[record.cropType]) acc[record.cropType] = [];
      acc[record.cropType].push(record.monthlyVolume);
      return acc;
    }, {});

    return Object.entries(grouped).map(([crop, volumes]) => ({
      cropType: crop,
      averageVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length
    }));
  });

  // Actions
  async function loadFromStorage() {
    try {
      const stored = localStorage.getItem('aquametrics_estimations');
      if (stored) {
        records.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      throw new Error('歷史紀錄資料損壞');
    }
  }

  async function saveRecord(record) {
    try {
      const newRecord = {
        id: uuidv4(),
        timestamp: Date.now(),
        recordDate: new Date().toISOString(),
        ...record
      };

      records.value.push(newRecord);

      // Persist to LocalStorage
      localStorage.setItem('aquametrics_estimations', JSON.stringify(records.value));

      return newRecord;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('儲存空間已滿，請清除舊紀錄');
      }
      throw error;
    }
  }

  async function deleteRecord(id) {
    records.value = records.value.filter(r => r.id !== id);
    localStorage.setItem('aquametrics_estimations', JSON.stringify(records.value));
  }

  async function clearAll() {
    records.value = [];
    localStorage.removeItem('aquametrics_estimations');
  }

  async function exportToCSV() {
    const headers = ['日期', '作物類型', '電費金額', '推算度數', '用水量(噸/分)', '備註'];
    const rows = sortedRecords.value.map(r => [
      new Date(r.timestamp).toLocaleDateString('zh-TW'),
      r.cropType,
      r.billAmount.toFixed(2),
      r.calculatedKwh.toFixed(2),
      r.monthlyVolume.toFixed(2),
      r.notes || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  return {
    records,
    sortedRecords,
    recordsByRegion,
    recordsByCrop,
    averageVolumeByCrop,
    loadFromStorage,
    saveRecord,
    deleteRecord,
    clearAll,
    exportToCSV
  };
});
```

---

## Store 3: Config Store

**Purpose**: Manages static configuration (crop types, regional presets, calculation constants).

**File**: `src/stores/config.js`

### State Schema

```typescript
{
  cropTypes: Array<CropType>,
  regionalPresets: Array<RegionalPreset>,
  calculationConstants: CalculationConstants
}

interface CropType {
  id: string,
  name: string,
  waterCoefficient: number,
  seasonalFactors: {
    spring: number,
    summer: number,
    autumn: number,
    winter: number
  },
  description: string
}

interface RegionalPreset {
  id: string,
  name: string,
  defaultCrops: string[],
  defaultWellDepth: number,
  gpsCoordinates: { latitude: number, longitude: number }
}

interface CalculationConstants {
  gravityConstant: number,        // 0.222
  safetyFactor: number,           // 1.2
  minutesPerHour: number,         // 60
  hoursPerKwhDivisor: number,    // 2
  overExtractionThreshold: number // 2000 tons/fen
}
```

### Store Implementation

```javascript
// src/stores/config.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { CROP_TYPES } from '@/config/crops';
import { REGIONAL_PRESETS } from '@/config/regions';
import { CALCULATION_PARAMS } from '@/config/constants';

export const useConfigStore = defineStore('config', () => {
  const cropTypes = ref(CROP_TYPES);
  const regionalPresets = ref(REGIONAL_PRESETS);
  const constants = ref(CALCULATION_PARAMS);

  // Getters
  const getCropById = computed(() => (id) => {
    return cropTypes.value.find(c => c.id === id);
  });

  const getCropByName = computed(() => (name) => {
    return cropTypes.value.find(c => c.name === name);
  });

  const getRegionById = computed(() => (id) => {
    return regionalPresets.value.find(r => r.id === id);
  });

  const getSeasonalFactor = computed(() => (cropType, season) => {
    const crop = getCropByName.value(cropType);
    return crop?.seasonalFactors[season] || 1.0;
  });

  return {
    cropTypes,
    regionalPresets,
    constants,
    getCropById,
    getCropByName,
    getRegionById,
    getSeasonalFactor
  };
});
```

### Static Config Files

```javascript
// src/config/crops.js
export const CROP_TYPES = [
  {
    id: 'rice',
    name: '水稻',
    waterCoefficient: 1.2,
    seasonalFactors: { spring: 0.9, summer: 1.3, autumn: 1.0, winter: 0.7 },
    description: '適用於稻米種植，需水量高'
  },
  {
    id: 'leafy_greens',
    name: '葉菜類',
    waterCoefficient: 0.8,
    seasonalFactors: { spring: 1.0, summer: 1.2, autumn: 0.9, winter: 0.8 },
    description: '如高麗菜、萵苣等葉菜'
  },
  // ... 5-8 total crop types
];

// src/config/regions.js
export const REGIONAL_PRESETS = [
  {
    id: 'north',
    name: '北部',
    defaultCrops: ['rice', 'leafy_greens'],
    defaultWellDepth: 20.0,
    gpsCoordinates: { latitude: 25.0330, longitude: 121.5654 }
  },
  // ... 3 regions
];

// src/config/constants.js
export const CALCULATION_PARAMS = {
  gravityConstant: 0.222,
  safetyFactor: 1.2,
  minutesPerHour: 60,
  hoursPerKwhDivisor: 2,
  overExtractionThreshold: 2000
};
```

---

## Store 4: UI Store

**Purpose**: Manages UI state (loading, errors, modals, toasts).

**File**: `src/stores/ui.js`

### State Schema

```typescript
{
  isLoading: boolean,
  error: string | null,
  successMessage: string | null,
  isOffline: boolean,
  activeTab: string,              // 'seasonal' | 'comparison' | 'trend'
  showClearConfirm: boolean,
  showAdvancedParams: boolean
}
```

### Store Implementation

```javascript
// src/stores/ui.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false);
  const error = ref(null);
  const successMessage = ref(null);
  const isOffline = ref(false);
  const activeTab = ref('seasonal');
  const showClearConfirm = ref(false);
  const showAdvancedParams = ref(false);

  // Actions
  function setLoading(value) {
    isLoading.value = value;
  }

  function setError(message) {
    error.value = message;
    setTimeout(() => {
      error.value = null;
    }, 5000); // Auto-dismiss after 5s
  }

  function setSuccess(message) {
    successMessage.value = message;
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }

  function checkOnlineStatus() {
    isOffline.value = !navigator.onLine;

    window.addEventListener('online', () => {
      isOffline.value = false;
    });

    window.addEventListener('offline', () => {
      isOffline.value = true;
    });
  }

  function setActiveTab(tab) {
    activeTab.value = tab;
  }

  function toggleAdvancedParams() {
    showAdvancedParams.value = !showAdvancedParams.value;
  }

  return {
    isLoading,
    error,
    successMessage,
    isOffline,
    activeTab,
    showClearConfirm,
    showAdvancedParams,
    setLoading,
    setError,
    setSuccess,
    checkOnlineStatus,
    setActiveTab,
    toggleAdvancedParams
  };
});
```

---

## Data Flow Diagram (Vue 3 + Pinia)

```
User Input (Vue Component)
   ↓
CalculatorForm.vue
   ↓ (emits @calculate event)
App.vue (handles event)
   ↓
calculation store actions
   ├── fetchTaipowerPricing() → fetch API → cache to LocalStorage
   ├── setFormData() → update reactive state
   └── computed getters auto-recalculate:
       ├── calculatedKwh (from taipowerPricing)
       ├── waterFlowRate (from pump params)
       └── monthlyVolume (from waterFlowRate + kWh)
   ↓
ResultCard.vue (watches store getters)
   ↓ (user clicks "Save")
history store.saveRecord()
   ↓ LocalStorage persistence
   ↓
HistoryTable.vue (watches history.sortedRecords)
   ↓
Dashboard Charts (watches history + calculation stores)
```

---

## LocalStorage Structure

**Keys**:
- `aquametrics_estimations` → JSON array of EstimationRecord[]
- `aquametrics_taipower_pricing` → Cached Taipower API response
- `aquametrics_pricing_timestamp` → Cache timestamp (24h TTL)

**Size Limit**: ~5-10 MB (browser-dependent)

**Example**:
```json
{
  "aquametrics_estimations": "[{...}, {...}]",
  "aquametrics_taipower_pricing": "[{...}]",
  "aquametrics_pricing_timestamp": "1696800000000"
}
```

---

## Composables (Reusable Logic)

### usePowerCalculator

```javascript
// src/composables/usePowerCalculator.js
export function usePowerCalculator() {
  function reverseBillToKwh(billAmount, electricityType, billingSeason, pricingData) {
    // Filter pricing tiers by type and season
    const tiers = pricingData.filter(p =>
      p.用電種類 === electricityType &&
      p.計費月份 === billingSeason
    );

    let totalKwh = 0;
    let remainingBill = billAmount;

    for (const tier of tiers) {
      const tierCost = tier.單價 * getTierLimit(tier.級距);
      if (remainingBill <= tierCost) {
        totalKwh += remainingBill / tier.單價;
        break;
      }
      totalKwh += getTierLimit(tier.級距);
      remainingBill -= tierCost;
    }

    return totalKwh;
  }

  function getTierLimit(tierString) {
    // Parse "120度以下" → 120, "121-330度" → 210, etc.
    // Implementation details...
  }

  return { reverseBillToKwh };
}
```

### useWaterCalculator

```javascript
// src/composables/useWaterCalculator.js
export function useWaterCalculator() {
  function calculateWaterFlowRate(horsepower, efficiency, wellDepth) {
    return (horsepower * efficiency) / (0.222 * wellDepth * 1.2);
  }

  function calculateMonthlyVolume(flowRate, kwh, horsepower, fieldArea) {
    return (flowRate * 60 * kwh) / (2 * horsepower * fieldArea);
  }

  return { calculateWaterFlowRate, calculateMonthlyVolume };
}
```

---

## Testing Strategy

### Store Testing Example

```javascript
// tests/unit/stores/calculation.test.js
import { setActivePinia, createPinia } from 'pinia';
import { useCalculationStore } from '@/stores/calculation';

describe('Calculation Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('calculates water flow rate reactively', () => {
    const store = useCalculationStore();

    store.pumpHorsepower = 5.0;
    store.pumpEfficiency = 0.75;
    store.wellDepth = 20.0;

    expect(store.waterFlowRate).toBeCloseTo(2.35, 2);
  });
});
```

---

## Migration from Vanilla JS

**Key Differences**:

| Vanilla JS | Vue 3 + Pinia |
|------------|---------------|
| `modules/power_calculator.js` | `stores/calculation.js` + `composables/usePowerCalculator.js` |
| `modules/storage.js` | `stores/history.js` (with LocalStorage actions) |
| `config.js` (global) | `stores/config.js` + `/config/*.js` (static imports) |
| Manual DOM updates | Vue reactive templates (auto-update) |
| Event listeners | Vue `@event` directives + store watchers |

---

## Next Steps

1. **Phase 1**: Generate `contracts/` (Vue component props/emits interfaces)
2. **Phase 1**: Generate `quickstart.md` (Vite setup guide)
3. **Phase 2**: Generate `tasks.md` via `/speckit.tasks`

All Pinia stores are now defined and ready for Vue 3 implementation.
