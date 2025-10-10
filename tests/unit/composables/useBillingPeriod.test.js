/**
 * useBillingPeriod.test.js
 * Unit tests for useBillingPeriod composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBillingPeriod } from '@/composables/useBillingPeriod'

describe('useBillingPeriod Composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-07-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('validatePeriod', () => {
    it('should return error for incomplete period (missing start)', () => {
      const { validatePeriod } = useBillingPeriod()
      const result = validatePeriod(null, '2024-07-31')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('請完整選擇')
    })

    it('should return error for incomplete period (missing end)', () => {
      const { validatePeriod } = useBillingPeriod()
      const result = validatePeriod('2024-07-01', null)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('請完整選擇')
    })

    it('should return error when end before start', () => {
      const { validatePeriod } = useBillingPeriod()
      const result = validatePeriod('2024-07-15', '2024-07-01')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('結束日期必須晚於開始日期')
    })

    it('should return warning for long period (>70 days)', () => {
      const { validatePeriod } = useBillingPeriod()
      const result = validatePeriod('2024-01-01', '2024-04-01')

      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
      expect(result.warning).toContain('計費期間異常長')
      expect(result.warning).toContain('70 天')
    })

    it('should return warning for future dates', () => {
      const { validatePeriod } = useBillingPeriod()
      const result = validatePeriod('2024-08-01', '2024-08-31')

      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
      expect(result.warning).toContain('未來日期')
    })

    it('should return valid for normal period', () => {
      const { validatePeriod } = useBillingPeriod()
      // Use past dates to avoid future date warning (current fake time is 2024-07-15)
      const result = validatePeriod('2024-06-01', '2024-06-30')

      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
      expect(result.warning).toBeNull()
    })
  })

  describe('determineSeason', () => {
    it('should determine summer season (7/1-7/31)', () => {
      const { determineSeason } = useBillingPeriod()
      const season = determineSeason('2024-07-01', '2024-07-31')

      expect(season).toBe('夏月')
    })

    it('should determine non-summer season (11/1-11/30)', () => {
      const { determineSeason } = useBillingPeriod()
      const season = determineSeason('2024-11-01', '2024-11-30')

      expect(season).toBe('非夏月')
    })

    it('should determine season for cross-season period (5/15-6/14) as non-summer', () => {
      const { determineSeason } = useBillingPeriod()
      const season = determineSeason('2024-05-15', '2024-06-14')

      // 31 days in May/June: 17 days non-summer (5/15-5/31) vs 14 days summer (6/1-6/14)
      expect(season).toBe('非夏月')
    })

    it('should return null for invalid dates', () => {
      const { determineSeason } = useBillingPeriod()
      const season = determineSeason(null, null)

      expect(season).toBeNull()
    })
  })

  describe('checkCrossSeason', () => {
    it('should detect cross-season (5/15-6/14)', () => {
      const { checkCrossSeason } = useBillingPeriod()
      const isCross = checkCrossSeason('2024-05-15', '2024-06-14')

      expect(isCross).toBe(true)
    })

    it('should detect cross-season (9/30-10/1)', () => {
      const { checkCrossSeason } = useBillingPeriod()
      const isCross = checkCrossSeason('2024-09-30', '2024-10-01')

      expect(isCross).toBe(true)
    })

    it('should not detect cross-season for same-season period (7/1-7/31)', () => {
      const { checkCrossSeason } = useBillingPeriod()
      const isCross = checkCrossSeason('2024-07-01', '2024-07-31')

      expect(isCross).toBe(false)
    })

    it('should not detect cross-season for same-season period (11/1-11/30)', () => {
      const { checkCrossSeason } = useBillingPeriod()
      const isCross = checkCrossSeason('2024-11-01', '2024-11-30')

      expect(isCross).toBe(false)
    })
  })

  describe('getPeriodLength', () => {
    it('should calculate period length (31 days)', () => {
      const { getPeriodLength } = useBillingPeriod()
      const days = getPeriodLength('2024-07-01', '2024-07-31')

      expect(days).toBe(31)
    })

    it('should calculate period length (91 days)', () => {
      const { getPeriodLength } = useBillingPeriod()
      const days = getPeriodLength('2024-01-01', '2024-04-01')

      expect(days).toBe(92) // Including both start and end dates
    })

    it('should calculate period length (1 day)', () => {
      const { getPeriodLength } = useBillingPeriod()
      const days = getPeriodLength('2024-07-01', '2024-07-01')

      expect(days).toBe(1)
    })
  })

  describe('isLongPeriod', () => {
    it('should return true for period >70 days', () => {
      const { isLongPeriod } = useBillingPeriod()
      const isLong = isLongPeriod('2024-01-01', '2024-04-01')

      expect(isLong).toBe(true)
    })

    it('should return false for period <=70 days', () => {
      const { isLongPeriod } = useBillingPeriod()
      const isLong = isLongPeriod('2024-07-01', '2024-07-31')

      expect(isLong).toBe(false)
    })
  })

  describe('hasFutureDates', () => {
    it('should return true for future period', () => {
      const { hasFutureDates } = useBillingPeriod()
      const hasFuture = hasFutureDates('2024-08-01', '2024-08-31')

      expect(hasFuture).toBe(true)
    })

    it('should return false for past period', () => {
      const { hasFutureDates } = useBillingPeriod()
      const hasFuture = hasFutureDates('2024-06-01', '2024-06-30')

      expect(hasFuture).toBe(false)
    })
  })

  describe('validateComprehensive', () => {
    it('should return comprehensive validation with all details', () => {
      const { validateComprehensive } = useBillingPeriod()
      const result = validateComprehensive('2024-05-15', '2024-06-14')

      expect(result.valid).toBe(true)
      expect(result.season).toBe('非夏月')
      expect(result.crossSeason).toBe(true)
      expect(result.periodDays).toBeGreaterThan(0)
      expect(result.longPeriod).toBeDefined()
      expect(result.futureDates).toBeDefined()
    })
  })

  describe('Reactive state', () => {
    it('should provide reactive startDate and endDate', () => {
      const { startDate, endDate } = useBillingPeriod()

      expect(startDate.value).toBeNull()
      expect(endDate.value).toBeNull()

      startDate.value = '2024-07-01'
      endDate.value = '2024-07-31'

      expect(startDate.value).toBe('2024-07-01')
      expect(endDate.value).toBe('2024-07-31')
    })

    it('should provide computed currentSeason', () => {
      const { startDate, endDate, currentSeason } = useBillingPeriod()

      startDate.value = '2024-07-01'
      endDate.value = '2024-07-31'

      expect(currentSeason.value).toBe('夏月')
    })

    it('should provide computed isCrossSeason', () => {
      const { startDate, endDate, isCrossSeason } = useBillingPeriod()

      startDate.value = '2024-05-15'
      endDate.value = '2024-06-14'

      expect(isCrossSeason.value).toBe(true)
    })

    it('should provide computed validationResult', () => {
      const { startDate, endDate, validationResult } = useBillingPeriod()

      startDate.value = '2024-07-01'
      endDate.value = '2024-07-31'

      expect(validationResult.value.valid).toBe(true)
    })

    it('should provide computed isValid', () => {
      const { startDate, endDate, isValid } = useBillingPeriod()

      startDate.value = '2024-07-01'
      endDate.value = '2024-07-31'

      expect(isValid.value).toBe(true)
    })
  })
})
