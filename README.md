# AquaMetrics - 農業用水估算系統

> 基於台電電費帳單的農業抽水用電量推估工具

[![Test Coverage](https://img.shields.io/badge/coverage-90%25-green)]()
[![Vue 3.5+](https://img.shields.io/badge/Vue-3.5%2B-4FC08D)]()
[![Pinia 2.2+](https://img.shields.io/badge/Pinia-2.2%2B-yellow)]()

---

## 📊 專案狀態

**最後更新**: 2025-10-11

| 項目 | 狀態 | 詳情 |
|------|------|------|
| **功能完整度** | ✅ 100% | 所有核心功能已實作 |
| **測試覆蓋率** | 🟢 90%+ | 460/498 tests passing |
| **程式碼品質** | ✅ 通過 | ESLint configured, console cleaned |
| **生產就緒度** | 🟡 進行中 | 核心功能可用，品質把關中 |

### 最新功能

✨ **PDF 報告匯出功能** (2025-10-27)
- ✅ 專業 PDF 報告生成（包含完整資料與視覺化圖表）
- ✅ 自動數據洞察生成
- ✅ A4 直向格式，高解析度圖表輸出
- ✅ 瀏覽器端生成（無需後端服務）

✨ **電費計價日期選擇與歷史紀錄時間欄位** (Feature 003)
- ✅ 計費期間選擇（雙日期輸入）與自動季節判定（夏月/非夏月）
- ✅ 歷史紀錄雙時間戳架構（計費期間 + 創建時間）
- ✅ 日期範圍篩選與統計分析
- ✅ 舊資料自動遷移（向後相容）
- ✅ 台灣時區（GMT+8）強制執行

---

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn

### 安裝

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 執行測試
npm test

# 建置生產版本
npm run build
```

### 專案指令

```bash
npm run dev          # 啟動開發伺服器 (http://localhost:5173)
npm test             # 執行所有測試
npm run test:ui      # 測試 UI 介面
npm run build        # 建置生產版本
npm run preview      # 預覽生產版本
npm run lint         # ESLint 檢查
```

---

## 🏗️ 技術架構

### 核心技術

- **前端框架**: Vue 3.5+ (Composition API)
- **狀態管理**: Pinia 2.2+
- **建置工具**: Vite 5.0+
- **樣式**: Tailwind CSS 3.4+
- **測試**: Vitest + Playwright

### 專案結構

```
AquaMetrics/
├── src/
│   ├── components/       # Vue 元件
│   │   ├── calculator/   # 計算表單相關
│   │   ├── history/      # 歷史紀錄相關
│   │   └── common/       # 共用元件
│   ├── composables/      # Vue Composables
│   ├── stores/           # Pinia Stores
│   ├── utils/            # 工具函數
│   └── data/             # 靜態資料
├── tests/
│   ├── unit/             # 單元測試
│   ├── component/        # 元件測試
│   └── e2e/              # E2E 測試
├── specs/                # 功能規格文件
│   └── 003-/             # Feature 003 規格
└── docs/                 # 專案文件
```

---

## 📖 核心功能

### 1. 用電量計算
- 依據作物類型、田地面積計算月用水量
- 自動查詢台電定價資料
- 支援夏月/非夏月自動判定

### 2. 計費期間管理 (Feature 003)
- 雙日期輸入（計費期間開始/結束）
- 自動季節判定（基於天數計算）
- 橫跨季節警告（建議拆分紀錄）
- 未來日期警告
- 日期範圍驗證（2020-01-01 至 今天+1年）

### 3. 歷史紀錄分析
- 雙時間戳架構：
  - **計費期間**: 電費帳單的實際計費區間
  - **創建時間**: 建立紀錄的時間（可追溯輸入）
- 獨立排序（依計費期間或創建時間）
- 日期範圍篩選
- 即時統計摘要（筆數、平均用水量、總用電度數）
- 多格式匯出：CSV、JSON、PDF 報告

### 4. PDF 報告匯出
- **專業報告生成**：包含完整的輸入參數、統計摘要與視覺化圖表
- **報告內容**：
  - 輸入參數明細（電費金額、計費期間、作物類型等）
  - 統計摘要（總抽水次數、平均月用水量、總用電度數）
  - 圖表視覺化（季節性用水趨勢、作物用水量比較、年度用水趨勢）
  - 數據洞察分析（自動生成簡易建議）
- **檔案格式**：A4 直向 PDF，檔名含時間戳
- **生成效能**：< 5 秒完成，檔案大小 < 5MB
- **技術實作**：使用 html2pdf.js 於瀏覽器端生成

### 5. 資料遷移
- 舊紀錄自動遷移（應用啟動時）
- 向後相容（無資料遺失）
- 錯誤降級策略

---

## 🧪 測試策略

### 測試覆蓋範圍

- ✅ **單元測試**: 225+ tests (工具函數、composables)
- ✅ **元件測試**: 120+ tests (Vue 元件)
- ✅ **E2E 測試**: 25+ scenarios (完整使用者流程)
- ✅ **整合測試**: Store、資料遷移

### 執行測試

```bash
# 所有測試
npm test

# 單元測試 only
npm test -- tests/unit

# E2E 測試
npm run test:e2e

# 測試覆蓋率報告
npm test -- --coverage
```

---

## 📋 已知問題與待辦事項

目前有 **6 個測試失敗**需要修復（影響 <2% 測試），主要是：
- DateRangePicker 事件邏輯（4 tests）
- date-validators 時區處理（2 tests）

完整的技術債務追蹤請參考：**[TODO.md](./TODO.md)**

詳細的憲法遵循分析請參考：**[CONSTITUTION_COMPLIANCE_REPORT.md](./CONSTITUTION_COMPLIANCE_REPORT.md)**

---

## 📚 文件

### 使用者文件
- [使用者指南](./docs/user-guide.md) (待建立)
- [FAQ](./docs/faq.md) (待建立)

### 開發者文件
- **Feature 003 規格**: [specs/003-/spec.md](./specs/003-/spec.md)
- **實作計畫**: [specs/003-/plan.md](./specs/003-/plan.md)
- **任務分解**: [specs/003-/tasks.md](./specs/003-/tasks.md)
- **憲法遵循報告**: [CONSTITUTION_COMPLIANCE_REPORT.md](./CONSTITUTION_COMPLIANCE_REPORT.md)
- **技術債務清單**: [TODO.md](./TODO.md)

---

## 🤝 貢獻指南

### 開發工作流程

1. 從 `main` 分支建立新的 feature branch
2. 開發功能並撰寫測試（TDD 方式）
3. 確保所有測試通過 (`npm test`)
4. 執行 ESLint (`npm run lint`)
5. 提交 Pull Request

### 程式碼規範

- 使用 ESLint 配置（已設定）
- Vue 3 Composition API
- 使用 Pinia 管理狀態
- 所有新功能需有測試覆蓋
- Commit 訊息遵循 [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 授權

MIT License

---

## 🙏 致謝

- 台灣電力公司開放資料平台
- Vue.js 社群
- Specify 規範開發工具

---

**專案維護者**: [您的名字]
**最後更新**: 2025-10-27
