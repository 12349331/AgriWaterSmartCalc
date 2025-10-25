/**
 * Power Calculator Composable
 * 電力計算器組合式函式
 * Reverse-calculates kWh from Taipower bill amount using progressive pricing
 * 根據台電帳單金額反推用電度數（使用累進費率）
 */

import { usePricingVersion } from './usePricingVersion.js'
import { determineBillingSeason } from '../utils/billing-seasons.js'

/**
 * 從新格式的電價資料中提取指定類型和季節的級距
 * @param {Object} pricingData - 新格式的電價資料（包含 pricing_types）
 * @param {string} electricityType - 用電種類
 * @param {string} billingSeason - 計費月份（夏月或非夏月）
 * @returns {Array} 級距陣列
 */
function extractTiers(pricingData, electricityType, billingSeason) {
  // 支援新格式（包含 pricing_types）
  if (pricingData.pricing_types) {
    const typeData = pricingData.pricing_types.find((t) => t.用電種類 === electricityType)
    if (!typeData) return []

    const seasonData = typeData.seasons.find((s) => s.計費月份 === billingSeason)
    return seasonData ? seasonData.tiers : []
  }

  // 支援舊格式（陣列格式，用於向後相容）
  if (Array.isArray(pricingData)) {
    return pricingData.filter(
      (p) => p.用電種類 === electricityType && p.計費月份 === billingSeason,
    )
  }

  return []
}

/**
 * 計算單一級距的度數寬度
 * @param {Object} tier - 級距物件
 * @param {number} previousMax - 前一級距的上限度數
 * @returns {number|null} 該級距的度數寬度
 */
function calculateTierWidth(tier, previousMax = 0) {
  // 新格式：直接使用 上限度數 欄位
  if (tier.上限度數 !== undefined) {
    if (tier.上限度數 === null) {
      // 開放級距（如 1001度以上），回傳 null 表示無上限
      return null
    }
    // 級距寬度 = 上限 - 前一級距上限
    return tier.上限度數 - previousMax
  }

  // 舊格式：解析級距字串（向後相容）
  return parseTierLimitLegacy(tier.級距)
}

/**
 * Reverse calculate kWh from bill amount using Taipower progressive pricing
 * 根據台電帳單金額反推用電度數（使用累進費率）
 *
 * @param {number} billAmount - Bill amount in TWD / 帳單金額（新台幣）
 * @param {string} electricityType - Electricity type (e.g., "表燈非營業用") / 用電種類
 * @param {string} billingSeason - "夏月" or "非夏月" / 計費月份（夏月或非夏月）
 * @param {Object|Array} pricingData - Taipower pricing data / 台電費率資料
 * @returns {number} Calculated kWh / 計算出的用電度數
 */
export function reverseBillToKwh(
  billAmount,
  electricityType,
  billingSeason,
  pricingData,
) {
  // 檢查帳單金額或費率資料是否存在
  if (!billAmount || !pricingData) return 0

  // 提取對應的級距資料
  const tiers = extractTiers(pricingData, electricityType, billingSeason)

  if (tiers.length === 0) {
    // 若找不到對應的費率級距，使用簡化計算方式
    console.warn(`找不到電價資料：${electricityType} ${billingSeason}`)
    return billAmount / 3.5 // Fallback: ~3.5 TWD/kWh average
  }

  // 初始化總度數和剩餘金額
  let totalKwh = 0
  let remainingBill = billAmount
  let previousMax = 0

  // 逐層級計算：從最低級距開始，依次消耗剩餘金額
  for (const tier of tiers) {
    // 取得該級距的度數寬度和單價
    const tierWidth = calculateTierWidth(tier, previousMax)
    const unitPrice = parseFloat(tier.單價)

    // 若單價解析失敗，跳過該層級
    if (!unitPrice) continue

    // 處理開放級距（上限度數 為 null）
    if (tierWidth === null) {
      // 最高級距，直接用剩餘金額 ÷ 單價計算度數
      totalKwh += remainingBill / unitPrice
      break
    }

    // 計算該層級的費用（度數 × 單價）
    const tierCost = unitPrice * tierWidth

    // 若剩餘金額不足該層級的費用，表示用電度數位於此層級內
    if (remainingBill <= tierCost) {
      // 直接用剩餘金額 ÷ 單價 計算該層級的度數
      totalKwh += remainingBill / unitPrice
      break // 計算完成，跳出迴圈
    }

    // 若剩餘金額足夠，該層級全額消耗
    totalKwh += tierWidth
    remainingBill -= tierCost
    previousMax = tier.上限度數 || previousMax
  }

  // 四捨五入到小數點一位
  return Math.round(totalKwh * 10) / 10
}

/**
 * 跨版本反推用電度數（按比例拆分計費期間）
 * @param {number} billAmount - 電費金額
 * @param {string} electricityType - 用電種類
 * @param {Date|string} startDate - 計費起始日
 * @param {Date|string} endDate - 計費結束日
 * @returns {Promise<Object>} 計算結果（包含總度數、是否跨版本、詳細拆分）
 */
export async function reverseBillToKwhCrossVersion(
  billAmount,
  electricityType,
  startDate,
  endDate,
) {
  const { checkCrossVersion, splitBillingPeriod, loadPricingData } = usePricingVersion()

  // 檢查是否橫跨版本
  if (!checkCrossVersion(startDate, endDate)) {
    // 單一版本，直接計算
    const { findVersionByDate } = usePricingVersion()
    const version = findVersionByDate(endDate)

    if (!version) {
      console.error('找不到適用的電價版本')
      return { totalKwh: 0, isCrossVersion: false }
    }

    const pricingData = await loadPricingData(version.version_id)
    const season = determineBillingSeason(startDate, endDate)
    const kwh = reverseBillToKwh(billAmount, electricityType, season, pricingData)

    return {
      totalKwh: kwh,
      isCrossVersion: false,
      version: version.version_id,
      season,
    }
  }

  // 橫跨多版本，按比例拆分
  const periods = splitBillingPeriod(startDate, endDate)
  const totalDays = periods.reduce((sum, p) => sum + p.days, 0)

  let totalKwh = 0
  const breakdown = []

  for (const period of periods) {
    // 按天數比例拆分電費
    const periodBill = billAmount * (period.days / totalDays)

    // 載入該期間適用的電價
    const pricingData = await loadPricingData(period.version_id)

    // 判定該期間的季節
    const season = determineBillingSeason(period.start, period.end)

    // 計算該期間的度數
    const kwh = reverseBillToKwh(periodBill, electricityType, season, pricingData)

    totalKwh += kwh
    breakdown.push({
      version: period.version_id,
      start: period.start,
      end: period.end,
      days: period.days,
      bill: periodBill,
      kwh: kwh,
      season: season,
    })
  }

  return {
    totalKwh: Math.round(totalKwh * 10) / 10,
    isCrossVersion: true,
    breakdown,
  }
}

/**
 * Parse tier limit string to number (Legacy format support)
 * 解析級距字串，轉換為度數範圍（舊格式支援）
 * Examples: "120度以下" → 120, "121-330度" → 210, "331-500度" → 170
 */
function parseTierLimitLegacy(tierString) {
  if (!tierString) return null

  // 處理「XX度以下」的格式
  if (tierString.includes('以下')) {
    const match = tierString.match(/(\d+)度以下/)
    return match ? parseInt(match[1]) : null
  }

  // 處理「XX-YY度」的格式
  if (tierString.includes('-')) {
    const match = tierString.match(/(\d+)-(\d+)度/)
    if (match) {
      const lower = parseInt(match[1])
      const upper = parseInt(match[2])
      return upper - lower + 1
    }
  }

  // 處理「XX度以上」的格式 - 回傳 null 表示開放級距
  if (tierString.includes('以上')) {
    return null // 開放級距，無上限
  }

  return null
}

/**
 * Composable hook for power calculation
 * 電力計算組合式函式
 */
export function usePowerCalculator() {
  return {
    reverseBillToKwh,
    reverseBillToKwhCrossVersion,
  }
}
