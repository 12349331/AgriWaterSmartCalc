# 安全

**Generated At:** 10/27/2025, 10:16:38 PM
**風險等級:** 高

## 評估摘要

此應用程式是一個農業用水量估算平台，主要在使用者瀏覽器端運作。它處理農業相關的計算數據，並將歷史記錄儲存在使用者的本機儲存空間。整體而言，應用程式的架構是客戶端導向，沒有發現直接的伺服器端安全漏洞，例如未經授權的後端存取點或資料庫操作問題。然而，由於資料儲存於客戶端，且存在使用者輸入內容可能未經充分淨化即顯示或匯出的情況，因此仍存在一些重要的安全考量。

## 發現的安全問題 (3)

### 1. 任何人都可以讀取或修改儲存在您電腦上的農業計算資料

- **類別:** Data Protection
- **嚴重性:** 中
- **檔案:** src/App.vue, src/components/calculator/CalculatorForm.vue
- **行數:** 190-191 (App.vue), 400-401 (CalculatorForm.vue)

**由 Zeabur Agent 深入分析您的 GitHub 專案，在潛在風險成為問題前，主動發掘並提供修復建議。:** 這個應用程式將您所有的計算歷史記錄和未完成的表單內容，都儲存在您瀏覽器的本機儲存空間（就像是您電腦裡的一個小抽屜）。這包括了您的電費金額、作物類型、耕作面積、抽水馬力、用水量等農業相關的敏感數據。這意味著，如果您的電腦被惡意軟體入侵，或者您與他人共用電腦，其他程式或使用者可能會未經您的同意，就能讀取、修改甚至刪除這些資料。這就像是您把重要的農業生產記錄放在家裡的抽屜裡，但抽屜沒有上鎖，任何人都可以隨意翻閱或更改。

**建議修復:** 對於儲存在本機的敏感資料，請考慮使用瀏覽器提供的加密儲存機制（例如 Web Cryptography API 搭配 IndexedDB），或者至少對資料進行加密處理後再儲存 (WHAT TO DO)。這可以確保即使資料被未經授權的人存取，他們也無法直接讀取內容，增加了資料的安全性 (WHY IT PROTECTS)。如果沒有這樣做，您的農業生產數據可能會被未經授權的人輕易地看到或修改，導致隱私洩露或數據不準確 (WHAT HAPPENS WITHOUT IT)。

**Why this matters:** 這能保護您的農業數據隱私，防止重要資訊被未經授權的存取。

### 2. 任何人都可以透過輸入惡意文字來竄改顯示內容或執行不該執行的程式碼

- **類別:** Input Validation & Sanitization
- **嚴重性:** 高
- **檔案:** src/components/history/RecordCard.vue, src/components/history/HistoryTable.vue, src/components/report/*.vue, src/composables/usePDFExport.js
- **行數:** 100-105 (RecordCard.vue), 116-121 (RecordCard.vue), 180-185 (RecordCard.vue)

**由 Zeabur Agent 深入分析您的 GitHub 專案，在潛在風險成為問題前，主動發掘並提供修復建議。:** 在「歷史記錄」的「編輯紀錄」功能中，您可以修改作物類型、地區和備註等文字欄位。如果應用程式沒有徹底檢查這些輸入的文字，惡意人士可能會在這些欄位中輸入特殊的程式碼（例如 JavaScript 程式碼）。當這些惡意程式碼被顯示在應用程式的其他地方（例如歷史記錄表格、結果卡片或匯出的 PDF 報告）時，它可能會被瀏覽器誤認為是應用程式的一部分而執行。這可能導致您的個人資料被竊取、網頁內容被竄改，甚至在您不知情的情況下執行其他惡意操作。這就像是您在填寫一份重要文件時，有人在您的名字欄位偷偷寫了一段指令，結果這段指令在文件被展示時，讓文件自己做了不該做的事情。

**建議修復:** 在儲存或顯示任何使用者輸入的文字之前，請務必對其進行嚴格的淨化處理 (WHAT TO DO)。這表示要移除或轉換所有可能被解釋為程式碼的特殊符號，確保它們只能被當作純文字顯示。這能防止惡意程式碼被執行，保護您的應用程式和資料安全 (WHY IT PROTECTS)。如果沒有這樣做，惡意人士可能會利用這個漏洞，在您的應用程式中注入惡意程式碼，導致資料被竊取、網頁內容被竄改，甚至在您不知情的情況下執行其他惡意操作 (WHAT HAPPENS WITHOUT IT)。

**Why this matters:** 這能防止惡意人士透過輸入惡意文字來控制您的應用程式，保護您的資料和使用體驗安全。

### 3. 應用程式在發生錯誤時會顯示過於詳細的技術訊息

- **類別:** Data Protection
- **嚴重性:** 低
- **檔案:** src/components/common/ErrorBoundary.vue
- **行數:** 30-32

**由 Zeabur Agent 深入分析您的 GitHub 專案，在潛在風險成為問題前，主動發掘並提供修復建議。:** 當應用程式遇到無法處理的錯誤時，它會顯示一個錯誤頁面，其中包含了詳細的錯誤訊息，甚至包括程式碼的執行路徑（堆疊追蹤）。雖然這對於開發人員來說很有用，但在一般使用者面前顯示這些技術細節，可能會讓有心人士更容易理解應用程式的內部結構和運作方式。這就像是您家裡的電器壞了，維修人員直接把電器的電路圖和所有零件的詳細說明都貼在電器外面，雖然對維修人員有用，但對一般人來說，這可能會讓小偷更容易找到電器的弱點。

**建議修復:** 在正式發布的應用程式中，請避免向使用者顯示詳細的技術錯誤訊息和程式碼執行路徑 (WHAT TO DO)。您可以將這些詳細訊息記錄在後台日誌中供開發人員分析，而向使用者顯示一個友善且簡潔的錯誤提示，例如「應用程式發生錯誤，請稍後再試」 (WHY IT PROTECTS)。這樣可以避免洩露應用程式的內部結構，降低有心人士利用這些資訊來尋找其他漏洞的風險 (WHAT HAPPENS WITHOUT IT)。

**Why this matters:** 這能保護應用程式的內部細節不被惡意人士利用，增加應用程式的整體安全性。

## 一般建議

1. 定期更新所有使用的第三方函式庫和框架，以修補已知的安全漏洞。這就像是定期更新您家裡的門鎖，確保它們能抵禦最新的入侵方法。
2. 考慮在應用程式中加入使用者身分驗證功能，即使是客戶端應用程式，也可以透過簡單的密碼或 PIN 碼來保護敏感資料，防止未經授權的存取。這就像是為您的個人筆記本加上一個密碼鎖。
3. 實施內容安全政策（Content Security Policy, CSP），這是一種瀏覽器安全功能，可以限制網頁上可以載入的資源，有效降低跨站腳本攻擊（XSS）的風險。這就像是為您的應用程式設定一個安全檢查站，只允許信任的內容進入。
4. 對所有使用者輸入的資料進行嚴格的型別檢查和範圍驗證，確保資料符合預期格式和數值範圍，即使在客戶端應用程式中，這也能提高資料的完整性和可靠性。這就像是確保所有進入您倉庫的貨物都符合尺寸和重量標準。

## 分析資訊

**分析檔案數量:** 41
**分析檔案:**
- src/App.vue
- src/components/calculator/AdvancedParams.vue
- src/components/calculator/CalculatorForm.vue
- src/components/calculator/DateRangePicker.vue
- src/components/calculator/ResultCard.vue
- src/components/charts/AnnualTrendChart.vue
- src/components/charts/CropComparisonChart.vue
- src/components/charts/SeasonalChart.vue
- src/components/common/DateRangeFilter.vue
- src/components/common/ErrorBoundary.vue
- src/components/common/ErrorMessage.vue
- src/components/common/LoadingSpinner.vue
- src/components/common/OfflineNotice.vue
- src/components/common/SortableTableHeader.vue
- src/components/common/StatsSummary.vue
- src/components/dashboard/DashboardStats.vue
- src/components/dashboard/DashboardTabs.vue
- src/components/history/HistoryTable.vue
- src/components/history/RecordCard.vue
- src/components/report/PDFTemplate.vue
- src/components/report/ReportCharts.vue
- src/components/report/ReportHeader.vue
- src/components/report/ReportInsights.vue
- src/components/report/ReportParameters.vue
- src/components/report/ReportStats.vue
- src/composables/useBillingDate.js
- src/composables/useBillingPeriod.js
- src/composables/useDateRangeFilter.js
- src/composables/useNumericInput.js
- src/composables/usePDFExport.js
- src/composables/usePerformance.js
- src/composables/usePowerCalculator.js
- src/composables/usePricingVersion.js
- src/composables/useValidation.js
- src/composables/useWaterCalculator.js
- src/config/constants.js
- src/config/crops.js
- src/config/echarts.js
- src/config/pricingTypes.js
- src/config/regions.js
- src/config/taipower-api-mapping.js

**原始產生時間:** 10/27/2025, 10:12:58 PM
