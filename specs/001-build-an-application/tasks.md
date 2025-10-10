# Tasks: Agricultural Water Usage Estimator (AquaMetrics)

**Input**: Design documents from `/specs/001-build-an-application/`
**Prerequisites**: plan.md, spec.md (user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Comprehensive testing is MANDATORY per Constitution II (Testing Standards - NON-NEGOTIABLE). Phase 7 includes unit, component, integration, and end-to-end tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Repository root structure: `src/`, `tests/`, `public/`
- Vue 3 SPA with Vite build tool
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Vue 3 + Vite structure

- [x] **T001** Initialize Vite + Vue 3 project at repository root using `npm create vite@latest . -- --template vue`
- [x] **T002** Install core dependencies: `vue@^3.5.0`, `pinia@^2.2.0`, `vue-echarts@^7.0.3`, `echarts@^5.5.0`, `uuid@^10.0.0`
- [x] **T003** [P] Install dev dependencies: `@vitejs/plugin-vue@^5.0.0`, `tailwindcss@^3.4.0`, `postcss@^8.4.0`, `autoprefixer@^10.4.0`
- [x] **T004** [P] Install testing dependencies: `vitest@^1.0.0`, `@vue/test-utils@^2.4.0`, `happy-dom@^12.10.0`, `playwright@^1.40.0`, `@playwright/test@^1.40.0`
- [x] **T005** [P] Install linting tools: `eslint@^8.56.0`, `eslint-plugin-vue@^9.19.0`, `prettier@^3.1.0`
- [x] **T006** Create `vite.config.js` with alias configuration (`@` → `./src`), build optimization (code-splitting, manual chunks), and tree-shaking
- [x] **T007** [P] Initialize Tailwind CSS: run `npx tailwindcss init -p` and configure `tailwind.config.js` with content paths
- [x] **T008** [P] Create `vitest.config.js` with Vue plugin, happy-dom environment, and coverage settings
- [x] **T009** [P] Create `playwright.config.js` for E2E tests targeting http://localhost:3000
- [x] **T010** Create `src/assets/styles/main.css` with Tailwind imports and custom component classes (btn-primary, input-field, result-card)
- [x] **T011** [P] Create `netlify.toml` with build command, publish directory (dist), redirects for SPA, and security headers
- [x] **T012** [P] Create `.env` file with `VITE_TAIPOWER_API_URL=https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json`
- [x] **T013** Create project directory structure: `src/{components/{calculator,dashboard,history,common},composables,stores,utils,config,assets/styles}`, `tests/{unit/{composables,stores,utils},component,e2e}`
- [x] **T014** Update `package.json` with npm scripts: dev, build, preview, test, test:unit, test:component, test:e2e, lint, format

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] **T015** Create `src/config/constants.js` with calculation constants (gravityConstant: 0.222, safetyFactor: 1.2, minutesPerHour: 60, hoursPerKwhDivisor: 2, overExtractionThreshold: 2000)
- [x] **T016** [P] Create `src/config/crops.js` with CROP_TYPES array containing 5-8 Taiwan crop types (Rice, Leafy Greens, Root Vegetables, Citrus Trees, Mango Trees) with waterCoefficient and seasonalFactors (spring, summer, autumn, winter)
- [x] **T017** [P] Create `src/config/regions.js` with REGIONAL_PRESETS array for 3 regions (North, Central, South Taiwan) including defaultCrops, defaultWellDepth, and GPS coordinates
- [x] **T018** [P] Create `src/config/echarts.js` to configure ECharts tree-shaking by importing and registering only needed components (CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent)
- [x] **T019** Create `src/stores/config.js` (Pinia store) that imports static configs and provides getters: getCropById, getCropByName, getRegionById, getSeasonalFactor
- [x] **T020** [P] Create `src/stores/ui.js` (Pinia store) for UI state management: isLoading, error, successMessage, isOffline, activeTab, showClearConfirm, showAdvancedParams with actions: setLoading, setError, setSuccess, checkOnlineStatus, setActiveTab, toggleAdvancedParams
- [x] **T021** Create `src/composables/useValidation.js` with validation rules for billAmount (>0, <50000), fieldArea (0.5-50), pumpEfficiency (0-1.0), wellDepth (>0) returning Traditional Chinese error messages
- [x] **T022** [P] Create `src/utils/validators.js` with pure validation functions (no dependencies)
- [x] **T023** [P] Create `src/utils/formatters.js` with number/date formatters for Traditional Chinese locale (zh-TW)
- [x] **T024** Create `src/components/common/LoadingSpinner.vue` with props: size ('sm'|'md'|'lg'), color (Tailwind class)
- [x] **T025** [P] Create `src/components/common/ErrorMessage.vue` with props: message, type ('error'|'warning'|'info'), dismissible, autoDismiss; emits: dismiss
- [x] **T026** [P] Create `src/components/common/OfflineNotice.vue` with prop: show (boolean), displaying full-screen overlay with "無法連線" message in Traditional Chinese
- [x] **T027** Create `src/main.js` as Vue app entry point: import createApp, createPinia, App.vue, Tailwind CSS, ECharts config; initialize Pinia and mount app to #app
- [x] **T028** Create `index.html` with Vite entry point, Traditional Chinese lang attribute, and viewport meta tag

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Calculate Water Usage from Current Data (Priority: P1) 🎯 MVP

**Goal**: Enable farmers to estimate water consumption by entering electricity usage, crop type, and field area to receive calculated water flow rate (Q) and monthly volume (V).

**Independent Test**: Enter electricity bill amount (e.g., 1250 TWD), select crop type (e.g., 水稻), enter field area (e.g., 10.5 fen), submit form, and verify that calculated Q (tons/minute) and V (tons/fen) are displayed with reasonable values.

### Implementation for User Story 1

- [ ] **T029** [P] [US1] Create `src/composables/usePowerCalculator.js` with `reverseBillToKwh()` function that implements progressive pricing tier calculation (accepts billAmount, electricityType, billingSeason, pricingData; returns calculatedKwh; validates billAmount 10-5000 kWh per FR-006)
- [ ] **T030** [P] [US1] Create `src/composables/useWaterCalculator.js` with two functions: `calculateWaterFlowRate(horsepower, efficiency, wellDepth)` using formula Q = (P _ η) / (0.222 _ H _ 1.2), and `calculateMonthlyVolume(flowRate, kwh, horsepower, fieldArea)` using formula V = (Q _ 60 _ C) / (2 _ P \* A_fen)
- [ ] **T031** [US1] Create `src/stores/calculation.js` (Pinia store) with state: billAmount, electricityType, billingSeason, cropType, fieldArea, region, pumpHorsepower, pumpEfficiency, wellDepth, taipowerPricing, pricingCacheTimestamp; computed getters: calculatedKwh, waterFlowRate, monthlyVolume, isOverExtraction; actions: fetchTaipowerPricing (with 24h cache), setPumpParams, setFormData, reset (depends on T029, T030)
- [ ] **T032** [US1] Create `src/components/calculator/CalculatorForm.vue` with form inputs for billAmount, electricityType dropdown, billingSeason radio buttons (夏月/非夏月), cropType dropdown (from config store), fieldArea input, region dropdown (北部/中部/南部); props: modelValue, disabled; emits: update:modelValue, submit, reset; uses useValidation composable for real-time validation
- [ ] **T033** [US1] Create `src/components/calculator/AdvancedParams.vue` as collapsible section with inputs for pumpHorsepower, pumpEfficiency, wellDepth; props: modelValue (PumpParams object), show (boolean); emits: update:modelValue, update:show, reset; includes default value reset button
- [ ] **T034** [US1] Create `src/components/calculator/ResultCard.vue` to display calculation results; props: waterFlowRate, monthlyVolume, calculatedKwh, isOverExtraction, loading; emits: save, share; displays 3 result items (推算用電度數, 每分鐘抽水量 Q, 每月用水量 V) with warning styling if isOverExtraction is true; includes "儲存紀錄" button
- [ ] **T035** [US1] Create `src/App.vue` as root component integrating CalculatorForm, ResultCard, OfflineNotice, LoadingSpinner, ErrorMessage; handles calculate event by calling calculationStore.fetchTaipowerPricing() and calculationStore.setFormData(); implements onMounted hook to check online status and load Taipower pricing data
- [ ] **T036** [US1] Add form validation feedback in CalculatorForm.vue showing error messages below each input field when validation fails (uses Traditional Chinese messages from useValidation)
- [ ] **T037** [US1] Implement online/offline detection in App.vue using uiStore.checkOnlineStatus() which adds event listeners for online/offline events and shows OfflineNotice when navigator.onLine is false (per FR-017)

**Checkpoint**: At this point, User Story 1 should be fully functional - farmers can enter data and see calculated water usage results

---

## Phase 4: User Story 2 - View Historical Estimation Records (Priority: P2)

**Goal**: Enable farmers to review past water usage estimations in a sortable table format to track consumption patterns over time.

**Independent Test**: After saving 3-5 calculation records from User Story 1, navigate to history view and verify all records appear in a table with columns: date, crop type, bill amount, calculated kWh, water volume; verify table is sortable by clicking column headers; verify records persist after browser refresh.

### Implementation for User Story 2

- [ ] **T038** [P] [US2] Create `src/composables/useStorage.js` with functions: loadFromLocalStorage(key), saveToLocalStorage(key, data), clearStorage(key), isQuotaExceeded(); wraps LocalStorage operations with error handling for QuotaExceededError and JSON parse errors
- [ ] **T039** [US2] Create `src/stores/history.js` (Pinia store) with state: records (Array<EstimationRecord>); computed getters: sortedRecords (by timestamp desc), recordsByRegion(region), recordsByCrop(cropType), averageVolumeByCrop; actions: loadFromStorage, saveRecord (generates UUID with uuid package, adds timestamp/recordDate, persists to localStorage key 'aquametrics_estimations'), deleteRecord(id), clearAll, exportToCSV (depends on T038)
- [ ] **T040** [US2] Create `src/components/history/HistoryTable.vue` as sortable table component; props: records, sortBy ('timestamp'|'cropType'|'monthlyVolume'), sortOrder ('asc'|'desc'), loading, emptyText; emits: update:sortBy, update:sortOrder, row-click, delete; displays columns: 日期, 作物類型, 電費金額, 推算度數, 用水量 with sort icons; includes delete button in actions column; shows "尚無歷史紀錄" when empty
- [ ] **T041** [US2] Create `src/components/history/ClearHistoryButton.vue` with confirmation dialog; props: disabled, variant ('primary'|'danger'); emits: confirm, cancel; shows modal dialog with Traditional Chinese confirmation message "確定要清除所有歷史紀錄嗎？此操作無法復原" before emitting confirm event
- [ ] **T042** [US2] Integrate history store with App.vue: add onMounted hook to call historyStore.loadFromStorage(); add handleSaveRecord() method that collects data from calculationStore and calls historyStore.saveRecord(); wire ResultCard save event to handleSaveRecord
- [ ] **T043** [US2] Add history section to App.vue below calculator section, rendering HistoryTable component with historyStore.sortedRecords; implement handleDeleteRecord(id) method calling historyStore.deleteRecord(id); add ClearHistoryButton with confirmation flow calling historyStore.clearAll()
- [ ] **T044** [US2] Implement LocalStorage persistence in history store saveRecord() action: serialize records array to JSON, save to localStorage['aquametrics_estimations'], handle QuotaExceededError by throwing Traditional Chinese error "儲存空間已滿，請清除舊紀錄"
- [ ] **T045** [US2] Add date formatting in HistoryTable.vue using formatters.js to display timestamps as Traditional Chinese dates (e.g., "2025 年 10 月 9 日")

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - calculation results can be saved and viewed in persistent history

---

## Phase 5: User Story 3 - Visualize Usage Trends (Priority: P3)

**Goal**: Enable farmers to see visual charts of water usage patterns across different time periods and crop types to quickly identify trends without analyzing raw numbers.

**Independent Test**: With at least 3 saved estimation records for different crop types, navigate to dashboard and verify three chart tabs appear: 季節分析 (seasonal bar chart for selected crop), 作物比較 (crop comparison bar chart), 年度趨勢 (annual trend line chart); verify charts render within 3 seconds; verify hovering over chart data points shows detailed tooltips.

### Implementation for User Story 3

- [ ] **T046** [P] [US3] Create `src/components/dashboard/DashboardTabs.vue` for tab navigation; props: modelValue (active tab ID), tabs (Array<Tab> with id, label, icon, disabled fields); emits: update:modelValue, change; renders horizontal tab bar with click handlers to switch active tab; highlights active tab with Tailwind styling
- [ ] **T047** [P] [US3] Create `src/components/dashboard/SeasonalChart.vue` using vue-echarts; props: cropType, baseVolume, height (default '400px'), loading; emits: chart-click, chart-ready; computes seasonal data by multiplying baseVolume by configStore.getSeasonalFactor for each season (春/夏/秋/冬); renders ECharts bar chart with title "【cropType】季節用水量分析", tooltip, xAxis (4 seasons), yAxis (噸/分地), series (bar data with blue color #3b82f6)
- [ ] **T048** [P] [US3] Create `src/components/dashboard/CropComparisonChart.vue` using vue-echarts; props: records, height, loading; emits: chart-click, chart-ready; computes average monthlyVolume grouped by cropType from records; renders grouped bar chart comparing average water usage across all crop types; uses Traditional Chinese labels
- [ ] **T049** [P] [US3] Create `src/components/dashboard/AnnualTrendChart.vue` using vue-echarts; props: baseVolume, monthlyFactors (optional Array<number> for 12 months), height, loading; emits: chart-click, chart-ready; projects annual water usage trend as line chart with 12 data points (1 月-12 月) using baseVolume and seasonal factors; includes zoom functionality
- [ ] **T050** [US3] Add dashboard section to App.vue between results and history sections; render DashboardTabs component with 3 tabs (seasonal, comparison, trend) bound to uiStore.activeTab; conditionally render chart components based on active tab using v-if directives
- [ ] **T051** [US3] Implement lazy loading for chart components in App.vue using defineAsyncComponent(() => import('vue-echarts')) to reduce initial bundle size and only load ECharts when dashboard is viewed
- [ ] **T052** [US3] Add "more data needed" message in dashboard section when historyStore.records.length < 2, displaying Traditional Chinese text "需要更多紀錄才能顯示有意義的趨勢圖" instead of charts
- [ ] **T053** [US3] Wire SeasonalChart to use calculationStore.cropType and calculationStore.monthlyVolume as props; wire CropComparisonChart to use historyStore.records; wire AnnualTrendChart to use calculationStore.monthlyVolume with seasonal factors from configStore

**Checkpoint**: All user stories should now be independently functional - complete water estimation workflow from calculation to historical tracking to visualization

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] **T054** [P] Add accessibility features: ARIA labels to all form inputs in CalculatorForm.vue, keyboard navigation support (Tab, Enter), focus management with Vue directives (v-focus)
- [ ] **T055** [P] Add loading states: show LoadingSpinner during Taipower API fetch in App.vue, show ECharts loading animation in chart components using :loading prop
- [ ] **T056** [P] Implement error boundaries: wrap async operations in try-catch blocks, display Traditional Chinese error messages via ErrorMessage component, auto-dismiss success messages after 3 seconds
- [ ] **T057** Add responsive design: use Tailwind's mobile-first breakpoints (sm:, md:, lg:) in all components, ensure forms and tables are usable on mobile devices (touch-friendly inputs, horizontal scroll for tables)
- [ ] **T058** [P] Configure Vite production build optimization: enable terser minification with drop_console and drop_debugger, configure manual chunks for 'vue-vendor' (vue, pinia), 'echarts' (echarts/core, vue-echarts), 'utils' (formulas, validators), set chunkSizeWarningLimit to 600KB
- [ ] **T059** Add Traditional Chinese localization: verify all UI text is in Traditional Chinese, ensure date/number formatting uses zh-TW locale, validate error messages match FR-014 requirement
- [ ] **T060** [P] Create tests/setup.js for Vitest with Vue Test Utils global config, mock i18n if needed, stub v-chart component globally for non-chart component tests
- [ ] **T061** Performance optimization: verify initial page load <2s target, ensure calculation results display <100ms (reactive computed properties), confirm chart rendering <3s for 100 records, validate bundle size <500KB gzipped
- [ ] **T062** Add input validation visual feedback: real-time validation on blur events, green checkmarks for valid inputs, red error messages below invalid inputs, disable submit button when form has errors
- [ ] **T063** [P] Code cleanup: remove console.logs from production build (Vite terser config), add JSDoc comments to all composables and utility functions, ensure consistent code formatting with Prettier
- [ ] **T064** Validate against quickstart.md: verify all npm scripts work (dev, build, preview, test), confirm Vite dev server starts on port 3000, test production build outputs to dist/ directory correctly
- [ ] **T065** [P] Add WCAG 2.1 AA color contrast compliance: verify Tailwind color palette meets standards, test with browser accessibility tools, ensure all text has sufficient contrast ratios
- [ ] **T066** Create README.md in repository root with project overview, technology stack (Vue 3.5+, Vite 5.0+, Pinia 2.2+, ECharts 5.5+, Tailwind 3.4+), quick start instructions, and link to specs/001-build-an-application/quickstart.md

---

## Phase 7: Testing (Constitution Compliance)

**Purpose**: Comprehensive test coverage per Constitution II - Testing Standards (NON-NEGOTIABLE)

**Test Strategy**: Test-First Development (Red-Green-Refactor) - Tests written before/alongside implementation

### Unit Tests (Composables & Utilities)

- [ ] **T067** [P] Create `tests/unit/composables/usePowerCalculator.test.js` with test cases for reverseBillToKwh(): valid bill amounts, progressive pricing tiers, edge cases (min/max values), invalid inputs, Taipower API mock
- [ ] **T068** [P] Create `tests/unit/composables/useWaterCalculator.test.js` with test cases for calculateWaterFlowRate() and calculateMonthlyVolume(): valid inputs, boundary values, formula accuracy, error handling
- [ ] **T069** [P] Create `tests/unit/composables/useValidation.test.js` with test cases for all validation rules: billAmount (0, 10, 5000, 50000), fieldArea (0.49, 0.5, 50, 50.1), pumpEfficiency (0, 0.5, 1.0, 1.1), Traditional Chinese error messages
- [ ] **T070** [P] Create `tests/unit/composables/useStorage.test.js` with test cases for localStorage operations: save/load/clear, JSON parsing errors, QuotaExceededError handling, data persistence simulation
- [ ] **T071** [P] Create `tests/unit/utils/formulas.test.js` with test cases for water calculation formulas: Q formula accuracy (compare with manual calculations), V formula accuracy, constant values validation
- [ ] **T072** [P] Create `tests/unit/utils/validators.test.js` with test cases for pure validation functions: boundary testing, type checking, edge cases
- [ ] **T073** [P] Create `tests/unit/utils/formatters.test.js` with test cases for Traditional Chinese locale formatting: numbers, dates, currency (TWD), zh-TW locale verification

### Unit Tests (Pinia Stores)

- [ ] **T074** [P] Create `tests/unit/stores/calculation.test.js` with test cases for calculation store: fetchTaipowerPricing (mock API, caching, 24h expiry), setPumpParams, setFormData, computed getters (calculatedKwh, waterFlowRate, monthlyVolume, isOverExtraction), reset action
- [ ] **T075** [P] Create `tests/unit/stores/history.test.js` with test cases for history store: saveRecord (UUID generation, timestamp, localStorage persistence), deleteRecord, clearAll, sortedRecords getter, recordsByCrop filter, averageVolumeByCrop calculation
- [ ] **T076** [P] Create `tests/unit/stores/config.test.js` with test cases for config store: getCropById, getCropByName, getRegionById, getSeasonalFactor (spring/summer/autumn/winter), crop waterCoefficient retrieval
- [ ] **T077** [P] Create `tests/unit/stores/ui.test.js` with test cases for ui store: setLoading, setError, setSuccess, checkOnlineStatus (mock navigator.onLine), setActiveTab, toggleAdvancedParams

### Component Tests (Vue Test Utils)

- [ ] **T078** [P] Create `tests/component/CalculatorForm.test.js` with test cases: form rendering, input validation feedback, dropdown selections (crop types, regions), form submission, reset functionality, disabled state, modelValue v-model binding
- [ ] **T079** [P] Create `tests/component/AdvancedParams.test.js` with test cases: collapsible section toggle, pump parameter inputs, default value reset, show/hide state, emits update:modelValue correctly
- [ ] **T080** [P] Create `tests/component/ResultCard.test.js` with test cases: display calculated results (Q, V, kWh), overExtraction warning styling, loading state, save button emit, Traditional Chinese labels
- [ ] **T081** [P] Create `tests/component/HistoryTable.test.js` with test cases: table rendering with mock data, column sorting (click headers), empty state message, delete button functionality, Traditional Chinese date formatting
- [ ] **T082** [P] Create `tests/component/ClearHistoryButton.test.js` with test cases: confirmation dialog display, confirm/cancel emits, Traditional Chinese confirmation message, disabled state
- [ ] **T083** [P] Create `tests/component/SeasonalChart.test.js` with test cases: ECharts rendering (mock vue-echarts), seasonal data calculation, chart options (title, tooltip, xAxis, yAxis), loading state, chart-ready emit
- [ ] **T084** [P] Create `tests/component/CropComparisonChart.test.js` with test cases: average volume calculation by crop type, bar chart rendering, Traditional Chinese labels, empty data handling
- [ ] **T085** [P] Create `tests/component/AnnualTrendChart.test.js` with test cases: 12-month trend calculation, line chart rendering, zoom functionality, seasonal factor application
- [ ] **T086** [P] Create `tests/component/LoadingSpinner.test.js` with test cases: size prop variants (sm/md/lg), color prop Tailwind classes, accessibility (aria-label)
- [ ] **T087** [P] Create `tests/component/ErrorMessage.test.js` with test cases: message display, type variants (error/warning/info), dismissible functionality, auto-dismiss timer (3s), Traditional Chinese text
- [ ] **T088** [P] Create `tests/component/OfflineNotice.test.js` with test cases: full-screen overlay rendering, show prop conditional display, Traditional Chinese "無法連線" message

### Integration Tests

- [ ] **T089** Create `tests/unit/integration/taipower-api.test.js` with test cases for Taipower API integration: fetch pricing data from real endpoint (with network mock), JSON parsing, caching logic (24h), error handling (network failure, invalid JSON)
- [ ] **T090** Create `tests/unit/integration/storage-persistence.test.js` with test cases for LocalStorage persistence: save estimation record → reload → verify data intact, multiple records persistence, QuotaExceededError simulation (large dataset)
- [ ] **T091** Create `tests/unit/integration/echarts-integration.test.js` with test cases for ECharts integration: lazy loading verification, tree-shaking effectiveness (bundle size check), chart rendering with real data, performance (render 100 records <3s)

### End-to-End Tests (Playwright)

- [ ] **T092** Create `tests/e2e/user-story-p1.spec.js` for User Story 1: Navigate to app → enter bill amount (1250 TWD) → select crop type (水稻) → enter field area (10.5 分地) → click calculate → verify Q and V results displayed → verify calculations within expected range → test validation errors (invalid inputs) → verify Traditional Chinese error messages → test form reset
- [ ] **T093** Create `tests/e2e/user-story-p2.spec.js` for User Story 2: Complete calculation from P1 test → click save record → navigate to history section → verify record appears in table → verify all columns populated correctly → test sorting (click date header) → complete another calculation → save → verify 2 records in table → refresh browser → verify records persist → test delete record → test clear all history with confirmation dialog
- [ ] **T094** Create `tests/e2e/user-story-p3.spec.js` for User Story 3: Ensure 3+ saved records exist → navigate to dashboard → verify 3 chart tabs visible (季節分析, 作物比較, 年度趨勢) → click seasonal chart tab → verify chart renders → hover over bar → verify tooltip appears → click crop comparison tab → verify multi-crop chart → click annual trend tab → verify 12-month line chart → test with 1 record → verify "需要更多紀錄" message displayed
- [ ] **T095** Create `tests/e2e/offline-behavior.spec.js` for offline detection: Load app while online → simulate network offline → verify OfflineNotice overlay appears → verify Traditional Chinese "無法連線" message → verify all functionality disabled → restore network online → verify overlay disappears → verify app functionality restored
- [ ] **T096** Create `tests/e2e/edge-cases.spec.js` for edge cases: Test zero electricity (expect validation error) → test extreme field area (51 hectares, expect error) → test unusually high water usage (trigger overExtraction warning) → test non-Taiwan crop type (verify dropdown restricts choices) → test 50+ saved records (verify performance <3s chart render)
- [ ] **T097** Create `tests/e2e/accessibility.spec.js` for accessibility compliance: Keyboard navigation (Tab through form, Enter to submit) → screen reader labels (verify ARIA attributes) → color contrast check (all text meets WCAG 2.1 AA) → focus indicators visible → error messages announced to screen readers
- [ ] **T098** Create `tests/e2e/performance.spec.js` for performance validation: Measure initial page load time (target <2s) → measure calculation response time (target <100ms) → measure chart rendering with 100 records (target <3s) → verify bundle size <500KB gzipped → check for memory leaks (perform 50 calculations)

### Test Configuration & CI

- [ ] **T099** Update `vitest.config.js` to include coverage thresholds: statements 80%, branches 75%, functions 80%, lines 80%; configure reporters (html, json-summary, text); add test setup file
- [ ] **T100** Update `.github/workflows/ci.yml` to run all test suites: unit tests (npm run test:unit), component tests (npm run test:component), e2e tests (npm run test:e2e), generate coverage report, fail build if coverage below threshold, upload test artifacts

**Checkpoint**: All constitution testing requirements satisfied - comprehensive coverage across unit/component/integration/e2e tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T014) - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion (T015-T028)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete
- **Testing (Phase 7)**: Can be developed in parallel with implementation (Test-First Development) or sequentially after each phase

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2 complete) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2 complete) - Integrates with US1 via calculationStore but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2 complete) - Integrates with US1 and US2 (uses calculationStore and historyStore) but independently testable

### Within Each User Story

**User Story 1 (P1)**:

- T029, T030 can run in parallel (different composables)
- T031 depends on T029, T030 (calculation store uses both composables)
- T032, T033, T034 can run in parallel (different components)
- T035 depends on T031, T032, T033, T034 (App.vue integrates all components)
- T036, T037 depend on T035 (enhancements to App.vue)

**User Story 2 (P2)**:

- T038 can start independently (storage composable)
- T039 depends on T038 (history store uses storage composable)
- T040, T041 can run in parallel (different components)
- T042 depends on T039 (integrates history store with App.vue)
- T043 depends on T040, T041, T042 (adds UI to App.vue)
- T044, T045 depend on T039, T040 (enhancements to existing code)

**User Story 3 (P3)**:

- T046, T047, T048, T049 can run in parallel (different components)
- T050 depends on T046, T047, T048, T049 (integrates all chart components)
- T051, T052, T053 depend on T050 (enhancements to dashboard section)

### Parallel Opportunities

- **Phase 1 Setup**: T002, T003-T005 (all dependency installs can run in parallel), T007-T009 (all config files can run in parallel), T011-T012 (deployment config files can run in parallel)
- **Phase 2 Foundational**: T016-T018 (all config files can run in parallel), T020, T022-T023 (independent utilities), T024-T026 (common components can run in parallel)
- **Phase 3 User Story 1**: T029-T030 (composables), T032-T034 (components)
- **Phase 4 User Story 2**: T040-T041 (components)
- **Phase 5 User Story 3**: T046-T049 (all chart components)
- **Phase 6 Polish**: T054-T055-T056 (independent enhancements), T058, T060, T063, T065 (independent configuration/cleanup tasks)

---

## Parallel Example: User Story 1

```bash
# Launch composables in parallel (different files):
Task T029: "Create src/composables/usePowerCalculator.js"
Task T030: "Create src/composables/useWaterCalculator.js"

# After composables complete, launch components in parallel:
Task T032: "Create src/components/calculator/CalculatorForm.vue"
Task T033: "Create src/components/calculator/AdvancedParams.vue"
Task T034: "Create src/components/calculator/ResultCard.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T014)
2. Complete Phase 2: Foundational (T015-T028) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T029-T037)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Enter electricity bill data
   - Select crop type and field area
   - Verify Q and V calculations display
   - Test advanced parameters
   - Verify validation errors work
   - Test offline behavior
5. Deploy to Netlify for demo

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - calculation only!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP + history tracking)
4. Add User Story 3 → Test independently → Deploy/Demo (Full featured with visualizations)
5. Add Polish → Final production release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T028)
2. **Once Foundational is done** (checkpoint after T028):
   - Developer A: User Story 1 (T029-T037) - Core calculation feature
   - Developer B: User Story 2 (T038-T045) - History persistence
   - Developer C: User Story 3 (T046-T053) - Data visualization
3. Stories complete independently, then integrate
4. Team completes Polish together (T054-T066)

---

## Task Summary

**Total Tasks**: 100

**Breakdown by Phase**:

- Phase 1 (Setup): 14 tasks
- Phase 2 (Foundational): 14 tasks (CRITICAL - blocks all user stories)
- Phase 3 (User Story 1 - P1 MVP): 9 tasks
- Phase 4 (User Story 2 - P2): 8 tasks
- Phase 5 (User Story 3 - P3): 8 tasks
- Phase 6 (Polish): 13 tasks
- Phase 7 (Testing - Constitution Compliance): 34 tasks

**Breakdown by User Story**:

- User Story 1 (Calculate water usage): 9 tasks + 11 tests
- User Story 2 (Historical records): 8 tasks + 8 tests
- User Story 3 (Visualization): 8 tasks + 8 tests

**Breakdown by Test Type**:

- Unit Tests (Composables & Utils): 7 tasks (T067-T073)
- Unit Tests (Pinia Stores): 4 tasks (T074-T077)
- Component Tests: 11 tasks (T078-T088)
- Integration Tests: 3 tasks (T089-T091)
- End-to-End Tests: 7 tasks (T092-T098)
- Test Configuration & CI: 2 tasks (T099-T100)

**Parallel Opportunities Identified**: 54 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:

- US1: Enter form data → see calculation results
- US2: Save records → view in table → persist after refresh
- US3: View charts → interact with visualizations → see trends

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 7 (tests for P1) = 48 tasks
This delivers core value proposition with quality assurance: electricity-to-water estimation for Taiwanese farmers with comprehensive test coverage.

---

## Notes

- **[P]** tasks = different files, no dependencies within same phase
- **[Story]** label maps task to specific user story (US1, US2, US3) for traceability
- Each user story should be independently completable and testable
- **Tests are MANDATORY** per Constitution II - Phase 7 provides comprehensive coverage
- Stop at any checkpoint to validate story independently
- All Traditional Chinese UI text per FR-014, FR-017
- All validation messages in Traditional Chinese per spec
- Commit after each task or logical group
- Bundle size target: <500KB gzipped (currently estimated ~340KB)
- Performance targets: <2s initial load, <100ms calculation, <3s chart rendering
- Test coverage targets: 80% statements, 75% branches, 80% functions, 80% lines
