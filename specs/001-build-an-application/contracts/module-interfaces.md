# Module Interface Contracts

**Feature**: 001-build-an-application
**Date**: 2025-10-09
**Purpose**: Define public interfaces for all ES6 modules (TypeScript-style JSDoc annotations)

---

## Overview

This document specifies the public API contracts for each module in the application. All modules use ES6 `export` syntax and should include JSDoc type annotations for IDE autocomplete and documentation.

**Contract Principles**:
1. **Immutability**: Modules should not mutate input parameters
2. **Error Handling**: All functions throw descriptive errors (Traditional Chinese messages)
3. **Pure Functions**: Calculation modules have no side effects (except I/O operations)
4. **Async Operations**: API calls and storage operations return Promises

---

## 1. power_calculator.js

**Responsibility**: Fetch Taipower pricing data and reverse-calculate kWh from bill amount.

### 1.1 fetchTaipowerPricing()

Fetches and caches electricity pricing data from Taipower Open Data API.

**Signature**:
```javascript
/**
 * Fetches Taipower electricity pricing data (cached for 24 hours).
 * @returns {Promise<TaipowerPricingData[]>} Array of pricing tiers
 * @throws {Error} If fetch fails or network unavailable (FR-017)
 */
export async function fetchTaipowerPricing()
```

**Return Type**:
```javascript
TaipowerPricingData[] = [
  {
    用電種類: string,     // e.g., "表燈非營業用"
    計費月份: string,     // "夏月" | "非夏月"
    級距: string,         // e.g., "120度以下"
    單價: number,         // TWD per kWh
    備註: string
  }
]
```

**Error Cases**:
- **NetworkError**: `"無法連線至台電系統，請檢查網路"`
- **ParseError**: `"台電資料格式錯誤"`

**Side Effects**: Writes to `localStorage` (pricing data + timestamp)

**Performance**: <500ms (or return cached data instantly)

---

### 1.2 reverseBillToKwh()

Reverse-calculates electricity usage (kWh) from bill amount using progressive pricing tiers.

**Signature**:
```javascript
/**
 * Reverse-calculates kWh from bill amount using Taipower pricing structure.
 * @param {number} billAmount - Total bill in TWD (元)
 * @param {string} electricityType - Rate category (e.g., "表燈非營業用")
 * @param {string} billingSeason - "夏月" | "非夏月"
 * @param {TaipowerPricingData[]} pricingData - Fetched pricing tiers
 * @returns {number} Calculated electricity usage in kWh (度)
 * @throws {Error} If billAmount ≤ 0 or no matching pricing tier found
 */
export function reverseBillToKwh(billAmount, electricityType, billingSeason, pricingData)
```

**Algorithm**:
1. Filter `pricingData` by `electricityType` and `billingSeason`
2. Iterate through tiers (e.g., 0-120, 121-330, 331-500, 501+)
3. Calculate cumulative cost per tier
4. Return total kWh when cumulative cost ≥ `billAmount`

**Validation**:
- `billAmount > 0` (else throw `"電費金額必須大於 0 元"`)
- `billAmount < 50000` (else throw `"電費金額異常，請檢查輸入"`)

**Example**:
```javascript
const kwh = reverseBillToKwh(1250.50, "表燈非營業用", "夏月", pricingData);
// Returns: 450.5 kWh (approximate)
```

**Performance**: <10ms (pure calculation)

---

## 2. water_calculator.js

**Responsibility**: Calculate water flow rate (Q) and monthly volume (V) using academic formulas.

### 2.1 calculateWaterFlowRate()

Computes per-minute water flow rate based on pump specifications.

**Signature**:
```javascript
/**
 * Calculates water flow rate (Q) in tons per minute.
 * Formula: Q = (P * η) / (0.222 * H * 1.2)
 * @param {number} pumpHorsepower - Motor power (HP)
 * @param {number} pumpEfficiency - Efficiency η (0.0 - 1.0)
 * @param {number} wellDepth - Water head (meters)
 * @returns {number} Flow rate Q in tons/minute
 * @throws {Error} If parameters out of valid range (FR-006)
 */
export function calculateWaterFlowRate(pumpHorsepower, pumpEfficiency, wellDepth)
```

**Validation**:
- `pumpHorsepower > 0` (else throw `"馬達馬力必須大於 0"`)
- `0.0 < pumpEfficiency ≤ 1.0` (else throw `"抽水效率需介於 0 至 1.0 之間"`)
- `wellDepth > 0` (else throw `"水井深度必須大於 0 公尺"`)

**Constants** (from `config.js`):
- Gravity constant: `0.222`
- Safety factor: `1.2`

**Example**:
```javascript
const Q = calculateWaterFlowRate(5.0, 0.75, 20.0);
// Returns: 2.35 tons/minute (approximate)
```

**Performance**: <1ms (pure math)

---

### 2.2 calculateMonthlyVolume()

Computes monthly water usage per fen (unit of area).

**Signature**:
```javascript
/**
 * Calculates monthly water volume (V) per fen of cultivated area.
 * Formula: V = (Q * 60 * C) / (2 * P * A_fen)
 * @param {number} waterFlowRate - Q from calculateWaterFlowRate() (tons/minute)
 * @param {number} calculatedKwh - Monthly electricity usage (kWh)
 * @param {number} pumpHorsepower - Motor power (HP)
 * @param {number} fieldArea - Area in fen (分地)
 * @returns {number} Monthly volume V in tons per fen
 * @throws {Error} If fieldArea out of range (0.5 - 50 fen per FR-006)
 */
export function calculateMonthlyVolume(waterFlowRate, calculatedKwh, pumpHorsepower, fieldArea)
```

**Validation**:
- `0.5 ≤ fieldArea ≤ 50` (else throw `"耕作面積需介於 0.5 至 50 分地之間"`)

**Constants** (from `config.js`):
- Minutes per hour: `60`
- Hours per kWh divisor: `2` (empirical factor)

**Example**:
```javascript
const V = calculateMonthlyVolume(2.35, 450.5, 5.0, 10.5);
// Returns: 1250.75 tons/fen (approximate)
```

**Performance**: <1ms (pure math)

---

### 2.3 checkOverExtractionWarning()

Determines if calculated water volume exceeds sustainable threshold.

**Signature**:
```javascript
/**
 * Checks if monthly volume exceeds over-extraction warning threshold.
 * @param {number} monthlyVolume - V from calculateMonthlyVolume() (tons/fen)
 * @returns {boolean} True if exceeds threshold (FR-015, 詳細需求 2.1.3)
 */
export function checkOverExtractionWarning(monthlyVolume)
```

**Threshold** (from `config.js`): `2000 tons/fen`

**Example**:
```javascript
const isOverExtraction = checkOverExtractionWarning(2500);
// Returns: true (warning should be displayed)
```

**Performance**: <1ms

---

## 3. storage.js

**Responsibility**: Persist and retrieve estimation records from LocalStorage.

### 3.1 saveEstimationRecord()

Saves a new estimation record to LocalStorage.

**Signature**:
```javascript
/**
 * Saves an estimation record to LocalStorage.
 * @param {EstimationRecord} record - Record object (see data-model.md)
 * @returns {Promise<void>} Resolves when saved
 * @throws {Error} If LocalStorage quota exceeded or serialization fails
 */
export async function saveEstimationRecord(record)
```

**Process**:
1. Validate `record` schema (all required fields present)
2. Generate UUID for `record.id` if not provided
3. Append to existing array in `localStorage['aquametrics_estimations']`
4. Serialize to JSON and save

**Error Cases**:
- **QuotaExceededError**: `"儲存空間已滿，請清除舊紀錄"`
- **ValidationError**: `"紀錄格式錯誤"`

**Side Effects**: Writes to `localStorage`

**Performance**: <50ms

---

### 3.2 loadAllEstimations()

Retrieves all saved estimation records.

**Signature**:
```javascript
/**
 * Loads all estimation records from LocalStorage.
 * @returns {Promise<EstimationRecord[]>} Array of records (empty if none)
 * @throws {Error} If JSON parsing fails (corrupted data)
 */
export async function loadAllEstimations()
```

**Return Value**: Array sorted by `timestamp` (most recent first)

**Error Cases**:
- **ParseError**: `"歷史紀錄資料損壞"` (rare; manual localStorage edit)

**Performance**: <100ms (for 100 records)

---

### 3.3 clearAllEstimations()

Deletes all estimation records from LocalStorage.

**Signature**:
```javascript
/**
 * Clears all estimation records (requires user confirmation in UI).
 * @returns {Promise<void>} Resolves when cleared
 */
export async function clearAllEstimations()
```

**Process**:
1. Remove `localStorage['aquametrics_estimations']`
2. Preserve Taipower pricing cache (separate key)

**Side Effects**: Writes to `localStorage`

**Performance**: <10ms

---

### 3.4 exportEstimationsToCSV()

Exports estimation records to CSV format (future feature).

**Signature**:
```javascript
/**
 * Exports estimation records to CSV file (future feature - 詳細需求 4).
 * @param {EstimationRecord[]} records - Records to export
 * @returns {Promise<string>} CSV string
 */
export async function exportEstimationsToCSV(records)
```

**CSV Columns**: `日期,作物類型,電費金額,推算度數,用水量(噸/分),備註`

**Performance**: <500ms (for 100 records)

---

## 4. chart_manager.js

**Responsibility**: Generate Chart.js visualizations for dashboard.

### 4.1 renderSeasonalChart()

Renders seasonal water usage bar chart (Tab 1).

**Signature**:
```javascript
/**
 * Renders seasonal analysis chart for selected crop.
 * @param {string} canvasId - Canvas element ID (e.g., "seasonalChart")
 * @param {string} cropType - Selected crop name (e.g., "水稻")
 * @param {number} baseVolume - Baseline monthly volume (V)
 * @param {CropType} cropConfig - Crop configuration with seasonalFactors
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderSeasonalChart(canvasId, cropType, baseVolume, cropConfig)
```

**Chart Type**: Bar chart (4 bars: 春/夏/秋/冬)

**Data Calculation**:
```javascript
seasonVolume = baseVolume * cropConfig.seasonalFactors[season]
```

**Accessibility**: ARIA labels via Chart.js a11y plugin

**Performance**: <500ms (per Performance Goals)

---

### 4.2 renderCropComparisonChart()

Renders crop-to-crop comparison bar chart (Tab 2).

**Signature**:
```javascript
/**
 * Renders crop comparison chart across all crop types.
 * @param {string} canvasId - Canvas element ID
 * @param {EstimationRecord[]} records - All historical records
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderCropComparisonChart(canvasId, records)
```

**Chart Type**: Grouped bar chart (one group per crop)

**Data Calculation**: Average `monthlyVolume` for each unique `cropType` in `records`

**Performance**: <1s (for 100 records, per FR-SC-005)

---

### 4.3 renderAnnualTrendChart()

Renders annual trend line chart (Tab 3).

**Signature**:
```javascript
/**
 * Renders annual water usage trend line chart.
 * @param {string} canvasId - Canvas element ID
 * @param {number} baseVolume - Current estimation's monthly volume
 * @returns {Promise<Chart>} Chart.js instance
 */
export async function renderAnnualTrendChart(canvasId, baseVolume)
```

**Chart Type**: Line chart (12 data points: 1月 - 12月)

**Data Calculation**: Projected using monthly usage factors from `config.js`

**Performance**: <500ms

---

### 4.4 destroyChart()

Safely destroys a Chart.js instance to prevent memory leaks.

**Signature**:
```javascript
/**
 * Destroys a Chart.js instance (call before re-rendering).
 * @param {Chart} chartInstance - Chart.js object to destroy
 * @returns {void}
 */
export function destroyChart(chartInstance)
```

**Purpose**: Prevent memory leaks when switching tabs or re-calculating

**Performance**: <10ms

---

## 5. ui.js

**Responsibility**: DOM manipulation, form handling, and rendering logic.

### 5.1 initializeApp()

Initializes application on page load.

**Signature**:
```javascript
/**
 * Initializes application (called from main.js).
 * @returns {Promise<void>} Resolves when initialization complete
 */
export async function initializeApp()
```

**Process**:
1. Load Taipower pricing data (via `power_calculator.fetchTaipowerPricing()`)
2. Populate crop type dropdown (from `config.CROP_TYPES`)
3. Load historical records count (display in UI)
4. Attach event listeners to all form inputs

**Performance**: <1s (includes API fetch)

---

### 5.2 handleCalculation()

Handles "Calculate" button click (or real-time input change).

**Signature**:
```javascript
/**
 * Handles water usage calculation when user submits form.
 * @returns {Promise<void>} Resolves when calculation and UI update complete
 * @throws {Error} Displays user-friendly error messages in UI
 */
export async function handleCalculation()
```

**Process**:
1. Validate all form inputs (per FR-006)
2. Call `reverseBillToKwh()` → get `calculatedKwh`
3. Call `calculateWaterFlowRate()` → get `waterFlowRate`
4. Call `calculateMonthlyVolume()` → get `monthlyVolume`
5. Check `checkOverExtractionWarning()` → display warning if needed
6. Update results card in UI
7. Create `EstimationRecord` object (call `saveEstimationRecord()` if user clicks "Save")

**Error Handling**: Catch validation errors and display in Traditional Chinese

**Performance**: <100ms (per FR-SC-002)

---

### 5.3 renderHistoricalTable()

Renders historical estimation records in table format.

**Signature**:
```javascript
/**
 * Renders historical records table (User Story P2).
 * @param {EstimationRecord[]} records - All saved records
 * @returns {void} Updates DOM directly
 */
export function renderHistoricalTable(records)
```

**Table Columns**: 日期 | 作物類型 | 電費金額 | 推算度數 | 用水量 | 備註

**Sorting**: Default = most recent first; allow click-to-sort on column headers

**Performance**: <500ms (for 50+ records, per FR-SC-007)

---

### 5.4 showOfflineMessage()

Displays offline error message when Taipower API fails (FR-017).

**Signature**:
```javascript
/**
 * Displays "No connection" message and disables functionality (FR-017).
 * @returns {void} Updates DOM directly
 */
export function showOfflineMessage()
```

**Message**: `"無法連線，請檢查網路連線"`

**Behavior**: Disable all form inputs and calculation button

---

### 5.5 displayValidationError()

Shows validation error message near input field.

**Signature**:
```javascript
/**
 * Displays validation error message for specific input field.
 * @param {string} fieldId - Input element ID (e.g., "billAmount")
 * @param {string} errorMessage - Error message in Traditional Chinese
 * @returns {void} Updates DOM directly
 */
export function displayValidationError(fieldId, errorMessage)
```

**Styling**: Red text, icon, accessible ARIA labels

---

## 6. main.js

**Responsibility**: Application entry point and event binding.

### 6.1 DOMContentLoaded Event Listener

**Signature**:
```javascript
/**
 * Entry point: initializes app when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
});
```

**Process**:
1. Call `ui.initializeApp()`
2. Bind event listeners for:
   - Form input changes (real-time validation)
   - Calculate button click
   - Save record button
   - Clear all records button (with confirmation dialog)
   - Tab switching (dashboard)

---

## Error Handling Strategy

All modules follow consistent error handling:

1. **Validation Errors**: Throw descriptive errors in Traditional Chinese
2. **Network Errors**: Catch and display offline message (FR-017)
3. **Storage Errors**: Catch quota exceeded and prompt user to clear old records
4. **Unexpected Errors**: Log to console (future: send to Sentry)

**Example Pattern**:
```javascript
try {
  const kwh = reverseBillToKwh(billAmount, type, season, pricing);
} catch (error) {
  ui.displayValidationError('billAmount', error.message);
}
```

---

## Testing Contracts

Each module function should have corresponding tests:

- **Unit Tests**: `tests/unit/[module-name].test.js`
- **Integration Tests**: `tests/integration/[feature].test.js`
- **E2E Tests**: `tests/e2e/user_story_[p1/p2/p3].test.js`

**Example Unit Test** (Vitest):
```javascript
// tests/unit/water_calculator.test.js
import { describe, it, expect } from 'vitest';
import { calculateWaterFlowRate } from '../../modules/water_calculator.js';

describe('calculateWaterFlowRate', () => {
  it('calculates correct flow rate for valid inputs', () => {
    const Q = calculateWaterFlowRate(5.0, 0.75, 20.0);
    expect(Q).toBeCloseTo(2.35, 2); // 2 decimal places
  });

  it('throws error for zero horsepower', () => {
    expect(() => calculateWaterFlowRate(0, 0.75, 20.0))
      .toThrow('馬達馬力必須大於 0');
  });
});
```

---

## Next Steps

1. **Phase 1 Remaining**: Generate `quickstart.md` (developer onboarding guide)
2. **Phase 1 Remaining**: Update agent context (`.claude/` or similar)
3. **Phase 2**: Generate `tasks.md` via `/speckit.tasks` command

All module interfaces are now defined and ready for implementation.
