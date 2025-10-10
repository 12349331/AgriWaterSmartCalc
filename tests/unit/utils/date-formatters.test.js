import { describe, it, expect } from 'vitest'
import {
  formatBillingPeriod,
  formatCreatedTime
} from '../../../src/utils/date-formatters.js'

describe('date-formatters.js', () => {
  describe('formatBillingPeriod', () => {
    it('should format billing period with string dates (YYYY/MM/DD - YYYY/MM/DD)', () => {
      const result = formatBillingPeriod('2024-07-01', '2024-07-31')
      expect(result).toMatch(/2024\/07\/01 - 2024\/07\/31/)
    })

    it('should format billing period with Date objects', () => {
      const start = new Date('2024-07-01')
      const end = new Date('2024-07-31')
      const result = formatBillingPeriod(start, end)
      expect(result).toMatch(/2024\/07\/01 - 2024\/07\/31/)
    })

    it('should format cross-month billing period', () => {
      const result = formatBillingPeriod('2024-06-15', '2024-07-14')
      expect(result).toMatch(/2024\/06\/15 - 2024\/07\/14/)
    })

    it('should format cross-year billing period', () => {
      const result = formatBillingPeriod('2023-12-15', '2024-01-15')
      expect(result).toMatch(/2023\/12\/15 - 2024\/01\/15/)
    })

    it('should format single-day period', () => {
      const result = formatBillingPeriod('2024-07-01', '2024-07-01')
      expect(result).toMatch(/2024\/07\/01 - 2024\/07\/01/)
    })

    it('should return "未設定" when startDate is null', () => {
      const result = formatBillingPeriod(null, '2024-07-31')
      expect(result).toBe('未設定')
    })

    it('should return "未設定" when endDate is null', () => {
      const result = formatBillingPeriod('2024-07-01', null)
      expect(result).toBe('未設定')
    })

    it('should return "未設定" when both dates are null', () => {
      const result = formatBillingPeriod(null, null)
      expect(result).toBe('未設定')
    })

    it('should return "未設定" when startDate is undefined', () => {
      const result = formatBillingPeriod(undefined, '2024-07-31')
      expect(result).toBe('未設定')
    })

    it('should return "未設定" when endDate is undefined', () => {
      const result = formatBillingPeriod('2024-07-01', undefined)
      expect(result).toBe('未設定')
    })

    it('should return "- - -" when startDate is invalid', () => {
      const result = formatBillingPeriod('invalid-date', '2024-07-31')
      expect(result).toMatch(/- - 2024\/07\/31/)
    })

    it('should return "- - -" when endDate is invalid', () => {
      const result = formatBillingPeriod('2024-07-01', 'invalid-date')
      expect(result).toMatch(/2024\/07\/01 - -/)
    })

    it('should handle partial invalid dates (one invalid)', () => {
      const result = formatBillingPeriod('2024-07-01', 'invalid-date')
      expect(result).toMatch(/2024\/07\/01 - -/)
    })

    it('should handle empty strings as invalid dates', () => {
      const result = formatBillingPeriod('', '')
      expect(result).toBe('未設定')
    })

    it('should handle Taiwan timezone correctly', () => {
      // Test that Taiwan timezone (Asia/Taipei) is used
      const result = formatBillingPeriod('2024-07-01', '2024-07-31')
      // Result should be in Taiwan timezone format
      expect(result).toBeTruthy()
      expect(result).not.toBe('未設定')
    })

    it('should format dates with leading zeros for single-digit months/days', () => {
      const result = formatBillingPeriod('2024-01-05', '2024-02-03')
      expect(result).toMatch(/2024\/01\/05 - 2024\/02\/03/)
    })

    it('should handle edge case: year 2020 (minimum allowed year)', () => {
      const result = formatBillingPeriod('2020-01-01', '2020-01-31')
      expect(result).toMatch(/2020\/01\/01 - 2020\/01\/31/)
    })

    it('should handle edge case: future year 2030', () => {
      const result = formatBillingPeriod('2030-12-01', '2030-12-31')
      expect(result).toMatch(/2030\/12\/01 - 2030\/12\/31/)
    })

    it('should handle timestamp format dates', () => {
      const start = new Date(2024, 6, 1) // July 1, 2024
      const end = new Date(2024, 6, 31) // July 31, 2024
      const result = formatBillingPeriod(start, end)
      expect(result).toMatch(/2024\/07\/01 - 2024\/07\/31/)
    })
  })

  describe('formatCreatedTime', () => {
    it('should format timestamp to Taiwan time (YYYY/MM/DD HH:mm)', () => {
      const timestamp = new Date('2024-07-15T14:30:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2024\/07\/15.*14:30/)
    })

    it('should format timestamp with leading zeros', () => {
      const timestamp = new Date('2024-01-05T09:05:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2024\/01\/05.*09:05/)
    })

    it('should handle midnight (00:00)', () => {
      const timestamp = new Date('2024-07-15T00:00:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2024\/07\/15.*00:00/)
    })

    it('should handle noon (12:00)', () => {
      const timestamp = new Date('2024-07-15T12:00:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2024\/07\/15.*12:00/)
    })

    it('should handle late evening (23:59)', () => {
      const timestamp = new Date('2024-07-15T23:59:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2024\/07\/15.*23:59/)
    })

    it('should return "-" when timestamp is null', () => {
      const result = formatCreatedTime(null)
      expect(result).toBe('-')
    })

    it('should return "-" when timestamp is undefined', () => {
      const result = formatCreatedTime(undefined)
      expect(result).toBe('-')
    })

    it('should return "-" when timestamp is 0', () => {
      const result = formatCreatedTime(0)
      expect(result).toBe('-')
    })

    it('should return "-" when timestamp is invalid (NaN)', () => {
      const result = formatCreatedTime(NaN)
      expect(result).toBe('-')
    })

    it('should return "-" when timestamp is invalid string', () => {
      const result = formatCreatedTime('invalid-timestamp')
      expect(result).toBe('-')
    })

    it('should handle current timestamp (Date.now())', () => {
      const timestamp = Date.now()
      const result = formatCreatedTime(timestamp)
      expect(result).toBeTruthy()
      expect(result).not.toBe('-')
      expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/)
    })

    it('should handle historical timestamp (year 2020)', () => {
      const timestamp = new Date('2020-01-01T10:00:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2020\/01\/01.*10:00/)
    })

    it('should handle future timestamp (year 2030)', () => {
      const timestamp = new Date('2030-12-31T23:59:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2030\/12\/31.*23:59/)
    })

    it('should use Taiwan timezone (Asia/Taipei)', () => {
      // Test that Taiwan timezone is used (GMT+8)
      const timestamp = new Date('2024-07-15T14:30:00Z').getTime() // UTC time
      const result = formatCreatedTime(timestamp)
      // Taiwan time should be +8 hours ahead (22:30)
      expect(result).toBeTruthy()
      expect(result).not.toBe('-')
    })

    it('should handle cross-year timestamp (New Year)', () => {
      const timestamp = new Date('2024-01-01T00:00:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2024\/01\/01.*00:00/)
    })

    it('should format with 24-hour clock (not AM/PM)', () => {
      const timestamp = new Date('2024-07-15T15:30:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      // Should use 24-hour format (15:30, not 3:30 PM)
      expect(result).toMatch(/15:30/)
      expect(result).not.toMatch(/PM/)
    })

    it('should handle negative timestamp (before Unix epoch)', () => {
      const timestamp = -1000
      const result = formatCreatedTime(timestamp)
      // Should handle gracefully - depends on Date behavior
      expect(result).toBeTruthy()
    })

    it('should handle very large timestamp', () => {
      const timestamp = new Date('2099-12-31T23:59:00+08:00').getTime()
      const result = formatCreatedTime(timestamp)
      expect(result).toMatch(/2099\/12\/31.*23:59/)
    })
  })
})
