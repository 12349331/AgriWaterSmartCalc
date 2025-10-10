/**
 * 日期驗證工具
 * 處理計費期間驗證、日期範圍、未來日期檢查等驗證邏輯
 */

/**
 * 最小允許日期 (2020-01-01)
 */
export const MIN_ALLOWED_DATE = '2020-01-01'

/**
 * 計費期間長度警告閾值（天數）
 */
export const MAX_BILLING_PERIOD_DAYS = 70

/**
 * 驗證計費期間（順序、範圍、長度）
 * @param {Date|string} startDate - 起始日期
 * @param {Date|string} endDate - 結束日期
 * @returns {Object} { valid: boolean, error: string|null, warning: string|null }
 */
export function validateBillingPeriod(startDate, endDate) {
  if (!startDate || !endDate) {
    return {
      valid: false,
      error: '請完整選擇電費計費期間（開始與結束日期）',
      warning: null
    }
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      error: '日期格式無效',
      warning: null
    }
  }

  // 檢查結束日期是否晚於開始日期
  if (end < start) {
    return {
      valid: false,
      error: '結束日期必須晚於開始日期',
      warning: null
    }
  }

  // 檢查日期是否在允許範圍內
  const maxDate = getMaxAllowedDate()
  if (!isWithinRange(start, MIN_ALLOWED_DATE, maxDate) ||
      !isWithinRange(end, MIN_ALLOWED_DATE, maxDate)) {
    return {
      valid: false,
      error: `日期必須在 2020/01/01 與 ${maxDate.replace(/-/g, '/')} 之間`,
      warning: null
    }
  }

  // 檢查期間長度是否過長（警告，不阻擋）
  const periodDays = getPeriodLengthInDays(start, end)
  if (periodDays > MAX_BILLING_PERIOD_DAYS) {
    return {
      valid: true,
      error: null,
      warning: `計費期間異常長（超過 ${MAX_BILLING_PERIOD_DAYS} 天），請確認日期是否正確`
    }
  }

  // 檢查是否包含未來日期（警告，不阻擋）
  if (isFutureDate(start) || isFutureDate(end)) {
    return {
      valid: true,
      error: null,
      warning: '您選擇的計費期間包含未來日期，是否確定？'
    }
  }

  return {
    valid: true,
    error: null,
    warning: null
  }
}

/**
 * 檢查日期是否在允許範圍內
 * @param {Date|string} date - 要檢查的日期
 * @param {string} minDate - 最小日期 (YYYY-MM-DD)
 * @param {string} maxDate - 最大日期 (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isWithinRange(date, minDate, maxDate) {
  if (!date) return false

  const d = typeof date === 'string' ? new Date(date) : date
  const min = new Date(minDate)
  const max = new Date(maxDate)

  if (isNaN(d.getTime()) || isNaN(min.getTime()) || isNaN(max.getTime())) {
    return false
  }

  return d >= min && d <= max
}

/**
 * 檢查是否為未來日期
 * @param {Date|string} date - 要檢查的日期
 * @returns {boolean}
 */
export function isFutureDate(date) {
  if (!date) return false

  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (isNaN(d.getTime())) {
    return false
  }

  return d > today
}

/**
 * 計算期間天數
 * @param {Date|string} startDate - 起始日期
 * @param {Date|string} endDate - 結束日期
 * @returns {number} 天數（含起始日）
 */
export function getPeriodLengthInDays(startDate, endDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0
  }

  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays + 1 // 含起始日，所以 +1
}

/**
 * 取得最大允許日期（今天 + 1 年）
 * @returns {string} YYYY-MM-DD 格式
 */
export function getMaxAllowedDate() {
  const today = new Date()
  const nextYear = new Date(today)
  nextYear.setFullYear(today.getFullYear() + 1)

  return nextYear.toISOString().split('T')[0]
}
