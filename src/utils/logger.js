/**
 * Professional Logger System for AquaMetrics
 * 專業的日誌系統
 *
 * 特色:
 * - 台灣本地時間格式
 * - 自動擷取呼叫者檔案和行號
 * - 環境感知 (開發 vs 生產)
 * - 詳細的 log 格式
 * - 可擴展的架構 (未來可加入遠端監控)
 */

import {
  LogLevel,
  LogLevelName,
  getMinLogLevel,
  ConsoleStyles,
  LoggerFeatures,
} from './logger.config'

/**
 * 格式化台灣時區時間戳記
 * 格式: YYYY/MM/DD HH:mm:ss.SSS
 */
function formatTimestamp() {
  const now = new Date()

  // 台灣時區 (UTC+8)
  const taipeiOffset = 8 * 60 // 分鐘
  const localOffset = now.getTimezoneOffset() // 本地時區偏移
  const taipeiTime = new Date(now.getTime() + (taipeiOffset + localOffset) * 60 * 1000)

  const year = taipeiTime.getFullYear()
  const month = String(taipeiTime.getMonth() + 1).padStart(2, '0')
  const day = String(taipeiTime.getDate()).padStart(2, '0')
  const hours = String(taipeiTime.getHours()).padStart(2, '0')
  const minutes = String(taipeiTime.getMinutes()).padStart(2, '0')
  const seconds = String(taipeiTime.getSeconds()).padStart(2, '0')
  const milliseconds = String(taipeiTime.getMilliseconds()).padStart(3, '0')

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

/**
 * 擷取呼叫者資訊 (檔案路徑和行號)
 * 透過解析 Error stack trace
 */
function getCallerInfo() {
  try {
    const stack = new Error().stack
    if (!stack) return 'unknown'

    // Stack trace 格式:
    // at functionName (file:line:column)
    // 我們要找第 4 層 (跳過 Error, getCallerInfo, log wrapper, actual caller)
    const lines = stack.split('\n')

    // 尋找第一個不是 logger.js 的呼叫
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i]

      // 跳過 logger.js 本身
      if (line.includes('logger.js')) continue

      // 解析檔案路徑
      // 格式可能是: at Object.<anonymous> (http://localhost:3000/src/composables/usePowerCalculator.js:73:13)
      const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at\s+(.+):(\d+):(\d+)/)

      if (match) {
        let filePath = match[1]
        const lineNum = match[2]

        // 清理檔案路徑
        // 移除 http://localhost:3000/ 前綴
        filePath = filePath.replace(/^https?:\/\/[^/]+\//, '')

        // 移除 file:/// 前綴 (本地檔案)
        filePath = filePath.replace(/^file:\/\/\//, '')

        // 只保留 src/ 之後的路徑
        const srcIndex = filePath.indexOf('src/')
        if (srcIndex !== -1) {
          filePath = filePath.substring(srcIndex)
        }

        return `${filePath}:${lineNum}`
      }
    }

    return 'unknown'
  } catch (error) {
    return 'unknown'
  }
}

/**
 * 格式化 log 訊息
 * @param {number} level - Log 等級
 * @param {string} callerInfo - 呼叫者資訊
 * @param {Array} args - Log 參數
 * @returns {Array} 格式化後的參數
 */
function formatLogMessage(level, callerInfo, args) {
  const parts = []

  // 時間戳記
  if (LoggerFeatures.showTimestamp) {
    parts.push(`[${formatTimestamp()}]`)
  }

  // Log 等級
  const levelName = LogLevelName[level]
  parts.push(`[${levelName}]`)

  // 檔案資訊
  if (LoggerFeatures.showFile && callerInfo !== 'unknown') {
    parts.push(`[${callerInfo}]`)
  }

  // 組合前綴
  const prefix = parts.join(' ')

  return [prefix, ...args]
}

/**
 * 核心 log 函式
 */
function log(level, ...args) {
  const minLevel = getMinLogLevel()

  // 檢查是否應該輸出
  if (level < minLevel) {
    return
  }

  // 取得呼叫者資訊
  const callerInfo = LoggerFeatures.showFile ? getCallerInfo() : 'unknown'

  // 格式化訊息
  const formattedArgs = formatLogMessage(level, callerInfo, args)

  // 選擇對應的 console 方法
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(...formattedArgs)
      break
    case LogLevel.INFO:
      console.log(...formattedArgs)
      break
    case LogLevel.WARN:
      console.warn(...formattedArgs)
      break
    case LogLevel.ERROR:
      console.error(...formattedArgs)
      break
  }
}

/**
 * Logger API
 */
export const logger = {
  /**
   * DEBUG 等級 - 詳細的除錯資訊
   * 只在開發環境顯示
   */
  debug: (...args) => log(LogLevel.DEBUG, ...args),

  /**
   * INFO 等級 - 一般資訊
   * 只在開發環境顯示
   */
  info: (...args) => log(LogLevel.INFO, ...args),

  /**
   * WARN 等級 - 警告訊息
   * 只在開發環境顯示
   */
  warn: (...args) => log(LogLevel.WARN, ...args),

  /**
   * ERROR 等級 - 錯誤訊息
   * 在所有環境都會顯示
   */
  error: (...args) => log(LogLevel.ERROR, ...args),

  /**
   * 臨時開啟 debug 模式 (存入 localStorage)
   * 在生產環境中可透過 console 執行來除錯
   */
  enableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('__AQUA_DEBUG__', 'true')
      console.log('✅ Debug mode enabled. Reload page to see debug logs.')
    }
  },

  /**
   * 關閉 debug 模式
   */
  disableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('__AQUA_DEBUG__')
      console.log('✅ Debug mode disabled.')
    }
  },
}

// 匯出 logger 作為預設
export default logger

// 在開發環境將 logger 暴露到全域 window 物件,方便除錯
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__logger = logger
}
