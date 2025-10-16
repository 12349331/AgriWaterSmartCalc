import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatVolume,
  formatFlowRate,
  formatKwh,
} from '@/utils/formatters'

describe('Formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with default decimals', () => {
      expect(formatNumber(1234.5678)).toBe('1234.57')
      expect(formatNumber(1234.5)).toBe('1234.50')
    })

    it('should format numbers with custom decimals', () => {
      expect(formatNumber(1234.5678, 1)).toBe('1234.6')
      expect(formatNumber(1234.5678, 3)).toBe('1234.568')
    })

    it('should handle invalid input', () => {
      expect(formatNumber(NaN)).toBe('-')
      expect(formatNumber('abc')).toBe('-')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in TWD', () => {
      expect(formatCurrency(1234.56)).toBe('NT$ 1,234.56')
      expect(formatCurrency(1000)).toBe('NT$ 1,000')
    })

    it('should handle invalid input', () => {
      expect(formatCurrency(NaN)).toBe('-')
    })
  })

  describe('formatDate', () => {
    it('should format date in Traditional Chinese', () => {
      const date = new Date('2024-03-15').getTime()
      const formatted = formatDate(date)
      expect(formatted).toContain('2024')
      expect(formatted).toContain('3')
      expect(formatted).toContain('15')
    })

    it('should handle missing timestamp', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime in Traditional Chinese', () => {
      const date = new Date('2024-03-15T14:30:00').getTime()
      const formatted = formatDateTime(date)
      expect(formatted).toContain('2024')
      expect(formatted).toContain('03')
      expect(formatted).toContain('15')
      expect(formatted).toContain('30')
    })

    it('should handle missing timestamp', () => {
      expect(formatDateTime(null)).toBe('-')
    })
  })

  describe('formatVolume', () => {
    it('should format volume with unit', () => {
      expect(formatVolume(1234.5678)).toBe('1234.57 m³')
      expect(formatVolume(1000)).toBe('1000.00 m³')
    })

    it('should handle invalid input', () => {
      expect(formatVolume(NaN)).toBe('-')
    })
  })

  describe('formatFlowRate', () => {
    it('should format flow rate with unit', () => {
      expect(formatFlowRate(12.345)).toBe('12.35 L/s')
      expect(formatFlowRate(0.5)).toBe('0.50 L/s')
    })

    it('should handle invalid input', () => {
      expect(formatFlowRate(NaN)).toBe('-')
    })
  })

  describe('formatKwh', () => {
    it('should format kWh with unit', () => {
      expect(formatKwh(123.456)).toBe('123.5 kWh')
      expect(formatKwh(500)).toBe('500.0 kWh')
    })

    it('should handle invalid input', () => {
      expect(formatKwh(NaN)).toBe('-')
    })
  })
})
