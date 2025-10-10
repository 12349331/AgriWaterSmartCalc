# Tasks: 電費計價日期選擇與歷史紀錄時間欄位

**Input**: Design documents from `/specs/003-/`
**Prerequisites**: plan.md (已完成), spec.md (已完成)

**Tests**: 本專案包含完整測試策略，採用 TDD 方式開發

**Organization**: 任務依 User Story 組織，每個 Story 可獨立實作與測試

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案，無相依性）
- **[Story]**: 屬於哪個 User Story（US1, US2, US3）
- 包含確切檔案路徑

## Path Conventions

- 專案結構: `src/`, `tests/` 位於專案根目錄
- 元件路徑: `src/components/`
- Store 路徑: `src/stores/`
- 工具函數: `src/utils/`, `src/composables/`
- 測試檔案: `tests/unit/`, `tests/component/`, `tests/e2e/`

---

## Phase 1: Setup (共享基礎設施)

**Purpose**: 專案初始化與基本結構設定

- [ ] T001 確認現有專案結構符合實作計畫要求
- [ ] T002 [P] 檢查並更新 package.json 依賴版本（Vue 3.5+, Pinia 2.2+, Vite 5.0+）
- [ ] T003 [P] 確認測試環境完整（Vitest, @vue/test-utils, Playwright）

---

## Phase 2: Foundational (阻擋性前置條件)

**Purpose**: 核心基礎建設，所有 User Story 開始前必須完成

**⚠️ CRITICAL**: 所有 User Story 工作必須等此階段完成後才能開始

- [ ] T004 [P] 創建日期判定工具函數 `src/utils/billing-seasons.js`
  - `determineBillingSeason(startDate, endDate)` - 基於計費期間判定季節（以天數較多者為準）
  - `checkCrossSeasonBoundary(startDate, endDate)` - 檢測是否橫跨季節邊界
  - `isBoundaryDate(date)` - 檢查是否為季節邊界日期

- [ ] T005 [P] 創建日期格式化工具函數 `src/utils/date-formatters.js`
  - `formatBillingPeriod(startDate, endDate)` - 格式化為 "YYYY/MM/DD - YYYY/MM/DD"
  - `formatCreatedTime(timestamp)` - 格式化為 "YYYY/MM/DD HH:mm"

- [ ] T006 [P] 創建日期驗證工具函數 `src/utils/date-validators.js`
  - `validateBillingPeriod(startDate, endDate)` - 驗證計費期間（順序、範圍、長度）
  - `isWithinRange(date, minDate, maxDate)` - 檢查日期範圍
  - `isFutureDate(date)` - 檢查是否為未來日期
  - `getPeriodLengthInDays(startDate, endDate)` - 計算期間天數

- [ ] T007 創建資料遷移工具函數 `src/utils/migrate-history.js`
  - `addBillingPeriodToLegacyRecords(records)` - 將舊紀錄遷移（新增計費期間欄位）
  - `migrateHistoryOnStartup()` - 應用啟動時執行遷移

- [ ] T007a [P] 創建時區處理工具函數 `src/utils/timezone.js`
  - `ensureTaiwanTimezone(date)` - 強制轉換日期為台灣時區 GMT+8
  - `getCurrentTimestampTW()` - 取得當前台灣時區時間戳記
  - 確保所有創建時間與日期儲存前經過時區轉換（FR-013）

- [ ] T008 [P] 單元測試 `tests/unit/utils/billing-seasons.test.js`
  - 測試夏月判定（7/1-7/31）
  - 測試非夏月判定（11/1-11/30）
  - 測試邊界日期（5/31, 6/1, 9/30, 10/1）
  - 測試橫跨季節（5/15-6/14，應判定為非夏月 17天 > 夏月 14天）
  - 測試天數相等情境（5/31-6/1，以結束日期判定）
  - 測試跨年度期間（12/15-1/15）

- [x] T009 [P] 單元測試 `tests/unit/utils/date-formatters.test.js`
  - 測試計費期間格式化
  - 測試創建時間格式化
  - 測試空值處理

- [x] T010 [P] 單元測試 `tests/unit/utils/date-validators.test.js`
  - 測試日期順序驗證（結束日期必須晚於開始日期）
  - 測試期間長度驗證（>70天警告）
  - 測試未來日期檢測
  - 測試日期範圍限制（2020-01-01 至 今天+1年）

- [x] T011 [P] 單元測試 `tests/unit/utils/migrate-history.test.js`
  - 測試舊紀錄遷移（無 billingPeriodStart/End）
  - 測試已遷移紀錄跳過
  - 測試空陣列處理
  - 測試大量紀錄遷移（100+ 筆）

- [x] T011a [P] 單元測試 `tests/unit/utils/timezone.test.js`
  - 測試台灣時區轉換正確性
  - 測試跨時區日期一致性（模擬不同時區環境）
  - 測試時間戳記生成使用 GMT+8

**Checkpoint**: ✅ 基礎工具函數與測試完成 - User Story 實作可以開始

---

## Phase 3: User Story 1 - 選擇電費計費期間自動判定計價季節 (Priority: P1) 🎯 MVP

**Goal**: 使用者能選擇計費期間（開始與結束日期），系統自動判定為夏月或非夏月計價，並在橫跨季節時顯示警告

**Independent Test**: 選擇 2024/07/01-2024/07/31 → 系統判定為「夏月」並套用夏月費率；選擇 2024/05/15-2024/06/14 → 判定為「非夏月」（17天 > 14天）並顯示橫跨警告

### Tests for User Story 1 (寫在實作之前)

- [ ] T012 [P] [US1] 元件測試 `tests/component/DateRangePicker.test.js`
  - 測試雙日期輸入渲染
  - 測試日期選擇觸發 emit
  - 測試結束日期早於開始日期錯誤
  - 測試期間 >70 天警告
  - 測試未來日期警告
  - 測試橫跨季節警告觸發
  - 測試日期範圍限制（2020-01-01 至 今天+1年）

- [ ] T013 [P] [US1] E2E 測試 `tests/e2e/user-story-p1-billing-period.spec.js`
  - 場景 1: 選擇夏月期間（7/1-7/31）→ 自動判定為「夏月」
  - 場景 2: 選擇非夏月期間（11/1-11/30）→ 自動判定為「非夏月」
  - 場景 3: 選擇橫跨期間（5/15-6/14）→ 判定為「非夏月」並顯示警告
  - 場景 4: 未完整選擇期間 → 阻止計算並顯示錯誤
  - 場景 5: 結束日期早於開始日期 → 阻止計算並顯示錯誤
  - 場景 6: 季節欄位顯示為唯讀

### Implementation for User Story 1

- [ ] T014 [P] [US1] 創建 DateRangePicker 元件 `src/components/calculator/DateRangePicker.vue`
  - Props: `startDate`, `endDate`, `minDate`, `maxDate`, `disabled`
  - Emits: `update:startDate`, `update:endDate`, `season-changed`, `cross-season-warning`, `validation-error`
  - 雙 HTML5 date input（開始與結束日期）
  - 整合驗證邏輯（T006 的函數）
  - 顯示錯誤與警告訊息
  - 響應式佈局（小螢幕垂直堆疊）
  - Tailwind CSS 樣式

- [ ] T015 [P] [US1] 創建日期相關 Composable `src/composables/useBillingPeriod.js`
  - 封裝計費期間驗證邏輯
  - 封裝季節判定與橫跨檢測
  - 提供 reactive state 與 computed properties
  - 返回: `validatePeriod()`, `determineSeason()`, `checkCrossSeason()`

- [ ] T016 [US1] 擴充 Calculation Store `src/stores/calculation.js`
  - 新增 state: `billingPeriodStart` (ref, null)
  - 新增 state: `billingPeriodEnd` (ref, null)
  - 修改 computed: `billingSeason` - 基於計費期間自動判定
  - 新增 computed: `crossesSeasonBoundary` - 檢測橫跨
  - 修改 `setFormData` 方法支援計費期間
  - 修改 `reset` 方法重置計費期間

- [ ] T017 [US1] 修改 CalculatorForm 元件 `src/components/calculator/CalculatorForm.vue`
  - 在表單最上方新增 DateRangePicker 元件
  - 綁定 v-model:start-date 與 v-model:end-date 到 store
  - 監聽 `cross-season-warning` 顯示黃色警告訊息
  - 監聽 `validation-error` 顯示錯誤訊息
  - 修改季節欄位為唯讀顯示（移除 radio buttons，改為唯讀文字）
  - 新增表單驗證: 計費期間必填
  - 更新「計算」按鈕 disabled 邏輯（包含期間驗證）

- [ ] T018 [US1] 更新 i18n 訊息 `src/i18n/zh-TW.js`
  - 新增計費期間相關文字
  - 新增驗證錯誤訊息
  - 新增橫跨季節警告文字

- [ ] T019 [P] [US1] Store 單元測試 `tests/unit/stores/calculation-extended.test.js`
  - 測試 billingPeriodStart/End 狀態變更
  - 測試 billingSeason 自動判定（夏月、非夏月、橫跨）
  - 測試 crossesSeasonBoundary computed
  - 測試 setFormData 包含計費期間
  - 測試 reset 重置計費期間

- [ ] T020 [P] [US1] Composable 單元測試 `tests/unit/composables/useBillingPeriod.test.js`
  - 測試驗證邏輯整合
  - 測試季節判定整合
  - 測試 reactive state 更新

- [ ] T021 [US1] CalculatorForm 元件測試 `tests/component/CalculatorForm-extended.test.js`
  - 測試 DateRangePicker 渲染與整合
  - 測試選擇期間後季節自動更新
  - 測試橫跨警告顯示
  - 測試驗證錯誤顯示與計算阻止
  - 測試季節欄位唯讀狀態

**Checkpoint**: ✅ User Story 1 完成 - 使用者可選擇計費期間並自動判定季節

---

## Phase 4: User Story 2 - 歷史紀錄顯示計費期間與創建時間 (Priority: P2)

**Goal**: 歷史紀錄表格顯示「計費期間」與「創建時間」兩個欄位，支援雙欄位獨立排序，匯出包含完整時間資訊

**Independent Test**: 創建紀錄後，歷史表格顯示「計費期間: 2024/07/01 - 2024/07/31」與「創建時間: 2024/10/09 14:30」；點擊欄位標題可切換排序

### Tests for User Story 2

- [ ] T022 [P] [US2] E2E 測試 `tests/e2e/user-story-p2-dual-timestamps.spec.js`
  - 場景 1: 儲存紀錄後顯示計費期間與創建時間
  - 場景 2: 預設依創建時間降冪排序
  - 場景 3: 點擊「計費期間」標題排序
  - 場景 4: 點擊「創建時間」標題排序
  - 場景 5: 匯出 CSV 包含三個時間欄位

### Implementation for User Story 2

- [ ] T023 [US2] 修改 main.js 執行資料遷移 `src/main.js`
  - 在 app 初始化前執行 `migrateHistoryOnStartup()`
  - 新增錯誤處理與日誌

- [ ] T024 [US2] 擴充 History Store `src/stores/history.js`
  - 修改 `addRecord` 方法: 包含 billingPeriodStart 與 billingPeriodEnd
  - 整合時區處理: 創建時間使用 `getCurrentTimestampTW()` 確保 GMT+8（FR-013）
  - 新增 computed: `sortedByBillingPeriod` - 依起始日期排序
  - 修改現有 `sortedRecords` computed 支援雙欄位排序
  - 修改 `exportToCSV` 方法: 包含三個時間欄位（計費期間起、計費期間迄、創建時間）
  - 修改 `exportToJSON` 方法: 包含 ISO 8601 格式時間

- [ ] T025 [P] [US2] 創建 SortableTableHeader 元件 `src/components/common/SortableTableHeader.vue`
  - Props: `label`, `sortKey`, `currentSort`, `currentDirection`
  - Emits: `sort(key, direction)`
  - 顯示排序圖示（上/下箭頭）
  - 點擊切換排序方向
  - 可重用於其他表格

- [ ] T026 [US2] 修改 HistoryTable 元件 `src/components/history/HistoryTable.vue`
  - 新增「計費期間」欄位（使用 formatBillingPeriod 格式化）
  - 保持「創建時間」欄位（使用 formatCreatedTime 格式化）
  - 整合 SortableTableHeader 元件
  - 新增排序狀態管理（currentSortKey, sortDirection）
  - 實作雙欄位獨立排序邏輯
  - 預設排序: 創建時間降冪
  - 更新響應式樣式（小螢幕優化）

- [ ] T027 [P] [US2] Store 單元測試 `tests/unit/stores/history-extended.test.js`
  - 測試 addRecord 包含計費期間
  - 測試 sortedByBillingPeriod computed
  - 測試雙欄位排序切換
  - 測試 exportToCSV 包含三個時間欄位
  - 測試 exportToJSON 格式正確

- [ ] T028 [P] [US2] SortableTableHeader 元件測試 `tests/component/SortableTableHeader.test.js`
  - 測試排序圖示顯示
  - 測試點擊觸發 sort emit
  - 測試排序方向切換

- [ ] T029 [US2] HistoryTable 元件測試 `tests/component/HistoryTable-extended.test.js`
  - 測試計費期間欄位顯示
  - 測試創建時間欄位顯示
  - 測試預設排序（創建時間降冪）
  - 測試排序切換（計費期間/創建時間）
  - 測試格式化函數調用

- [ ] T030 [US2] 整合測試: 資料遷移與顯示
  - 測試舊紀錄載入後自動遷移
  - 測試遷移後紀錄顯示正常
  - 測試新舊紀錄混合排序

**Checkpoint**: ✅ User Story 2 完成 - 歷史紀錄顯示完整時間資訊並支援排序

---

## Phase 5: User Story 3 - 依計費期間篩選與分析歷史紀錄 (Priority: P3)

**Goal**: 使用者能依計費期間起始日期篩選歷史紀錄，並即時查看篩選結果的統計摘要

**Independent Test**: 建立多筆不同月份紀錄，使用日期範圍篩選（2024/06/01-2024/09/30），系統僅顯示夏月紀錄並更新統計摘要

### Tests for User Story 3

- [ ] T031 [P] [US3] E2E 測試 `tests/e2e/user-story-p3-date-filter.spec.js`
  - 場景 1: 日期範圍篩選顯示正確紀錄
  - 場景 2: 統計摘要即時更新
  - 場景 3: 跨年度篩選
  - 場景 4: 清除篩選恢復全部紀錄

### Implementation for User Story 3

- [ ] T032 [P] [US3] 創建 DateRangeFilter 元件 `src/components/history/DateRangeFilter.vue`
  - Props: `startDate`, `endDate`
  - Emits: `update:startDate`, `update:endDate`, `apply`, `clear`
  - 雙 date input（篩選開始與結束）
  - 「套用」與「清除篩選」按鈕
  - 顯示當前篩選狀態
  - Tailwind CSS 樣式

- [ ] T033 [P] [US3] 創建 StatsSummary 元件 `src/components/history/StatsSummary.vue`
  - Props: `records`, `showAlways`
  - 顯示紀錄筆數、平均用水量、總用電度數
  - 卡片式設計，網格佈局
  - 數字格式化（千分位逗號）
  - 響應式佈局

- [ ] T034 [P] [US3] 創建日期篩選 Composable `src/composables/useDateRangeFilter.js`
  - 封裝日期範圍篩選邏輯
  - 提供 reactive state: filterStartDate, filterEndDate
  - 提供 computed: filteredRecords
  - 提供方法: applyFilter(), clearFilter()

- [ ] T035 [US3] 擴充 History Store `src/stores/history.js`
  - 新增 computed: `filterByDateRange(startDate, endDate)` - 依計費期間起始日期篩選
  - 新增 computed: `statsSummary(filteredRecords)` - 計算統計摘要
    - 紀錄筆數
    - 平均用水量（monthlyVolume 平均）
    - 總用電度數（calculatedKwh 總和）

- [ ] T036 [US3] 修改 HistoryTable 元件 `src/components/history/HistoryTable.vue`
  - 整合 DateRangeFilter 元件
  - 整合 StatsSummary 元件（永遠顯示）
  - 連接篩選邏輯到表格顯示
  - 統計摘要自動更新（基於當前可見紀錄）

- [ ] T037 [P] [US3] DateRangeFilter 元件測試 `tests/component/DateRangeFilter.test.js`
  - 測試日期輸入
  - 測試「套用」觸發 emit
  - 測試「清除」觸發 emit
  - 測試篩選狀態顯示

- [ ] T038 [P] [US3] StatsSummary 元件測試 `tests/component/StatsSummary.test.js`
  - 測試統計數字計算
  - 測試數字格式化
  - 測試空紀錄處理
  - 測試響應式佈局

- [ ] T039 [P] [US3] Composable 單元測試 `tests/unit/composables/useDateRangeFilter.test.js`
  - 測試篩選邏輯
  - 測試 reactive state 更新
  - 測試清除篩選

- [ ] T040 [P] [US3] Store 單元測試（擴充） `tests/unit/stores/history-extended.test.js`
  - 測試 filterByDateRange computed
  - 測試 statsSummary computed
  - 測試跨年度篩選
  - 測試空結果處理

- [ ] T041 [US3] HistoryTable 整合測試（擴充）
  - 測試 DateRangeFilter 與表格整合
  - 測試 StatsSummary 與表格整合
  - 測試篩選後統計更新
  - 測試清除篩選恢復

**Checkpoint**: ✅ User Story 3 完成 - 使用者可篩選與分析歷史紀錄

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨 User Story 的改進與優化

- [ ] T042 [P] 新增 Loading 狀態處理
  - HistoryTable 資料載入中顯示 LoadingSpinner
  - 資料遷移中顯示進度提示

- [ ] T043 [P] 新增 Empty State 處理
  - 無歷史紀錄時顯示友善提示
  - 篩選無結果時顯示提示

- [ ] T044 [P] 無障礙優化（A11y）
  - DateRangePicker 鍵盤導航
  - 表格排序 aria-label
  - 篩選器 screen reader 支援

- [ ] T045 [P] 效能優化
  - HistoryTable 虛擬滾動（若紀錄 >200 筆）
  - 日期範圍篩選 debounce (300ms)
  - 統計摘要計算 memo

- [ ] T046 [P] 錯誤處理增強
  - 資料遷移失敗降級策略
  - LocalStorage quota 檢測
  - 邊界條件錯誤訊息

- [ ] T047 [P] 文件更新
  - 更新 README.md（新功能說明）
  - 新增使用者指南（計費期間選擇、橫跨處理）
  - 更新開發者文件（資料遷移流程）

- [ ] T048 程式碼品質檢查
  - ESLint 檢查全部新檔案
  - 移除 console.log
  - 程式碼格式化（Prettier）

- [ ] T049 [P] 效能基準測試 `tests/benchmarks/performance.bench.js`
  - 使用 Vitest bench 功能建立效能基準測試檔案
  - **測試項目與目標**：
    - 季節判定函數（`determineBillingSeason`）：<100ms（目標 <1ms）
    - 100 筆紀錄排序（`Array.sort`）：<50ms（目標 <10ms）
    - 500 筆紀錄排序：<200ms（驗證大量資料效能）
    - 100 筆紀錄日期篩選（`Array.filter`）：<100ms（目標 <5ms）
    - 500 筆紀錄日期篩選：<300ms（驗證大量資料效能）
    - 統計摘要計算（`reduce` 聚合）：<50ms（目標 <8ms）
  - 記錄基準值到 `docs/performance-baseline.md`，用於未來回歸測試
  - 設定 CI/CD 效能閾值警報（若超過目標 2 倍則警告）

- [ ] T050 最終整合測試
  - 完整使用者流程測試（P1→P2→P3）
  - 跨瀏覽器測試（Chrome, Firefox, Safari）
  - 行動裝置響應式測試

- [ ] T050a 憲法遵循審查（Constitution Compliance Review）
  - **程式碼品質 (Code Quality First)**:
    - ✅ 驗證所有新增函數使用純函數模式
    - ✅ 確認 composables 封裝完整
    - ✅ 檢查 JSDoc 型別定義完整性
  - **測試標準 (Testing Standards)**:
    - ✅ 確認測試覆蓋率 >90%（單元 + 元件 + e2e）
    - ✅ 驗證所有 edge cases 有對應測試
    - ✅ 確認 CI/CD 測試全部通過
  - **UX 一致性 (UX Consistency)**:
    - ✅ 驗證 WCAG 2.1 AA 遵循（axe-core 稽核）
    - ✅ 確認鍵盤導航完整（Tab, Enter, Esc）
    - ✅ 檢查響應式設計（mobile/tablet/desktop）
  - **效能要求 (Performance Requirements)**:
    - ✅ 確認所有效能目標達成（季節判定 <100ms, 排序 <50ms, 篩選 <100ms）
    - ✅ 驗證 bundle size 增量 <20KB
    - ✅ 記錄任何未達標項目並提供補救計畫

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無相依 - 可立即開始
- **Foundational (Phase 2)**: 依賴 Setup 完成 - **阻擋所有 User Stories**
- **User Stories (Phase 3-5)**: 全部依賴 Foundational 完成
  - User Story 1 (P1): Foundational 完成後可開始 - **獨立**
  - User Story 2 (P2): Foundational 完成後可開始 - **依賴 US1 的計費期間功能**
  - User Story 3 (P3): Foundational 完成後可開始 - **依賴 US1 & US2**
- **Polish (Phase 6)**: 依賴所有 User Stories 完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 後可開始 - 無其他 Story 相依
- **User Story 2 (P2)**: 需要 US1 的計費期間欄位 - **建議 US1 完成後再開始**
- **User Story 3 (P3)**: 需要 US2 的歷史紀錄顯示 - **建議 US1 & US2 完成後再開始**

### Within Each User Story

- 測試必須先寫且失敗，再實作
- 工具函數 → Composables → Store 擴充 → 元件
- 核心實作 → 整合 → 測試驗證
- Story 完成後才移至下一個優先級

### Parallel Opportunities

- **Phase 1**: 所有 Setup 任務可平行（T001-T003）
- **Phase 2**:
  - T004-T007（工具函數）可平行
  - T008-T011（單元測試）可平行，但需等對應工具函數完成
- **Phase 3 (US1)**:
  - T012-T013（測試）可平行
  - T014-T015（元件與 composable）可平行
  - T019-T020（單元測試）可平行
- **Phase 4 (US2)**:
  - T025（SortableTableHeader）與其他任務無相依
  - T027-T028（測試）可平行
- **Phase 5 (US3)**:
  - T032-T034（元件與 composable）可平行
  - T037-T040（測試）可平行
- **Phase 6**:
  - T042-T047（Polish 任務）可平行

---

## Parallel Example: User Story 1

```bash
# 1. 先寫測試（平行）
Task T012: DateRangePicker 元件測試
Task T013: E2E 測試 P1

# 2. 實作元件與邏輯（部分平行）
Task T014: DateRangePicker 元件
Task T015: useBillingPeriod composable
# 等 T014, T015 完成後
Task T016: 擴充 Calculation Store
Task T017: 修改 CalculatorForm

# 3. 補充測試（平行）
Task T019: Store 單元測試
Task T020: Composable 單元測試
Task T021: CalculatorForm 元件測試
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（**關鍵阻擋點**）
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 獨立測試 US1
5. 部署/展示（若就緒）

**驗證清單 US1**:

- ✅ 可選擇計費期間（開始與結束日期）
- ✅ 系統自動判定為「夏月」或「非夏月」
- ✅ 橫跨季節時顯示黃色警告
- ✅ 驗證錯誤正確阻止計算
- ✅ 季節欄位為唯讀顯示

### Incremental Delivery

1. Setup + Foundational → 基礎就緒
2. 新增 User Story 1 → 獨立測試 → 部署/展示（MVP!）
3. 新增 User Story 2 → 獨立測試 → 部署/展示
4. 新增 User Story 3 → 獨立測試 → 部署/展示
5. 每個 Story 增加價值且不破壞前面功能

### Parallel Team Strategy

多位開發者協作:

1. 團隊一起完成 Setup + Foundational
2. Foundational 完成後:
   - 開發者 A: User Story 1（核心功能）
   - 開發者 B: 準備 User Story 2 的測試
   - 開發者 C: 文件與設計審查
3. US1 完成後:
   - 開發者 A: User Story 2
   - 開發者 B: User Story 3（若 US2 相依度低）
   - 開發者 C: Polish & 優化

---

## Notes

- [P] 任務 = 不同檔案，無相依性
- [Story] 標籤對應到特定 User Story 便於追蹤
- 每個 User Story 應獨立完成與測試
- 先確認測試失敗再實作
- 每個任務或邏輯群組後 commit
- 在任何 checkpoint 停下來驗證 Story 獨立性
- 避免: 模糊任務、相同檔案衝突、破壞獨立性的跨 Story 相依

## Task Summary

- **Total Tasks**: 53
- **Setup**: 3 tasks
- **Foundational**: 10 tasks（工具函數 + 測試，含時區處理）
- **User Story 1 (P1)**: 10 tasks（核心功能）
- **User Story 2 (P2)**: 9 tasks（歷史紀錄顯示）
- **User Story 3 (P3)**: 11 tasks（篩選與分析）
- **Polish**: 10 tasks（跨功能優化 + 憲法遵循審查）

## Suggested MVP Scope

**僅實作 User Story 1 (P1)**:

- Setup (T001-T003)
- Foundational (T004-T011)
- User Story 1 (T012-T021)
- 基礎 Polish (T048, T050)

**估計時間**: 5-7 天
**價值**: 核心功能可用，使用者能正確選擇計費期間並自動判定季節
