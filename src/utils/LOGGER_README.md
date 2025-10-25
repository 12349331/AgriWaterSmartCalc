# AquaMetrics Logger 系統使用說明

## 📖 概述

AquaMetrics 使用專業的 Logger 系統取代原生 `console`,提供更好的日誌管理和除錯體驗。

## ✨ 特色

- **台灣本地時間格式**: `2025/10/26 14:30:15.123`
- **自動擷取呼叫位置**: 顯示檔案路徑和行號
- **環境感知**: 開發環境顯示所有 log,生產環境只顯示 ERROR
- **詳細格式**: `[時間] [等級] [檔案:行號] 訊息內容`
- **可動態控制**: 生產環境可臨時開啟 debug 模式

## 🎯 使用方式

### 1. 引入 Logger

```javascript
import logger from '@/utils/logger'
```

### 2. 使用不同等級的 Log

```javascript
// DEBUG - 詳細除錯資訊 (只在開發環境顯示)
logger.debug('可用的定價模組:', modules)
logger.debug('計算參數:', { billAmount, startDate, endDate })

// INFO - 一般資訊 (只在開發環境顯示)
logger.info('✅ 成功載入 8 個歷史電價版本')
logger.info('使用者已登入:', username)

// WARN - 警告訊息 (只在開發環境顯示)
logger.warn('找不到模組:', modulePath)
logger.warn('⚠️ 載入本地電價資料失敗:', error)

// ERROR - 錯誤訊息 (所有環境都顯示)
logger.error('❌ 載入電價版本失敗:', error)
logger.error('Failed to save to localStorage:', error)
```

### 3. Log 等級說明

| 等級 | 用途 | 開發環境 | 生產環境 |
|------|------|----------|----------|
| **DEBUG** | 詳細除錯資訊 | ✅ 顯示 | ❌ 隱藏 |
| **INFO** | 一般操作資訊 | ✅ 顯示 | ❌ 隱藏 |
| **WARN** | 警告但不影響運作 | ✅ 顯示 | ❌ 隱藏 |
| **ERROR** | 錯誤需要注意 | ✅ 顯示 | ✅ 顯示 |

## 📋 輸出格式範例

### 開發環境 (http://localhost:3000)

```
[2025/10/26 14:30:15.123] [DEBUG] [composables/usePowerCalculator.js:73] 可用的定價模組: {...}
[2025/10/26 14:30:15.456] [INFO] [composables/usePowerCalculator.js:106] ✅ 成功載入 8 個歷史電價版本
[2025/10/26 14:30:16.789] [WARN] [stores/calculation.js:242] ⚠️ 載入本地電價資料失敗
[2025/10/26 14:30:17.012] [ERROR] [stores/history.js:150] Failed to save to localStorage: QuotaExceededError
```

### 生產環境 (https://yourdomain.com)

```
[2025/10/26 14:30:17.012] [ERROR] [stores/history.js:150] Failed to save to localStorage: QuotaExceededError
```
(只有 ERROR 等級會顯示)

## 🔧 進階功能

### 在生產環境臨時開啟 Debug 模式

如果在生產環境遇到問題需要除錯,可以在瀏覽器 Console 執行:

```javascript
// 開啟 debug 模式
window.__logger.enableDebug()
// 然後重新載入頁面,就會看到所有 debug log

// 關閉 debug 模式
window.__logger.disableDebug()
```

### 檢查當前 Log 等級

```javascript
// 在開發環境 Console 可用
window.__logger  // 存取 logger 物件
```

## 🚀 遷移指南

從舊的 console 語法遷移到 logger:

```javascript
// ❌ 舊寫法
console.log('成功載入資料')
console.warn('找不到模組')
console.error('載入失敗', error)

// ✅ 新寫法
logger.debug('成功載入資料')  // 或 logger.info()
logger.warn('找不到模組')
logger.error('載入失敗', error)
```

## 📝 最佳實踐

### 1. 選擇正確的 Log 等級

```javascript
// ✅ 好的做法
logger.debug('計算中間結果:', intermediateValue)  // 除錯資訊
logger.info('✅ 操作成功完成')  // 成功訊息
logger.warn('使用降級方案')  // 警告但可繼續
logger.error('無法載入必要資料:', error)  // 嚴重錯誤

// ❌ 不好的做法
logger.error('操作成功')  // 不是錯誤不要用 error
logger.debug('嚴重錯誤')  // 嚴重錯誤要用 error
```

### 2. 提供有意義的訊息

```javascript
// ✅ 好的做法
logger.warn('找不到電價版本:', { date: billingDate, availableVersions })
logger.error('localStorage 空間不足:', {
  error,
  attempted: dataSize,
  limit: quotaLimit
})

// ❌ 不好的做法
logger.warn('錯誤')  // 太簡略
logger.error(error)  // 沒有上下文
```

### 3. 避免敏感資訊

```javascript
// ❌ 絕對不要 log 敏感資訊
logger.debug('使用者密碼:', password)  // 危險!
logger.info('信用卡號:', cardNumber)  // 危險!
logger.debug('API Token:', token)  // 危險!

// ✅ 安全的做法
logger.debug('使用者已驗證:', { username })  // OK
logger.info('付款方式:', paymentMethod)  // OK (不包含卡號)
logger.debug('API 請求成功')  // OK (不包含 token)
```

## 🎨 配置選項

所有配置都在 `logger.config.js`:

```javascript
export const LoggerFeatures = {
  showTimestamp: true,      // 顯示時間戳記
  showFile: true,           // 顯示檔案路徑
  showStackTrace: false,    // 顯示堆疊追蹤 (僅 ERROR)
  colorize: isDev,          // 使用顏色 (僅開發環境)
}
```

## 🔮 未來擴展

Logger 系統設計為可擴展,未來可以輕鬆加入:

- 遠端日誌收集 (Sentry, LogRocket 等)
- 效能監控整合
- 自定義 log 過濾器
- Log 檔案匯出功能

## 📊 統計資訊

- **總共替換**: 33 處 console 語句
- **涵蓋檔案**: 13 個檔案
- **程式碼品質**: 提升日誌管理和除錯效率

---

## ❓ 常見問題

### Q: 為什麼生產環境 console 是空的?
A: 這是預期行為!生產環境只顯示 ERROR 等級,保持 console 乾淨專業。如需臨時除錯,使用 `window.__logger.enableDebug()`。

### Q: 如何在測試中模擬 logger?
A: 在測試設定檔中 mock logger:
```javascript
vi.mock('@/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}))
```

### Q: Logger 會影響效能嗎?
A: 不會!生產環境中 DEBUG/INFO/WARN 等級的 log 會在函式入口就被過濾掉,不會執行任何運算。

---

💡 **提示**: 在開發時,打開瀏覽器 DevTools 的 Console,就可以看到格式化的詳細 log!
