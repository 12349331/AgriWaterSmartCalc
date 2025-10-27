import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generatePDFFilename,
  generatePDFOptions,
  formatTaiwanDateTime,
} from '@/utils/report-generator'

describe('report-generator', () => {
  describe('generatePDFFilename', () => {
    beforeEach(() => {
      // Mock Date to have predictable tests
      vi.useFakeTimers()
    })

    it('should generate filename with correct format', () => {
      // Set mock date to 2025-10-27 14:30:00 UTC
      // Taiwan time (GMT+8) would be 2025-10-27 22:30:00
      vi.setSystemTime(new Date('2025-10-27T14:30:00Z'))

      const filename = generatePDFFilename()
      expect(filename).toBe('水資源估算報告_20251027_2230.pdf')
    })

    it('should use Taiwan timezone (GMT+8)', () => {
      // Set mock date to 2025-10-27 16:00:00 UTC
      // Taiwan time (GMT+8) would be 2025-10-28 00:00:00 (next day)
      vi.setSystemTime(new Date('2025-10-27T16:00:00Z'))

      const filename = generatePDFFilename()
      expect(filename).toBe('水資源估算報告_20251028_0000.pdf')
    })

    it('should pad single-digit months and days with zeros', () => {
      // 2025-03-05 01:09:00 UTC -> 2025-03-05 09:09:00 Taiwan
      vi.setSystemTime(new Date('2025-03-05T01:09:00Z'))

      const filename = generatePDFFilename()
      expect(filename).toBe('水資源估算報告_20250305_0909.pdf')
    })

    it('should generate different filenames for different times', () => {
      vi.setSystemTime(new Date('2025-10-27T14:30:00Z'))
      const filename1 = generatePDFFilename()

      vi.setSystemTime(new Date('2025-10-27T14:31:00Z'))
      const filename2 = generatePDFFilename()

      expect(filename1).not.toBe(filename2)
    })
  })

  describe('generatePDFOptions', () => {
    it('should return complete options object', () => {
      const options = generatePDFOptions()

      expect(options).toBeDefined()
      expect(options).toHaveProperty('margin')
      expect(options).toHaveProperty('filename')
      expect(options).toHaveProperty('image')
      expect(options).toHaveProperty('html2canvas')
      expect(options).toHaveProperty('jsPDF')
      expect(options).toHaveProperty('pagebreak')
    })

    it('should set correct margin values (10mm all sides)', () => {
      const options = generatePDFOptions()
      expect(options.margin).toEqual([10, 10, 10, 10])
    })

    it('should include filename with correct format', () => {
      const options = generatePDFOptions()
      expect(options.filename).toMatch(/^水資源估算報告_\d{8}_\d{4}\.pdf$/)
    })

    it('should configure image settings correctly', () => {
      const options = generatePDFOptions()
      expect(options.image.type).toBe('jpeg')
      expect(options.image.quality).toBe(0.95)
    })

    it('should configure html2canvas with scale 2', () => {
      const options = generatePDFOptions()
      expect(options.html2canvas.scale).toBe(2)
      expect(options.html2canvas.useCORS).toBe(true)
      expect(options.html2canvas.logging).toBe(false)
    })

    it('should configure jsPDF for A4 portrait with compression', () => {
      const options = generatePDFOptions()
      expect(options.jsPDF.unit).toBe('mm')
      expect(options.jsPDF.format).toBe('a4')
      expect(options.jsPDF.orientation).toBe('portrait')
      expect(options.jsPDF.compress).toBe(true)
    })

    it('should configure pagebreak mode', () => {
      const options = generatePDFOptions()
      expect(options.pagebreak.mode).toEqual(['avoid-all', 'css', 'legacy'])
    })
  })

  describe('formatTaiwanDateTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should format date in Chinese style (YYYY年MM月DD日 HH:mm)', () => {
      // 2025-10-27 14:30:00 UTC -> 2025-10-27 22:30:00 Taiwan
      const date = new Date('2025-10-27T14:30:00Z')
      const formatted = formatTaiwanDateTime(date)

      expect(formatted).toBe('2025年10月27日 22:30')
    })

    it('should pad single-digit months, days, hours, and minutes', () => {
      // 2025-03-05 01:09:00 UTC -> 2025-03-05 09:09:00 Taiwan
      const date = new Date('2025-03-05T01:09:00Z')
      const formatted = formatTaiwanDateTime(date)

      expect(formatted).toBe('2025年03月05日 09:09')
    })

    it('should handle date crossing midnight in Taiwan timezone', () => {
      // 2025-10-27 16:00:00 UTC -> 2025-10-28 00:00:00 Taiwan (next day)
      const date = new Date('2025-10-27T16:00:00Z')
      const formatted = formatTaiwanDateTime(date)

      expect(formatted).toBe('2025年10月28日 00:00')
    })

    it('should use current date when no parameter provided', () => {
      vi.setSystemTime(new Date('2025-10-27T14:30:00Z'))
      const formatted = formatTaiwanDateTime()

      expect(formatted).toBe('2025年10月27日 22:30')
    })

    it('should handle year-end date correctly', () => {
      // 2025-12-31 16:00:00 UTC -> 2026-01-01 00:00:00 Taiwan (next year)
      const date = new Date('2025-12-31T16:00:00Z')
      const formatted = formatTaiwanDateTime(date)

      expect(formatted).toBe('2026年01月01日 00:00')
    })
  })
})
