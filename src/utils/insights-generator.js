/**
 * 數據洞察文字生成器
 * 根據歷史記錄的統計數據，生成簡單的洞察文字
 */

/**
 * 生成用水量範圍洞察
 * @param {number} avgWaterUsage - 平均用水量（m³）
 * @param {number} maxWaterUsage - 最大用水量（m³）
 * @param {number} minWaterUsage - 最小用水量（m³）
 * @returns {string} 洞察文字
 */
export function generateWaterRangeInsight(avgWaterUsage, maxWaterUsage, minWaterUsage) {
  if (avgWaterUsage === 0 || maxWaterUsage === 0) {
    return '暫無足夠數據進行分析。'
  }

  const range = maxWaterUsage - minWaterUsage
  const rangePercentage = (range / avgWaterUsage) * 100

  if (rangePercentage > 50) {
    return '用水量變化範圍較大，建議檢視不同時期的灌溉策略。'
  } else {
    return '用水量變化範圍穩定，灌溉策略一致性良好。'
  }
}

/**
 * 生成用水量平均值洞察
 * @param {number} avgWaterUsage - 平均用水量（m³）
 * @returns {string} 洞察文字
 */
export function generateAvgWaterInsight(avgWaterUsage) {
  if (avgWaterUsage === 0) {
    return '暫無用水記錄。'
  }

  if (avgWaterUsage < 100) {
    return '平均用水量較低，適合節水作物栽培。'
  } else if (avgWaterUsage >= 100 && avgWaterUsage < 300) {
    return '平均用水量適中，符合一般作物需求。'
  } else {
    return '平均用水量較高，建議定期檢視用水效率。'
  }
}

/**
 * 生成總結洞察（固定文字）
 * @returns {string} 總結文字
 */
export function generateSummaryInsight() {
  return '建議定期追蹤用水記錄，以優化灌溉管理。'
}

/**
 * 生成完整的數據洞察文字（2-3 句）
 * @param {Object} stats - 統計數據
 * @param {number} stats.avgWaterUsage - 平均用水量（m³）
 * @param {number} stats.maxWaterUsage - 最大用水量（m³）
 * @param {number} stats.minWaterUsage - 最小用水量（m³）
 * @returns {string[]} 洞察文字陣列
 */
export function generateInsights(stats) {
  const { avgWaterUsage = 0, maxWaterUsage = 0, minWaterUsage = 0 } = stats

  const insights = [
    generateWaterRangeInsight(avgWaterUsage, maxWaterUsage, minWaterUsage),
    generateAvgWaterInsight(avgWaterUsage),
    generateSummaryInsight(),
  ]

  return insights
}
