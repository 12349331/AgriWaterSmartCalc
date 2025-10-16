/**
 * useBillingPeriod Composable
 *
 * Encapsulates billing period validation, season determination,
 * and cross-season detection logic
 *
 * @returns {Object} Composable functions and reactive state
 */

import { ref, computed } from 'vue'
import {
  validateBillingPeriod,
  isWithinRange,
  isFutureDate,
  getPeriodLengthInDays,
  MIN_ALLOWED_DATE,
  getMaxAllowedDate,
  MAX_BILLING_PERIOD_DAYS,
} from '@/utils/date-validators'
import {
  determineBillingSeason,
  checkCrossSeasonBoundary,
} from '@/utils/billing-seasons'

/**
 * Billing Period Composable
 */
export function useBillingPeriod() {
  // Reactive state (optional, for standalone usage)
  const startDate = ref(null)
  const endDate = ref(null)

  /**
   * Validate billing period (順序、範圍、長度)
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {Object} { valid: boolean, error: string|null, warning: string|null }
   */
  function validatePeriod(start, end) {
    return validateBillingPeriod(start, end)
  }

  /**
   * Determine billing season (夏月/非夏月)
   * Based on date range, using majority rule for cross-season periods
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {string} '夏月' | '非夏月'
   */
  function determineSeason(start, end) {
    if (!start || !end) {
      return null
    }

    try {
      return determineBillingSeason(start, end)
    } catch (error) {
      console.error('[useBillingPeriod] Failed to determine season:', error)
      return null
    }
  }

  /**
   * Check if billing period crosses season boundary
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {boolean}
   */
  function checkCrossSeason(start, end) {
    if (!start || !end) {
      return false
    }

    return checkCrossSeasonBoundary(start, end)
  }

  /**
   * Get period length in days
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {number} 天數（含起始日）
   */
  function getPeriodLength(start, end) {
    return getPeriodLengthInDays(start, end)
  }

  /**
   * Check if period is too long (>70 days)
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {boolean}
   */
  function isLongPeriod(start, end) {
    const days = getPeriodLength(start, end)
    return days > MAX_BILLING_PERIOD_DAYS
  }

  /**
   * Check if period includes future dates
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {boolean}
   */
  function hasFutureDates(start, end) {
    return isFutureDate(start) || isFutureDate(end)
  }

  /**
   * Comprehensive validation with all checks
   * @param {string} start - 起始日期 (YYYY-MM-DD)
   * @param {string} end - 結束日期 (YYYY-MM-DD)
   * @returns {Object} Validation result with details
   */
  function validateComprehensive(start, end) {
    const baseValidation = validatePeriod(start, end)

    if (!baseValidation.valid) {
      return baseValidation
    }

    // Additional checks
    const crossSeason = checkCrossSeason(start, end)
    const season = determineSeason(start, end)
    const periodDays = getPeriodLength(start, end)
    const longPeriod = isLongPeriod(start, end)
    const futureDates = hasFutureDates(start, end)

    return {
      valid: true,
      error: null,
      warning: baseValidation.warning,
      season,
      crossSeason,
      periodDays,
      longPeriod,
      futureDates,
    }
  }

  // Computed properties (for reactive usage)
  const currentSeason = computed(() => {
    if (!startDate.value || !endDate.value) {
      return null
    }
    return determineSeason(startDate.value, endDate.value)
  })

  const isCrossSeason = computed(() => {
    if (!startDate.value || !endDate.value) {
      return false
    }
    return checkCrossSeason(startDate.value, endDate.value)
  })

  const validationResult = computed(() => {
    return validatePeriod(startDate.value, endDate.value)
  })

  const isValid = computed(() => {
    return validationResult.value.valid
  })

  return {
    // State
    startDate,
    endDate,

    // Computed
    currentSeason,
    isCrossSeason,
    validationResult,
    isValid,

    // Methods
    validatePeriod,
    determineSeason,
    checkCrossSeason,
    getPeriodLength,
    isLongPeriod,
    hasFutureDates,
    validateComprehensive,
  }
}
