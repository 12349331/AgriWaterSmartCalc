/**
 * 時區處理工具
 * 統一處理台灣時區 (GMT+8) 的日期與時間
 */

/**
 * 台灣時區識別碼
 */
export const TAIWAN_TIMEZONE = 'Asia/Taipei'

/**
 * 強制轉換日期為台灣時區 GMT+8
 * @param {Date|string|number} date - 日期物件、ISO 字串或 timestamp
 * @returns {Date} 台灣時區的日期物件
 */
export function ensureTaiwanTimezone(date) {
  let d

  if (typeof date === 'number') {
    d = new Date(date)
  } else if (typeof date === 'string') {
    d = new Date(date)
  } else if (date instanceof Date) {
    d = date
  } else {
    throw new Error('Invalid date parameter')
  }

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date value')
  }

  // 使用 toLocaleString 轉換到台灣時區，然後重新建立 Date 物件
  const taiwanDateStr = d.toLocaleString('zh-TW', {
    timeZone: TAIWAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  // 解析台灣時間字串（格式: YYYY/MM/DD HH:mm:ss）
  const [datePart, timePart] = taiwanDateStr.split(' ')
  const [year, month, day] = datePart.split('/')
  const [hour, minute, second] = timePart.split(':')

  return new Date(year, month - 1, day, hour, minute, second)
}

/**
 * 取得當前台灣時區時間戳記
 * @returns {number} Unix timestamp (毫秒)
 */
export function getCurrentTimestampTW() {
  const now = new Date()
  const taiwanDate = ensureTaiwanTimezone(now)
  return taiwanDate.getTime()
}

/**
 * 將日期轉換為台灣時區的 ISO 字串
 * @param {Date|string|number} date - 日期物件、ISO 字串或 timestamp
 * @returns {string} ISO 8601 格式字串（YYYY-MM-DD）
 */
export function toTaiwanISOString(date) {
  const taiwanDate = ensureTaiwanTimezone(date)
  const year = taiwanDate.getFullYear()
  const month = String(taiwanDate.getMonth() + 1).padStart(2, '0')
  const day = String(taiwanDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
