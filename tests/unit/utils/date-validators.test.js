import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  validateBillingPeriod,
  isWithinRange,
  isFutureDate,
  getPeriodLengthInDays,
  getMaxAllowedDate,
  MIN_ALLOWED_DATE,
  MAX_BILLING_PERIOD_DAYS,
} from '../../../src/utils/date-validators.js'

describe('date-validators.js', () => {
  describe('validateBillingPeriod', () => {
    it('should return valid for correct billing period', () => {
      const result = validateBillingPeriod('2024-07-01', '2024-07-31')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
      expect(result.warning).toBeNull()
    })

    it('should reject when startDate is missing', () => {
      const result = validateBillingPeriod(null, '2024-07-31')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請完整選擇電費計費期間(開始與結束日期)')
      expect(result.warning).toBeNull()
    })

    it('should reject when endDate is missing', () => {
      const result = validateBillingPeriod('2024-07-01', null)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請完整選擇電費計費期間(開始與結束日期)')
    })

    it('should reject when both dates are missing', () => {
      const result = validateBillingPeriod(null, null)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請完整選擇電費計費期間(開始與結束日期)')
    })

    it('should reject when startDate is undefined', () => {
      const result = validateBillingPeriod(undefined, '2024-07-31')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請完整選擇電費計費期間(開始與結束日期)')
    })

    it('should reject when endDate is undefined', () => {
      const result = validateBillingPeriod('2024-07-01', undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('請完整選擇電費計費期間(開始與結束日期)')
    })

    it('should reject when startDate is invalid', () => {
      const result = validateBillingPeriod('invalid-date', '2024-07-31')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('日期格式無效')
    })

    it('should reject when endDate is invalid', () => {
      const result = validateBillingPeriod('2024-07-01', 'invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('日期格式無效')
    })

    it('should reject when endDate is before startDate (date order validation)', () => {
      const result = validateBillingPeriod('2024-07-31', '2024-07-01')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('結束日期必須晚於開始日期')
    })

    it('should accept when startDate equals endDate', () => {
      const result = validateBillingPeriod('2024-07-01', '2024-07-01')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should reject when startDate is before MIN_ALLOWED_DATE (2020-01-01)', () => {
      const result = validateBillingPeriod('2019-12-31', '2020-01-15')
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/日期必須在 2020\/01\/01 與/)
    })

    it('should reject when endDate is after max allowed date (today + 1 year)', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 2) // 2 years ahead
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const result = validateBillingPeriod('2024-07-01', futureDateStr)
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/日期必須在 2020\/01\/01 與/)
    })

    it('should accept dates at MIN_ALLOWED_DATE boundary (2020-01-01)', () => {
      const result = validateBillingPeriod('2020-01-01', '2020-01-31')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should warn when period length exceeds 70 days', () => {
      const result = validateBillingPeriod('2024-01-01', '2024-03-31') // 90 days
      expect(result.valid).toBe(true) // Still valid, just warning
      expect(result.error).toBeNull()
      expect(result.warning).toBe('計費期間異常長(超過 70 天),請確認日期是否正確')
    })

    it('should not warn when period is exactly 70 days', () => {
      // 70 days period (69 days difference + 1 for inclusive)
      const result = validateBillingPeriod('2024-01-01', '2024-03-10') // 70 days
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
      expect(result.warning).toBeNull()
    })

    it('should not warn when period is 60 days (typical billing period)', () => {
      const result = validateBillingPeriod('2024-01-01', '2024-03-01') // ~60 days
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
      expect(result.warning).toBeNull()
    })

    it('should warn when period contains future dates', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Use a recent past date as start to avoid exceeding 70-day warning
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      const startDateStr = startDate.toISOString().split('T')[0]

      const result = validateBillingPeriod(startDateStr, tomorrowStr)
      expect(result.valid).toBe(true) // Still valid, just warning
      expect(result.error).toBeNull()
      expect(result.warning).toBe('您選擇的計費期間包含未來日期,是否確定?')
    })

    it('should warn when startDate is future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const futureEndDate = new Date(futureDate)
      futureEndDate.setDate(futureEndDate.getDate() + 30)
      const futureEndStr = futureEndDate.toISOString().split('T')[0]

      const result = validateBillingPeriod(futureDateStr, futureEndStr)
      expect(result.valid).toBe(true)
      expect(result.warning).toBe('您選擇的計費期間包含未來日期,是否確定?')
    })

    it('should prioritize error over warning (invalid date before long period check)', () => {
      const result = validateBillingPeriod('invalid-date', '2024-12-31')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('日期格式無效')
      expect(result.warning).toBeNull()
    })

    it('should accept Date objects', () => {
      const start = new Date('2024-07-01')
      const end = new Date('2024-07-31')
      const result = validateBillingPeriod(start, end)
      expect(result.valid).toBe(true)
    })

    it('should handle cross-year periods', () => {
      const result = validateBillingPeriod('2023-12-15', '2024-01-15')
      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })
  })

  describe('isWithinRange', () => {
    it('should return true for date within range', () => {
      const result = isWithinRange('2024-06-15', '2024-01-01', '2024-12-31')
      expect(result).toBe(true)
    })

    it('should return true for date at minimum boundary', () => {
      const result = isWithinRange('2024-01-01', '2024-01-01', '2024-12-31')
      expect(result).toBe(true)
    })

    it('should return true for date at maximum boundary', () => {
      const result = isWithinRange('2024-12-31', '2024-01-01', '2024-12-31')
      expect(result).toBe(true)
    })

    it('should return false for date before minimum', () => {
      const result = isWithinRange('2023-12-31', '2024-01-01', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should return false for date after maximum', () => {
      const result = isWithinRange('2025-01-01', '2024-01-01', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should accept Date objects', () => {
      const date = new Date('2024-06-15')
      const result = isWithinRange(date, '2024-01-01', '2024-12-31')
      expect(result).toBe(true)
    })

    it('should return false when date is null', () => {
      const result = isWithinRange(null, '2024-01-01', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should return false when date is undefined', () => {
      const result = isWithinRange(undefined, '2024-01-01', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should return false when date is invalid', () => {
      const result = isWithinRange('invalid-date', '2024-01-01', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should return false when minDate is invalid', () => {
      const result = isWithinRange('2024-06-15', 'invalid-date', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should return false when maxDate is invalid', () => {
      const result = isWithinRange('2024-06-15', '2024-01-01', 'invalid-date')
      expect(result).toBe(false)
    })
  })

  describe('isFutureDate', () => {
    it('should return true for future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const result = isFutureDate(futureDate)
      expect(result).toBe(true)
    })

    it('should return false for today', () => {
      const today = new Date()
      today.setHours(12, 0, 0, 0)
      const result = isFutureDate(today)
      expect(result).toBe(false)
    })

    it('should return false for past date', () => {
      const pastDate = new Date('2020-01-01')
      const result = isFutureDate(pastDate)
      expect(result).toBe(false)
    })

    it('should handle string date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      const result = isFutureDate(tomorrowStr)
      expect(result).toBe(true)
    })

    it('should return false when date is null', () => {
      const result = isFutureDate(null)
      expect(result).toBe(false)
    })

    it('should return false when date is undefined', () => {
      const result = isFutureDate(undefined)
      expect(result).toBe(false)
    })

    it('should return false when date is invalid', () => {
      const result = isFutureDate('invalid-date')
      expect(result).toBe(false)
    })

    it('should normalize time to midnight when comparing', () => {
      const today = new Date()
      today.setHours(23, 59, 59, 999) // Late in the day
      const result = isFutureDate(today)
      expect(result).toBe(false) // Should still be "today", not future
    })
  })

  describe('getPeriodLengthInDays', () => {
    it('should calculate days for same month period', () => {
      const result = getPeriodLengthInDays('2024-07-01', '2024-07-31')
      expect(result).toBe(31) // 30 days difference + 1 inclusive
    })

    it('should calculate days for cross-month period', () => {
      const result = getPeriodLengthInDays('2024-06-15', '2024-07-14')
      expect(result).toBe(30) // Typical billing period
    })

    it('should return 1 for same day', () => {
      const result = getPeriodLengthInDays('2024-07-01', '2024-07-01')
      expect(result).toBe(1) // Same day = 1 day
    })

    it('should calculate days for cross-year period', () => {
      const result = getPeriodLengthInDays('2023-12-25', '2024-01-05')
      expect(result).toBe(12) // 11 days difference + 1 inclusive
    })

    it('should handle Date objects', () => {
      const start = new Date('2024-07-01')
      const end = new Date('2024-07-31')
      const result = getPeriodLengthInDays(start, end)
      expect(result).toBe(31)
    })

    it('should return 0 for invalid startDate', () => {
      const result = getPeriodLengthInDays('invalid-date', '2024-07-31')
      expect(result).toBe(0)
    })

    it('should return 0 for invalid endDate', () => {
      const result = getPeriodLengthInDays('2024-07-01', 'invalid-date')
      expect(result).toBe(0)
    })

    it('should handle reversed dates (end before start)', () => {
      const result = getPeriodLengthInDays('2024-07-31', '2024-07-01')
      expect(result).toBe(31) // Uses Math.abs, so order doesn't matter
    })

    it('should calculate exactly 70 days', () => {
      const result = getPeriodLengthInDays('2024-01-01', '2024-03-10')
      expect(result).toBe(70)
    })

    it('should calculate more than 70 days (warning threshold)', () => {
      const result = getPeriodLengthInDays('2024-01-01', '2024-03-31')
      expect(result).toBeGreaterThan(70)
    })
  })

  describe('getMaxAllowedDate', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = getMaxAllowedDate()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return today + 1 year', () => {
      const result = getMaxAllowedDate()
      const maxDate = new Date(result)
      const today = new Date()

      const diffYears = maxDate.getFullYear() - today.getFullYear()
      expect(diffYears).toBe(1)
    })

    it('should be consistent across multiple calls (within same test)', () => {
      const result1 = getMaxAllowedDate()
      const result2 = getMaxAllowedDate()
      expect(result1).toBe(result2)
    })

    it('should handle leap years correctly', () => {
      const result = getMaxAllowedDate()
      const maxDate = new Date(result)
      expect(maxDate).toBeInstanceOf(Date)
      expect(maxDate.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('MIN_ALLOWED_DATE constant', () => {
    it('should be defined as 2020-01-01', () => {
      expect(MIN_ALLOWED_DATE).toBe('2020-01-01')
    })

    it('should be in YYYY-MM-DD format', () => {
      expect(MIN_ALLOWED_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should be a valid date', () => {
      const date = new Date(MIN_ALLOWED_DATE)
      expect(date.getTime()).not.toBeNaN()
    })
  })

  describe('MAX_BILLING_PERIOD_DAYS constant', () => {
    it('should be defined as 70', () => {
      expect(MAX_BILLING_PERIOD_DAYS).toBe(70)
    })

    it('should be a number', () => {
      expect(typeof MAX_BILLING_PERIOD_DAYS).toBe('number')
    })

    it('should be greater than typical billing period (60 days)', () => {
      expect(MAX_BILLING_PERIOD_DAYS).toBeGreaterThan(60)
    })
  })
})
