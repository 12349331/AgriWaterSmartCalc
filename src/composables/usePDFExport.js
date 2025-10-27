/**
 * PDF 匯出功能 Composable
 * 提供 PDF 報告生成、下載和錯誤處理功能
 * 支援 iOS 瀏覽器（使用純 jsPDF）和其他瀏覽器（使用 html2pdf.js）
 */

import { ref } from 'vue'
import html2pdf from 'html2pdf.js'
import { generatePDFOptions } from '@/utils/report-generator'
import { generateIOSPDF } from '@/utils/ios-pdf-generator'
import { shouldUseIOSPDFGenerator, getBrowserInfo } from '@/utils/browser-detector'
import logger from '@/utils/logger'

export function usePDFExport() {
  const isGenerating = ref(false)
  const error = ref(null)

  /**
   * 生成並下載 PDF 報告
   * @param {HTMLElement} templateElement - PDF 模板 DOM 元素
   * @param {Object} options - 選項 { calculationStore, historyStore, chartImages }
   * @returns {Promise<{success: boolean, duration: number}>}
   */
  async function generatePDF(templateElement, options = {}) {
    if (!templateElement) {
      const errorMsg = 'PDF 模板元素不存在'
      logger.error(errorMsg)
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    isGenerating.value = true
    error.value = null

    const startTime = performance.now()

    try {
      // Detect browser and log info
      const browserInfo = getBrowserInfo()
      logger.info('瀏覽器資訊', browserInfo)

      // Choose PDF generation strategy based on browser
      if (shouldUseIOSPDFGenerator()) {
        logger.info('Using iOS-specific PDF generator (English version)')

        // iOS: Use pure jsPDF (no canvas)
        const { calculationStore, historyStore, chartImages } = options

        if (!calculationStore) {
          throw new Error('iOS PDF generation requires calculationStore')
        }

        const result = await generateIOSPDF(
          templateElement,
          calculationStore,
          historyStore,
          chartImages,
        )

        return result
      } else {
        logger.info('Using standard html2pdf.js generator')

        // Desktop/Android: Use html2pdf.js
        const pdfOptions = generatePDFOptions()

        await html2pdf()
          .set(pdfOptions)
          .from(templateElement)
          .save()

        const endTime = performance.now()
        const duration = ((endTime - startTime) / 1000).toFixed(2)

        logger.info(`PDF 報告生成成功，耗時 ${duration} 秒`)

        return {
          success: true,
          duration: parseFloat(duration),
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'PDF 生成失敗'
      logger.error('PDF 生成失敗', { error: err })
      error.value = errorMsg
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * 清除錯誤狀態
   */
  function clearError() {
    error.value = null
  }

  return {
    isGenerating,
    error,
    generatePDF,
    clearError,
  }
}
