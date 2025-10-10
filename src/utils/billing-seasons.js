/**
 * 電費計價季節判定工具
 *
 * 根據台電計價規則判定夏月/非夏月期間
 * - 夏月：6月1日 至 9月30日（含邊界）
 * - 非夏月：1月1日 至 5月31日、10月1日 至 12月31日
 */

/**
 * 判定計價季節（基於計費期間）
 * 若期間橫跨兩個季節，以天數較多的季節為準
 * @param {Date|string} startDate - 計費期間起始日期
 * @param {Date|string} endDate - 計費期間結束日期
 * @returns {'夏月'|'非夏月'} 計價季節
 */
export function determineBillingSeason(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('Both startDate and endDate parameters are required')
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (!(start instanceof Date) || isNaN(start.getTime())) {
    throw new Error('Invalid startDate provided')
  }

  if (!(end instanceof Date) || isNaN(end.getTime())) {
    throw new Error('Invalid endDate provided')
  }

  if (start > end) {
    throw new Error('startDate must be earlier than or equal to endDate')
  }

  // 計算各季節的天數
  let summerDays = 0
  let nonSummerDays = 0

  const current = new Date(start)
  while (current <= end) {
    const month = current.getMonth() + 1 // 0-indexed, +1 轉為 1-12

    if (month >= 6 && month <= 9) {
      summerDays++
    } else {
      nonSummerDays++
    }

    current.setDate(current.getDate() + 1)
  }

  // 以天數較多的季節為準，天數相等時以結束日期所屬季節為準
  if (summerDays > nonSummerDays) {
    return '夏月'
  } else if (nonSummerDays > summerDays) {
    return '非夏月'
  } else {
    // 天數相等，使用結束日期判定
    const endMonth = end.getMonth() + 1
    return endMonth >= 6 && endMonth <= 9 ? '夏月' : '非夏月'
  }
}

/**
 * 檢測計費期間是否橫跨夏月與非夏月邊界
 * @param {Date|string} startDate - 計費期間起始日期
 * @param {Date|string} endDate - 計費期間結束日期
 * @returns {boolean} 是否橫跨季節邊界
 */
export function checkCrossSeasonBoundary(startDate, endDate) {
  if (!startDate || !endDate) {
    return false
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (!(start instanceof Date) || isNaN(start.getTime()) ||
      !(end instanceof Date) || isNaN(end.getTime())) {
    return false
  }

  const startMonth = start.getMonth() + 1
  const endMonth = end.getMonth() + 1

  const startIsSummer = startMonth >= 6 && startMonth <= 9
  const endIsSummer = endMonth >= 6 && endMonth <= 9

  // 若起始與結束日期屬於不同季節，即為橫跨
  return startIsSummer !== endIsSummer
}

/**
 * 檢查是否為邊界日期
 * @param {Date|string} date - 日期物件或 ISO 字串
 * @returns {boolean} 是否為季節邊界日期
 */
export function isBoundaryDate(date) {
  if (!date) {
    return false
  }

  const d = typeof date === 'string' ? new Date(date) : date

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return false
  }

  const month = d.getMonth() + 1
  const day = d.getDate()

  const boundaries = [
    { month: 6, day: 1 },   // 夏月開始
    { month: 9, day: 30 },  // 夏月結束
    { month: 10, day: 1 },  // 非夏月開始（下半年）
    { month: 5, day: 31 },  // 非夏月結束（上半年）
  ]

  return boundaries.some((b) => b.month === month && b.day === day)
}
