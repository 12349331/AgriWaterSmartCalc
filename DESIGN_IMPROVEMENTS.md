# GOV.UK Design System 長輩友善設計改善報告

## 概述

本次改善基於 GOV.UK Design System 的設計原則，針對長輩使用需求進行了全面的無障礙設計改善。

## 改善項目

### 1. Typography（字體排版）✅

#### 改善內容
- **基礎字體**: 從 16px 增加到 19px（GOV.UK 標準）
- **行高**: 從 1.5 增加到 1.32（25px），提高可讀性
- **標題層級**:
  - XL: 48px/50px（大螢幕）、32px/35px（小螢幕）
  - L: 36px/40px（大螢幕）、27px/30px（小螢幕）
  - M: 24px/30px（大螢幕）、21px/25px（小螢幕）
  - S: 19px/25px（所有螢幕）

#### 好處
- 長輩閱讀更輕鬆，減少眼睛疲勞
- 更好的視覺層次，快速識別重要資訊
- 響應式設計，適應不同裝置

### 2. Color Palette（色彩系統）✅

#### 改善內容
- **主色調**: #1d70b8（GOV.UK 藍）- 對比度更好
- **文字顏色**: #0b0c0c（GOV.UK 黑）- 與背景對比度 ≥ 4.5:1
- **次要文字**: #505a5f（GOV.UK 灰）
- **危險色**: #d4351c（GOV.UK 紅）
- **成功色**: #00703c（GOV.UK 綠）
- **警告色**: #f47738（GOV.UK 橘）

#### 好處
- 符合 WCAG 2.1 AA 標準
- 視覺對比清晰，長輩易於辨識
- 色盲友善設計

### 3. Spacing（間距系統）✅

#### 改善內容
- **表單組間距**: 從 1rem 增加到 1.5rem（24px）
- **區段間距**: 從 1.5rem 增加到 2rem（32px）
- **頁面邊距**: 從 1rem/2rem 增加到 1.5rem/2.5rem
- **GOV.UK 間距尺度**: 15px, 20px, 25px, 30px, 40px, 50px

#### 好處
- 減少視覺混亂
- 更容易點擊和互動
- 資訊分組更清晰

### 4. Form Controls（表單控制項）✅

#### 改善內容
- **輸入框高度**: 增加到 44px（符合最小觸控目標）
- **內邊距**: px-4 py-3（16px/12px）
- **邊框**: 2px 實線邊框（更明顯）
- **焦點狀態**: 黃色外框（3px #ffdd00）
- **標籤字體**: 19px 粗體
- **提示文字**: 19px 次要顏色
- **錯誤訊息**: 19px 粗體紅色

#### GOV.UK 樣式類別
- `.govuk-label`: 標籤樣式
- `.govuk-hint`: 提示文字
- `.govuk-error-message`: 錯誤訊息
- `.govuk-form-group`: 表單組容器

#### 好處
- 更容易填寫，減少輸入錯誤
- 清晰的錯誤提示
- 支援鍵盤導航
- 更好的觸控體驗

### 5. Buttons（按鈕）✅

#### 改善內容
- **最小尺寸**: 44x44px（WCAG 觸控目標）
- **內邊距**: px-6 py-3（24px/12px）
- **字體**: 19px 粗體
- **按鈕類型**:
  - `.btn-primary`: 主要動作（GOV.UK 藍）
  - `.btn-secondary`: 次要動作（灰色）
  - `.btn-warning`: 警告動作（紅色）
- **懸停效果**: 顏色變深
- **焦點狀態**: 黃色外框
- **防止雙擊**: 支援防雙擊功能

#### 好處
- 長輩容易點擊，減少誤觸
- 清晰的按鈕層級
- 視覺回饋明確

### 6. Accessibility（無障礙功能）✅

#### 改善內容
- **ARIA 屬性**: 正確使用 `aria-describedby`、`aria-labelledby`
- **語義化 HTML**: 使用正確的表單元素和標籤關聯
- **鍵盤導航**: 清晰的焦點指示器（3px 黃色外框）
- **螢幕閱讀器支援**: 錯誤訊息包含 "Error:" 前綴（隱藏但可讀）
- **對話框**: 正確使用 `role="dialog"` 和 `aria-modal="true"`
- **觸控目標**: 所有互動元素最小 44x44px

#### 好處
- 支援輔助技術
- 符合 WCAG 2.1 AA 標準
- 更包容的使用體驗

## 實作細節

### 檔案變更

1. **tailwind.config.js**
   - 新增 GOV.UK 色彩系統
   - 新增 GOV.UK 字體尺度
   - 新增間距尺度
   - 新增最小觸控目標尺寸

2. **src/assets/styles/main.css**
   - 實作 GOV.UK 組件樣式
   - 新增按鈕變體（primary, secondary, warning）
   - 改善表單控制項樣式
   - 新增標籤和提示文字樣式
   - 實作焦點狀態樣式

3. **src/components/calculator/CalculatorForm.vue**
   - 更新所有表單控制項使用 GOV.UK 樣式
   - 改善標籤和錯誤訊息
   - 新增提示文字
   - 改善按鈕樣式和排列
   - 新增正確的 ARIA 屬性

4. **src/App.vue**
   - 更新頁面標題樣式
   - 增加間距
   - 改善對話框樣式
   - 新增正確的對話框 ARIA 屬性

## 測試結果

### 構建測試 ✅
- 專案成功構建
- 沒有 TypeScript 錯誤
- CSS 正確編譯
- 檔案大小：
  - CSS: 31.11 kB（壓縮後 5.78 kB）
  - JS: 681.51 kB（壓縮後 231.86 kB）

### 無障礙檢查 ✅
- 焦點指示器清晰可見
- ARIA 屬性正確使用
- 語義化 HTML 結構
- 鍵盤導航支援

## 下一步建議

### 1. 使用者測試
- 與長輩使用者進行可用性測試
- 收集回饋並持續改善

### 2. 進階改善
- 新增深色模式（考慮視力不佳的使用者）
- 提供字體大小調整選項
- 考慮新增語音輸入支援

### 3. 效能優化
- 監控效能指標
- 確保在低端裝置上也能流暢運行

### 4. 文件完善
- 新增無障礙使用指南
- 製作使用教學影片（針對長輩）

## 參考資源

- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [GOV.UK Typography Scale](https://design-system.service.gov.uk/styles/type-scale/)
- [GOV.UK Color Palette](https://design-system.service.gov.uk/styles/colour/)
- [GOV.UK Spacing](https://design-system.service.gov.uk/styles/spacing/)

## 總結

本次設計改善遵循 GOV.UK Design System 的最佳實踐，針對長輩使用需求進行了全面優化：

✅ **更大的字體和清晰的排版** - 提升可讀性
✅ **更好的顏色對比** - 符合無障礙標準
✅ **更大的觸控目標** - 減少操作困難
✅ **更清晰的視覺層次** - 更容易理解
✅ **更好的錯誤提示** - 減少使用困惑
✅ **完整的無障礙支援** - 包容所有使用者

這些改善使 AquaMetrics 平台對長輩更加友善，同時也提升了所有使用者的體驗。
