import { describe, it, expect } from 'vitest'
import {
  determineBillingSeason,
  checkCrossSeasonBoundary,
  isBoundaryDate
} from '../../../src/utils/billing-seasons.js'

describe('billing-seasons.js', () => {
  describe('determineBillingSeason', () => {
    it('should determine summer season for pure summer period (7/1-7/31)', () => {
      const result = determineBillingSeason('2024-07-01', '2024-07-31')
      expect(result).toBe('夏月')
    })

    it('should determine non-summer season for pure non-summer period (11/1-11/30)', () => {
      const result = determineBillingSeason('2024-11-01', '2024-11-30')
      expect(result).toBe('非夏月')
    })

    it('should determine non-summer for cross-season period with more non-summer days (5/15-6/14)', () => {
      // 5/15-5/31: 17 days (non-summer)
      // 6/1-6/14: 14 days (summer)
      // Result: non-summer (17 > 14)
      const result = determineBillingSeason('2024-05-15', '2024-06-14')
      expect(result).toBe('非夏月')
    })

    it('should determine summer for cross-season period with more summer days (6/15-7/15)', () => {
      // 6/15-6/30: 16 days (summer)
      // 7/1-7/15: 15 days (summer)
      // Total summer: 31 days
      const result = determineBillingSeason('2024-06-15', '2024-07-15')
      expect(result).toBe('夏月')
    })

    it('should use end date season when days are equal (5/31-6/1)', () => {
      // 5/31: 1 day (non-summer)
      // 6/1: 1 day (summer)
      // Days equal, use end date (6/1 = summer)
      const result = determineBillingSeason('2024-05-31', '2024-06-01')
      expect(result).toBe('夏月')
    })

    it('should handle boundary date 6/1 (summer start)', () => {
      const result = determineBillingSeason('2024-06-01', '2024-06-30')
      expect(result).toBe('夏月')
    })

    it('should handle boundary date 9/30 (summer end)', () => {
      const result = determineBillingSeason('2024-09-01', '2024-09-30')
      expect(result).toBe('夏月')
    })

    it('should handle boundary date 10/1 (non-summer start)', () => {
      const result = determineBillingSeason('2024-10-01', '2024-10-31')
      expect(result).toBe('非夏月')
    })

    it('should handle boundary date 5/31 (non-summer end)', () => {
      const result = determineBillingSeason('2024-05-01', '2024-05-31')
      expect(result).toBe('非夏月')
    })

    it('should handle cross-year period (12/15-1/15)', () => {
      const result = determineBillingSeason('2023-12-15', '2024-01-15')
      expect(result).toBe('非夏月')
    })

    it('should accept Date objects', () => {
      const start = new Date('2024-07-01')
      const end = new Date('2024-07-31')
      const result = determineBillingSeason(start, end)
      expect(result).toBe('夏月')
    })

    it('should throw error if startDate is missing', () => {
      expect(() => determineBillingSeason(null, '2024-07-31')).toThrow(
        'Both startDate and endDate parameters are required'
      )
    })

    it('should throw error if endDate is missing', () => {
      expect(() => determineBillingSeason('2024-07-01', null)).toThrow(
        'Both startDate and endDate parameters are required'
      )
    })

    it('should throw error if startDate is invalid', () => {
      expect(() => determineBillingSeason('invalid-date', '2024-07-31')).toThrow(
        'Invalid startDate provided'
      )
    })

    it('should throw error if endDate is invalid', () => {
      expect(() => determineBillingSeason('2024-07-01', 'invalid-date')).toThrow(
        'Invalid endDate provided'
      )
    })

    it('should throw error if startDate is after endDate', () => {
      expect(() => determineBillingSeason('2024-07-31', '2024-07-01')).toThrow(
        'startDate must be earlier than or equal to endDate'
      )
    })
  })

  describe('checkCrossSeasonBoundary', () => {
    it('should return true for period crossing from non-summer to summer (5/15-6/14)', () => {
      const result = checkCrossSeasonBoundary('2024-05-15', '2024-06-14')
      expect(result).toBe(true)
    })

    it('should return true for period crossing from summer to non-summer (9/15-10/15)', () => {
      const result = checkCrossSeasonBoundary('2024-09-15', '2024-10-15')
      expect(result).toBe(true)
    })

    it('should return false for pure summer period (7/1-7/31)', () => {
      const result = checkCrossSeasonBoundary('2024-07-01', '2024-07-31')
      expect(result).toBe(false)
    })

    it('should return false for pure non-summer period (11/1-11/30)', () => {
      const result = checkCrossSeasonBoundary('2024-11-01', '2024-11-30')
      expect(result).toBe(false)
    })

    it('should return false for period within same season (1/1-5/31)', () => {
      const result = checkCrossSeasonBoundary('2024-01-01', '2024-05-31')
      expect(result).toBe(false)
    })

    it('should return false for period within same season (10/1-12/31)', () => {
      const result = checkCrossSeasonBoundary('2024-10-01', '2024-12-31')
      expect(result).toBe(false)
    })

    it('should accept Date objects', () => {
      const start = new Date('2024-05-15')
      const end = new Date('2024-06-14')
      const result = checkCrossSeasonBoundary(start, end)
      expect(result).toBe(true)
    })

    it('should return false if startDate is missing', () => {
      const result = checkCrossSeasonBoundary(null, '2024-07-31')
      expect(result).toBe(false)
    })

    it('should return false if endDate is missing', () => {
      const result = checkCrossSeasonBoundary('2024-07-01', null)
      expect(result).toBe(false)
    })

    it('should return false if startDate is invalid', () => {
      const result = checkCrossSeasonBoundary('invalid-date', '2024-07-31')
      expect(result).toBe(false)
    })

    it('should return false if endDate is invalid', () => {
      const result = checkCrossSeasonBoundary('2024-07-01', 'invalid-date')
      expect(result).toBe(false)
    })
  })

  describe('isBoundaryDate', () => {
    it('should return true for 6/1 (summer start)', () => {
      const result = isBoundaryDate('2024-06-01')
      expect(result).toBe(true)
    })

    it('should return true for 9/30 (summer end)', () => {
      const result = isBoundaryDate('2024-09-30')
      expect(result).toBe(true)
    })

    it('should return true for 10/1 (non-summer start)', () => {
      const result = isBoundaryDate('2024-10-01')
      expect(result).toBe(true)
    })

    it('should return true for 5/31 (non-summer end)', () => {
      const result = isBoundaryDate('2024-05-31')
      expect(result).toBe(true)
    })

    it('should return false for non-boundary date (7/15)', () => {
      const result = isBoundaryDate('2024-07-15')
      expect(result).toBe(false)
    })

    it('should return false for non-boundary date (11/15)', () => {
      const result = isBoundaryDate('2024-11-15')
      expect(result).toBe(false)
    })

    it('should accept Date objects', () => {
      const date = new Date('2024-06-01')
      const result = isBoundaryDate(date)
      expect(result).toBe(true)
    })

    it('should return false for null', () => {
      const result = isBoundaryDate(null)
      expect(result).toBe(false)
    })

    it('should return false for invalid date', () => {
      const result = isBoundaryDate('invalid-date')
      expect(result).toBe(false)
    })
  })
})
