import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePDFExport } from '@/composables/usePDFExport'

// Mock html2pdf.js
vi.mock('html2pdf.js', () => {
  return {
    default: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      save: vi.fn().mockResolvedValue(undefined),
    })),
  }
})

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock report-generator
vi.mock('@/utils/report-generator', () => ({
  generatePDFOptions: vi.fn(() => ({
    margin: [10, 10, 10, 10],
    filename: 'test-report.pdf',
  })),
}))

describe('usePDFExport', () => {
  let html2pdf
  let logger
  let generatePDFOptions

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    html2pdf = (await import('html2pdf.js')).default
    logger = (await import('@/utils/logger')).default
    generatePDFOptions = (await import('@/utils/report-generator')).generatePDFOptions
  })

  describe('composable initialization', () => {
    it('should return correct properties and methods', () => {
      const { isGenerating, error, generatePDF, clearError } = usePDFExport()

      expect(isGenerating).toBeDefined()
      expect(isGenerating.value).toBe(false)
      expect(error).toBeDefined()
      expect(error.value).toBe(null)
      expect(typeof generatePDF).toBe('function')
      expect(typeof clearError).toBe('function')
    })
  })

  describe('generatePDF', () => {
    it('should throw error when templateElement is null', async () => {
      const { generatePDF, error } = usePDFExport()

      await expect(generatePDF(null)).rejects.toThrow('PDF 模板元素不存在')
      expect(error.value).toBe('PDF 模板元素不存在')
      expect(logger.error).toHaveBeenCalledWith('PDF 模板元素不存在')
    })

    it('should throw error when templateElement is undefined', async () => {
      const { generatePDF, error } = usePDFExport()

      await expect(generatePDF(undefined)).rejects.toThrow('PDF 模板元素不存在')
      expect(error.value).toBe('PDF 模板元素不存在')
    })

    it('should set isGenerating to true during PDF generation', async () => {
      const { generatePDF, isGenerating } = usePDFExport()
      const mockElement = document.createElement('div')

      const promise = generatePDF(mockElement)
      expect(isGenerating.value).toBe(true)

      await promise
      expect(isGenerating.value).toBe(false)
    })

    it('should clear error state before generating', async () => {
      const { generatePDF, error } = usePDFExport()
      const mockElement = document.createElement('div')

      // Set initial error
      error.value = 'Previous error'

      await generatePDF(mockElement)
      expect(error.value).toBe(null)
    })

    it('should call generatePDFOptions to get configuration', async () => {
      const { generatePDF } = usePDFExport()
      const mockElement = document.createElement('div')

      await generatePDF(mockElement)

      expect(generatePDFOptions).toHaveBeenCalledTimes(1)
    })

    it('should call html2pdf with correct chain', async () => {
      const { generatePDF } = usePDFExport()
      const mockElement = document.createElement('div')

      const mockHtml2pdf = {
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockResolvedValue(undefined),
      }
      html2pdf.mockReturnValue(mockHtml2pdf)

      await generatePDF(mockElement)

      expect(html2pdf).toHaveBeenCalledTimes(1)
      expect(mockHtml2pdf.set).toHaveBeenCalledWith({
        margin: [10, 10, 10, 10],
        filename: 'test-report.pdf',
      })
      expect(mockHtml2pdf.from).toHaveBeenCalledWith(mockElement)
      expect(mockHtml2pdf.save).toHaveBeenCalledTimes(1)
    })

    it('should log info messages at start and completion', async () => {
      const { generatePDF } = usePDFExport()
      const mockElement = document.createElement('div')

      await generatePDF(mockElement)

      expect(logger.info).toHaveBeenCalledWith('開始生成 PDF 報告')
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('PDF 報告生成成功，耗時'))
    })

    it('should return success result with duration', async () => {
      const { generatePDF } = usePDFExport()
      const mockElement = document.createElement('div')

      vi.setSystemTime(0)
      const resultPromise = generatePDF(mockElement)

      // Simulate 1500ms passing
      vi.advanceTimersByTime(1500)
      const result = await resultPromise

      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('duration')
      expect(typeof result.duration).toBe('number')
    })

    it('should handle html2pdf errors correctly', async () => {
      const { generatePDF, error, isGenerating } = usePDFExport()
      const mockElement = document.createElement('div')

      const testError = new Error('PDF generation failed')
      const mockHtml2pdf = {
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue(testError),
      }
      html2pdf.mockReturnValue(mockHtml2pdf)

      await expect(generatePDF(mockElement)).rejects.toThrow('PDF generation failed')

      expect(error.value).toBe('PDF generation failed')
      expect(isGenerating.value).toBe(false)
      expect(logger.error).toHaveBeenCalledWith('PDF 生成失敗', { error: testError })
    })

    it('should handle errors without message property', async () => {
      const { generatePDF, error } = usePDFExport()
      const mockElement = document.createElement('div')

      const mockHtml2pdf = {
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue({}), // Error without message
      }
      html2pdf.mockReturnValue(mockHtml2pdf)

      await expect(generatePDF(mockElement)).rejects.toBeDefined()
      expect(error.value).toBe('PDF 生成失敗')
    })

    it('should reset isGenerating even if error occurs', async () => {
      const { generatePDF, isGenerating } = usePDFExport()
      const mockElement = document.createElement('div')

      const mockHtml2pdf = {
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        save: vi.fn().mockRejectedValue(new Error('Test error')),
      }
      html2pdf.mockReturnValue(mockHtml2pdf)

      try {
        await generatePDF(mockElement)
      } catch (e) {
        // Expected to throw
      }

      expect(isGenerating.value).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      const { error, clearError } = usePDFExport()

      error.value = 'Some error'
      expect(error.value).toBe('Some error')

      clearError()
      expect(error.value).toBe(null)
    })

    it('should do nothing if error is already null', () => {
      const { error, clearError } = usePDFExport()

      expect(error.value).toBe(null)
      clearError()
      expect(error.value).toBe(null)
    })
  })
})
