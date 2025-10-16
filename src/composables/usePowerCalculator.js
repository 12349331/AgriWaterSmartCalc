/**
 * Power Calculator Composable
 * Reverse-calculates kWh from Taipower bill amount using progressive pricing
 */

/**
 * Reverse calculate kWh from bill amount using Taipower progressive pricing
 *
 * @param {number} billAmount - Bill amount in TWD
 * @param {string} electricityType - Electricity type (e.g., "表燈非營業用")
 * @param {string} billingSeason - "夏月" or "非夏月"
 * @param {Array} pricingData - Taipower pricing tier data
 * @returns {number} Calculated kWh
 */
export function reverseBillToKwh(
  billAmount,
  electricityType,
  billingSeason,
  pricingData,
) {
  if (!billAmount || !pricingData) return 0

  // Validate that pricingData is an array
  if (!Array.isArray(pricingData)) {
    console.error(
      '❌ reverseBillToKwh: pricingData is not an array:',
      typeof pricingData,
    )
    return billAmount / 3.5 // Fallback calculation
  }

  if (pricingData.length === 0) return 0

  // Filter pricing tiers by type and season
  const tiers = pricingData.filter(
    (p) => p.用電種類 === electricityType && p.計費月份 === billingSeason,
  )

  if (tiers.length === 0) {
    // Fallback: use simplified calculation if API data unavailable
    // Average rate: ~3.5 TWD/kWh for residential use
    return billAmount / 3.5
  }

  let totalKwh = 0
  let remainingBill = billAmount

  for (const tier of tiers) {
    const tierLimit = parseTierLimit(tier.級距)
    const unitPrice = parseFloat(tier.單價)

    if (!tierLimit || !unitPrice) continue

    const tierCost = unitPrice * tierLimit

    if (remainingBill <= tierCost) {
      totalKwh += remainingBill / unitPrice
      break
    }

    totalKwh += tierLimit
    remainingBill -= tierCost
  }

  return Math.round(totalKwh * 10) / 10 // Round to 1 decimal
}

/**
 * Parse tier limit string to number
 * Examples: "120度以下" → 120, "121-330度" → 210, "331-500度" → 170
 */
function parseTierLimit(tierString) {
  if (!tierString) return null

  // Match patterns like "120度以下", "121-330度", "501-700度"
  if (tierString.includes('以下')) {
    const match = tierString.match(/(\d+)度以下/)
    return match ? parseInt(match[1]) : null
  }

  if (tierString.includes('-')) {
    const match = tierString.match(/(\d+)-(\d+)度/)
    if (match) {
      const lower = parseInt(match[1])
      const upper = parseInt(match[2])
      return upper - lower + 1
    }
  }

  if (tierString.includes('以上')) {
    // For "701度以上" tier, use a reasonable limit (e.g., 500 kWh)
    return 500
  }

  return null
}

/**
 * Composable hook for power calculation
 */
export function usePowerCalculator() {
  return {
    reverseBillToKwh,
  }
}
