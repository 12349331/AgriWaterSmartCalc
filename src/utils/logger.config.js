/**
 * Logger Configuration
 * 集中管理 Logger 的設定
 */

// Log 等級定義
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 999,
}

// Log 等級名稱對應
export const LogLevelName = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
}

// 環境判斷
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

/**
 * 取得當前環境的最小 log 等級
 * 開發環境: DEBUG (顯示所有)
 * 生產環境: ERROR (只顯示錯誤)
 */
export function getMinLogLevel() {
  // 檢查是否有本地 debug 設定 (可透過 localStorage 臨時開啟)
  if (typeof window !== 'undefined') {
    const localDebug = localStorage.getItem('__AQUA_DEBUG__')
    if (localDebug === 'true') {
      return LogLevel.DEBUG
    }
  }

  // 環境變數控制
  if (isDev) {
    return LogLevel.DEBUG // 開發環境顯示所有
  }

  if (isProd) {
    return LogLevel.ERROR // 生產環境只顯示 ERROR
  }

  return LogLevel.INFO // 預設值
}

/**
 * Console 樣式配置 (開發環境可用)
 */
export const ConsoleStyles = {
  DEBUG: 'color: #6B7280; font-weight: normal',
  INFO: 'color: #3B82F6; font-weight: normal',
  WARN: 'color: #F59E0B; font-weight: bold',
  ERROR: 'color: #EF4444; font-weight: bold',
  timestamp: 'color: #9CA3AF; font-weight: normal',
  file: 'color: #8B5CF6; font-weight: normal',
}

/**
 * Logger 功能開關
 */
export const LoggerFeatures = {
  showTimestamp: true, // 顯示時間戳記
  showFile: true, // 顯示檔案路徑和行號
  showStackTrace: false, // 顯示完整堆疊追蹤 (僅 ERROR 等級)
  colorize: isDev, // 是否使用顏色 (僅開發環境)
}
