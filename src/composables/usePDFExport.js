/**
 * PDF 匯出功能 Composable
 * 提供 PDF 報告生成、下載和錯誤處理功能
 */

import { ref } from 'vue'
import html2pdf from 'html2pdf.js'
import { generatePDFOptions } from '@/utils/report-generator'
import logger from '@/utils/logger'

export function usePDFExport() {
  const isGenerating = ref(false)
  const error = ref(null)

  /**
   * 生成並下載 PDF 報告
   * @param {HTMLElement} templateElement - PDF 模板 DOM 元素
   * @returns {Promise<void>}
   */
  async function generatePDF(templateElement) {
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
      logger.info('開始生成 PDF 報告')

      const options = generatePDFOptions()

      // 使用 html2pdf.js 生成 PDF
      await html2pdf()
        .set(options)
        .from(templateElement)
        .save()

      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      logger.info(`PDF 報告生成成功，耗時 ${duration} 秒`)

      return {
        success: true,
        duration: parseFloat(duration),
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
