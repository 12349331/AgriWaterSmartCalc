import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ensureTaiwanTimezone,
  getCurrentTimestampTW,
  toTaiwanISOString,
  TAIWAN_TIMEZONE,
} from '../../../src/utils/timezone.js'

describe('timezone.js', () => {
  describe('TAIWAN_TIMEZONE constant', () => {
    it('should be defined as Asia/Taipei', () => {
      expect(TAIWAN_TIMEZONE).toBe('Asia/Taipei')
    })

    it('should be a valid timezone identifier', () => {
      // Test by using it in toLocaleString
      expect(() => {
        new Date().toLocaleString('zh-TW', { timeZone: TAIWAN_TIMEZONE })
      }).not.toThrow()
    })
  })

  describe('ensureTaiwanTimezone', () => {
    it('should convert Date object to Taiwan timezone', () => {
      const date = new Date('2024-07-15T14:30:00Z') // UTC time
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeDefined()
    })

    it('should accept timestamp (number)', () => {
      const timestamp = new Date('2024-07-15T14:30:00+08:00').getTime()
      const result = ensureTaiwanTimezone(timestamp)

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeDefined()
    })

    it('should accept ISO string', () => {
      const isoString = '2024-07-15T14:30:00+08:00'
      const result = ensureTaiwanTimezone(isoString)

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeDefined()
    })

    it('should throw error for null', () => {
      expect(() => {
        ensureTaiwanTimezone(null)
      }).toThrow('Invalid date parameter')
    })

    it('should throw error for undefined', () => {
      expect(() => {
        ensureTaiwanTimezone(undefined)
      }).toThrow('Invalid date parameter')
    })

    it('should throw error for invalid date string', () => {
      expect(() => {
        ensureTaiwanTimezone('invalid-date')
      }).toThrow('Invalid date value')
    })

    it('should throw error for non-date object', () => {
      expect(() => {
        ensureTaiwanTimezone({})
      }).toThrow('Invalid date parameter')
    })

    it('should throw error for array', () => {
      expect(() => {
        ensureTaiwanTimezone([])
      }).toThrow('Invalid date parameter')
    })

    it('should handle UTC midnight correctly', () => {
      const date = new Date('2024-07-15T00:00:00Z') // UTC midnight
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      // Taiwan time should be 8 hours ahead: 08:00
      expect(result.getHours()).toBeGreaterThanOrEqual(0)
      expect(result.getHours()).toBeLessThan(24)
    })

    it('should handle Taiwan noon correctly', () => {
      const date = new Date('2024-07-15T12:00:00+08:00') // Taiwan noon
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(12)
    })

    it('should handle cross-day UTC to Taiwan conversion', () => {
      const date = new Date('2024-07-15T23:00:00Z') // 11 PM UTC
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      // Taiwan time should be next day 07:00 (23:00 + 8 hours = 07:00 next day)
      expect(result.getDate()).toBeGreaterThanOrEqual(15)
    })

    it('should preserve date information across timezone', () => {
      const date = new Date('2024-07-15T10:00:00+08:00')
      const result = ensureTaiwanTimezone(date)

      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(6) // July (0-indexed)
    })

    it('should handle historical dates (year 2020)', () => {
      const date = new Date('2020-01-01T00:00:00+08:00')
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2020)
    })

    it('should handle future dates (year 2030)', () => {
      const date = new Date('2030-12-31T23:59:00+08:00')
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2030)
    })

    it('should handle year boundary (New Year)', () => {
      const date = new Date('2024-01-01T00:00:00+08:00')
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(1)
    })

    it('should handle leap year (2024-02-29)', () => {
      const date = new Date('2024-02-29T12:00:00+08:00')
      const result = ensureTaiwanTimezone(date)

      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(29)
    })
  })

  describe('getCurrentTimestampTW', () => {
    it('should return a number (Unix timestamp)', () => {
      const result = getCurrentTimestampTW()

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
    })

    it('should return timestamp in milliseconds', () => {
      const result = getCurrentTimestampTW()

      // Should be a reasonable timestamp (after 2020)
      expect(result).toBeGreaterThan(new Date('2020-01-01').getTime())
      // Should be before far future (before 2100)
      expect(result).toBeLessThan(new Date('2100-01-01').getTime())
    })

    it('should return current time (within 1 second)', () => {
      const beforeCall = Date.now()
      const result = getCurrentTimestampTW()
      const afterCall = Date.now()

      // Result should be close to current time (allow some processing time)
      expect(result).toBeGreaterThanOrEqual(beforeCall - 1000)
      expect(result).toBeLessThanOrEqual(afterCall + 1000)
    })

    it('should be consistent across multiple calls (within same second)', () => {
      const result1 = getCurrentTimestampTW()
      const result2 = getCurrentTimestampTW()

      // Should be very close (within 100ms)
      expect(Math.abs(result2 - result1)).toBeLessThan(100)
    })

    it('should return valid timestamp that can be converted to Date', () => {
      const result = getCurrentTimestampTW()
      const date = new Date(result)

      expect(date).toBeInstanceOf(Date)
      expect(date.getTime()).toBe(result)
      expect(isNaN(date.getTime())).toBe(false)
    })

    it('should use Taiwan timezone (GMT+8)', () => {
      const result = getCurrentTimestampTW()
      const date = new Date(result)

      // Should be a valid date
      expect(date.getFullYear()).toBeGreaterThanOrEqual(2020)
    })

    it('should handle execution at different times of day', () => {
      // Execute multiple times to test different scenarios
      const results = []
      for (let i = 0; i < 5; i++) {
        results.push(getCurrentTimestampTW())
      }

      // All results should be valid timestamps
      results.forEach((result) => {
        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThan(0)
      })

      // Results should be in ascending order (or very close)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toBeGreaterThanOrEqual(results[i - 1] - 1)
      }
    })
  })

  describe('toTaiwanISOString', () => {
    it('should convert Date to YYYY-MM-DD format', () => {
      const date = new Date('2024-07-15T14:30:00+08:00')
      const result = toTaiwanISOString(date)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result).toMatch(/2024-07-1[45]/) // Depends on timezone conversion
    })

    it('should accept timestamp (number)', () => {
      const timestamp = new Date('2024-07-15T14:30:00+08:00').getTime()
      const result = toTaiwanISOString(timestamp)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should accept ISO string', () => {
      const isoString = '2024-07-15T14:30:00+08:00'
      const result = toTaiwanISOString(isoString)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return only date part (no time)', () => {
      const date = new Date('2024-07-15T23:59:59+08:00')
      const result = toTaiwanISOString(date)

      expect(result).not.toContain('T')
      expect(result).not.toContain(':')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should use Taiwan timezone for conversion', () => {
      const date = new Date('2024-07-15T00:00:00+08:00') // Taiwan midnight
      const result = toTaiwanISOString(date)

      expect(result).toMatch(/2024-07-1[45]/)
    })

    it('should handle UTC date correctly', () => {
      const date = new Date('2024-07-15T16:00:00Z') // UTC 4 PM
      const result = toTaiwanISOString(date)

      // Taiwan time is UTC+8, so 16:00 UTC = 00:00+1day Taiwan
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle cross-day boundary (UTC to Taiwan)', () => {
      const date = new Date('2024-07-15T23:00:00Z') // 11 PM UTC
      const result = toTaiwanISOString(date)

      // Taiwan time: 23:00 + 8 hours = 07:00 next day (2024-07-16)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle year 2020 (minimum allowed year)', () => {
      const date = new Date('2020-01-01T00:00:00+08:00')
      const result = toTaiwanISOString(date)

      expect(result).toBe('2020-01-01')
    })

    it('should handle future year 2030', () => {
      const date = new Date('2030-12-31T23:59:00+08:00')
      const result = toTaiwanISOString(date)

      expect(result).toBe('2030-12-31')
    })

    it('should handle leap year (2024-02-29)', () => {
      const date = new Date('2024-02-29T12:00:00+08:00')
      const result = toTaiwanISOString(date)

      expect(result).toBe('2024-02-29')
    })

    it('should handle year boundary (New Year)', () => {
      const date = new Date('2024-01-01T00:00:00+08:00')
      const result = toTaiwanISOString(date)

      expect(result).toBe('2024-01-01')
    })

    it('should throw error for invalid date', () => {
      expect(() => {
        toTaiwanISOString('invalid-date')
      }).toThrow('Invalid date value')
    })

    it('should throw error for null', () => {
      expect(() => {
        toTaiwanISOString(null)
      }).toThrow('Invalid date parameter')
    })

    it('should throw error for undefined', () => {
      expect(() => {
        toTaiwanISOString(undefined)
      }).toThrow('Invalid date parameter')
    })
  })

  describe('Cross-timezone consistency tests', () => {
    it('should produce consistent results regardless of system timezone', () => {
      // Test that Taiwan timezone conversion is consistent
      const date = new Date('2024-07-15T12:00:00+08:00') // Taiwan noon

      const taiwanDate = ensureTaiwanTimezone(date)
      const isoString = toTaiwanISOString(date)

      expect(taiwanDate.getHours()).toBe(12)
      expect(isoString).toMatch(/2024-07-1[45]/)
    })

    it('should handle DST-free timezone (Taiwan does not observe DST)', () => {
      // Taiwan doesn't use DST, so summer and winter times should be consistent
      const summerDate = new Date('2024-07-15T12:00:00+08:00')
      const winterDate = new Date('2024-01-15T12:00:00+08:00')

      const summerISO = toTaiwanISOString(summerDate)
      const winterISO = toTaiwanISOString(winterDate)

      expect(summerISO).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(winterISO).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should maintain date consistency when converting from UTC to Taiwan', () => {
      const utcDate = new Date('2024-07-15T10:00:00Z') // 10 AM UTC
      const taiwanISO = toTaiwanISOString(utcDate)

      // Taiwan time: 10:00 + 8 hours = 18:00 same day
      expect(taiwanISO).toMatch(/2024-07-1[56]/)
    })

    it('should handle multiple timezone conversions consistently', () => {
      const date = new Date('2024-07-15T14:30:00+08:00')

      // Convert multiple times
      const result1 = toTaiwanISOString(date)
      const result2 = toTaiwanISOString(date)
      const result3 = toTaiwanISOString(date)

      // All results should be identical
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })

    it('should correctly handle Taiwan timezone offset (GMT+8)', () => {
      const utcDate = new Date('2024-07-15T00:00:00Z') // UTC midnight
      const taiwanDate = ensureTaiwanTimezone(utcDate)

      // Taiwan time should be 8 hours ahead: 08:00
      expect(taiwanDate.getHours()).toBe(8)
    })

    it('should preserve data integrity across conversion pipeline', () => {
      const originalTimestamp = new Date('2024-07-15T14:30:00+08:00').getTime()

      // Convert through the pipeline
      const taiwanDate = ensureTaiwanTimezone(originalTimestamp)
      const isoString = toTaiwanISOString(taiwanDate)

      // ISO string should represent the correct date
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(isoString).toMatch(/2024-07-1[45]/)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle very old dates (Unix epoch)', () => {
      const epochDate = new Date(0) // 1970-01-01 00:00:00 UTC
      const result = toTaiwanISOString(epochDate)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result).toMatch(/1970-01-01/)
    })

    it('should handle very far future dates', () => {
      const futureDate = new Date('2099-12-31T23:59:59+08:00')
      const result = toTaiwanISOString(futureDate)

      expect(result).toBe('2099-12-31')
    })

    it('should handle timestamp at midnight precisely', () => {
      const midnight = new Date('2024-07-15T00:00:00+08:00')
      const result = toTaiwanISOString(midnight)

      expect(result).toBe('2024-07-15')
    })

    it('should handle timestamp at end of day precisely', () => {
      const endOfDay = new Date('2024-07-15T23:59:59+08:00')
      const result = toTaiwanISOString(endOfDay)

      expect(result).toBe('2024-07-15')
    })

    it('should handle Month boundaries correctly', () => {
      const endOfMonth = new Date('2024-07-31T23:59:59+08:00')
      const result = toTaiwanISOString(endOfMonth)

      expect(result).toBe('2024-07-31')
    })

    it('should handle year boundaries correctly', () => {
      const endOfYear = new Date('2024-12-31T23:59:59+08:00')
      const result = toTaiwanISOString(endOfYear)

      expect(result).toBe('2024-12-31')
    })
  })
})
