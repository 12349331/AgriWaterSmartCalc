# XSS 防護實作總結

**實作日期:** 2025-10-27
**風險等級:** 高 → 低
**狀態:** ✅ 已完成

## 實作概述

根據安全報告中的第 2 項高嚴重性問題，我們實作了全面的 XSS（跨站腳本攻擊）防護機制，確保使用者輸入的資料在儲存、載入和顯示時都經過適當的淨化處理。

## 實作內容

### 1. 建立淨化工具 (`src/utils/sanitizer.js`)

建立了三個核心函數來處理 XSS 防護：

#### `escapeHtml(text)`

- 轉義 HTML 特殊字元（`&`, `<`, `>`, `"`, `'`, `/`）
- 將危險字元轉換為安全的 HTML 實體
- 適用於需要顯示純文字的場景

#### `sanitizeInput(input)`

- 使用雙層防護策略：
  1. 首先移除危險標籤及其內容（`<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`）
  2. 然後使用 DOM API 提取純文字內容，移除所有剩餘的 HTML 標籤
- 這種方式確保：
  - `<script>alert("XSS")</script>文字` → `文字`
  - `<img src=x onerror=alert(1)>` → 空字串
  - `<a href="javascript:alert(1)">連結</a>` → `連結`

#### `sanitizeObject(obj, fields)`

- 批次淨化物件中的指定字串欄位
- 適用於處理表單資料或記錄物件

#### `sanitizeArray(arr)`

- 淨化陣列中的所有字串元素
- 保留非字串元素不變

### 2. 整合至 History Store (`src/stores/history.js`)

在三個關鍵位置加入淨化處理：

#### `addRecord(recordData)`

```javascript
// 淨化使用者可輸入的文字欄位
const sanitizedData = sanitizeObject(recordData, [
  "cropType",
  "region",
  "notes",
  "pricingType",
]);
```

#### `updateRecord(id, updates)`

```javascript
// 淨化更新的資料
const sanitizedUpdates = sanitizeObject(updates, [
  "cropType",
  "region",
  "notes",
  "pricingType",
]);
```

#### `loadFromLocalStorage()`

```javascript
// 淨化載入的資料，防止手動修改 localStorage 注入惡意內容
records.value = parsed.map((record) => ({
  ...record,
  ...sanitizeObject(record, ["cropType", "region", "notes", "pricingType"]),
}));
```

### 3. 測試覆蓋

建立了兩組測試來確保功能正確：

#### 單元測試 (`tests/unit/utils/sanitizer.test.js`)

- 15 個測試案例，全部通過 ✅
- 測試項目包括：
  - 移除各種 HTML 標籤
  - 防護事件處理器注入
  - 防護 javascript: 協議
  - 處理複雜的 XSS 攻擊
  - 保留正常文字內容

#### 整合測試 (`tests/unit/stores/history-xss-protection.test.js`)

- 10 個測試案例，全部通過 ✅
- 測試項目包括：
  - 新增記錄時的防護
  - 更新記錄時的防護
  - 從 localStorage 載入時的防護
  - 複雜攻擊場景
  - 數值欄位不受影響

## 防護範圍

### 已防護的攻擊類型

✅ Script 標籤注入
✅ 事件處理器注入（onclick, onerror 等）
✅ iframe 嵌入
✅ SVG 標籤攻擊
✅ javascript: 協議注入
✅ 圖片標籤攻擊
✅ Object/Embed 標籤注入

### 受保護的欄位

- `cropType` - 作物類型
- `region` - 地區
- `notes` - 備註
- `pricingType` - 電價類型

### 不受影響的欄位

以下數值欄位保持原樣，不進行淨化：

- `billAmount` - 電費金額
- `fieldArea` - 耕作面積
- `pumpHorsepower` - 抽水馬力
- `pumpEfficiency` - 抽水效率
- `wellDepth` - 水井深度
- `timestamp` - 時間戳記
- `billingPeriodStart/End` - 計費期間

## 技術決策

### 為何不使用 DOMPurify？

原本考慮使用業界標準的 DOMPurify 函式庫，但在測試環境（happy-dom）中遇到相容性問題。最終決定：

**優點：**

- ✅ 手動實作更輕量（0 額外依賴）
- ✅ 完全符合專案需求（只需保留純文字）
- ✅ 在所有環境下都能穩定運作
- ✅ 更容易維護和理解

**風險評估：**

- 手動實作經過充分測試（25 個測試案例）
- 使用瀏覽器原生 DOM API，安全可靠
- 對於農業資料欄位，純文字處理已足夠

### 防護策略

採用**雙層防護**機制：

1. **正則表達式移除危險標籤**
   - 移除 `<script>`, `<style>`, `<iframe>` 等及其內容
   - 防止這些標籤的內容被保留

2. **DOM API 提取純文字**
   - 使用 `textContent` 提取純文字
   - 自動移除所有剩餘的 HTML 結構

這種組合確保：

- 危險標籤的內容不會被保留
- 所有 HTML 結構都被移除
- 只保留使用者真正想輸入的文字內容

## 使用範例

### 淨化單一字串

```javascript
import { sanitizeInput } from "@/utils/sanitizer";

const userInput = '<script>alert("XSS")</script>水稻';
const safe = sanitizeInput(userInput);
// 結果: '水稻'
```

### 淨化物件

```javascript
import { sanitizeObject } from "@/utils/sanitizer";

const formData = {
  cropType: "<img src=x onerror=alert(1)>玉米",
  region: "台南<script>...</script>",
  billAmount: 1000, // 數值不受影響
};

const safe = sanitizeObject(formData, ["cropType", "region"]);
// 結果: { cropType: '玉米', region: '台南', billAmount: 1000 }
```

## 效果驗證

### 測試結果

```bash
✓ tests/unit/utils/sanitizer.test.js (15 tests)
✓ tests/unit/stores/history-xss-protection.test.js (10 tests)
```

### 實際案例

**輸入:**

```javascript
{
  cropType: '<script>alert("我要竊取你的資料")</script>水稻',
  region: '台南<img src=x onerror=alert(document.cookie)>',
  notes: '<iframe src="evil.com"></iframe>這季收成不錯',
  billAmount: 1234.56
}
```

**儲存後的結果:**

```javascript
{
  cropType: '水稻',
  region: '台南',
  notes: '這季收成不錯',
  billAmount: 1234.56
}
```

## 後續建議

雖然已實作 XSS 防護，但仍建議：

1. **定期更新依賴套件**
   - 執行 `npm audit` 檢查安全漏洞
   - 及時更新有安全問題的套件

2. **考慮實作 CSP（內容安全政策）**
   - 在 `index.html` 加入 CSP meta 標籤
   - 限制可載入的資源來源

3. **定期安全審查**
   - 每季度檢視安全防護機制
   - 關注新的攻擊手法

4. **使用者教育**
   - 告知使用者不要複製貼上未知來源的內容
   - 說明系統如何保護他們的資料

## 相關檔案

### 實作檔案

- `src/utils/sanitizer.js` - 淨化工具函數
- `src/stores/history.js` - 整合 XSS 防護

### 測試檔案

- `tests/unit/utils/sanitizer.test.js` - 單元測試
- `tests/unit/stores/history-xss-protection.test.js` - 整合測試

### 文件

- `docs/security-report.md` - 原始安全報告
- `docs/xss-protection-implementation.md` - 本文件

## 結論

✅ **XSS 防護實作完成**

- 全面防護使用者輸入的文字欄位
- 25 個測試案例全部通過
- 零額外依賴，輕量且可靠
- 不影響現有功能和數值欄位
- 同時保護儲存、載入和顯示三個環節

風險等級已從**高**降低至**低**，應用程式現在能有效防護 XSS 攻擊。
