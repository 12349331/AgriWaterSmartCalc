/**
 * 日期格式化工具
 * 統一處理計費期間與創建時間的格式化顯示
 */

/**
 * 格式化計費期間 (YYYY/MM/DD - YYYY/MM/DD)
 * @param {Date|string} startDate - 起始日期
 * @param {Date|string} endDate - 結束日期
 * @returns {string} 格式化後的期間字串
 */
export function formatBillingPeriod(startDate, endDate) {
  if (!startDate || !endDate) return '未設定'

  const formatSingleDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date

    if (!(d instanceof Date) || isNaN(d.getTime())) {
      return '-'
    }

    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Taipei',
    })
  }

  return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`
}

/**
 * 格式化創建時間 (YYYY/MM/DD HH:mm)
 * @param {number} timestamp - Unix timestamp (毫秒)
 * @returns {string} 格式化後的時間字串
 */
export function formatCreatedTime(timestamp) {
  if (!timestamp) return '-'

  const d = new Date(timestamp)

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return '-'
  }

  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  })
}
