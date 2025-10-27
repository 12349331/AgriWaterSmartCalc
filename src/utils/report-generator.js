/**
 * PDF 報告生成器工具函數
 * 提供 PDF 檔案命名和配置物件生成功能
 */

/**
 * 生成 PDF 檔案名稱（含時間戳）
 * 格式：水資源估算報告_YYYYMMDD_HHMM.pdf
 * @returns {string} PDF 檔案名稱
 */
export function generatePDFFilename() {
  const now = new Date()

  // 台灣時區 (GMT+8)
  const taiwanOffset = 8 * 60 // 分鐘
  const localTime = new Date(now.getTime() + taiwanOffset * 60 * 1000)

  const year = localTime.getUTCFullYear()
  const month = String(localTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(localTime.getUTCDate()).padStart(2, '0')
  const hours = String(localTime.getUTCHours()).padStart(2, '0')
  const minutes = String(localTime.getUTCMinutes()).padStart(2, '0')

  return `水資源估算報告_${year}${month}${day}_${hours}${minutes}.pdf`
}

/**
 * 生成 html2pdf.js 配置物件
 * @returns {Object} html2pdf.js 配置物件
 */
export function generatePDFOptions() {
  return {
    margin: [10, 10, 10, 10], // 上、右、下、左邊距（mm）
    filename: generatePDFFilename(),
    image: {
      type: 'jpeg',
      quality: 0.95,
    },
    html2canvas: {
      scale: 2, // 提高解析度，確保圖表清晰
      useCORS: true, // 允許跨域圖片
      logging: false, // 關閉 html2canvas 的 console 輸出
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait', // 直向
      compress: true, // 壓縮 PDF 檔案大小
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  }
}

/**
 * 格式化台灣時區的日期時間字串
 * @param {Date} date - 日期物件
 * @returns {string} 格式化後的日期時間字串（YYYY年MM月DD日 HH:mm）
 */
export function formatTaiwanDateTime(date = new Date()) {
  const taiwanOffset = 8 * 60
  const localTime = new Date(date.getTime() + taiwanOffset * 60 * 1000)

  const year = localTime.getUTCFullYear()
  const month = String(localTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(localTime.getUTCDate()).padStart(2, '0')
  const hours = String(localTime.getUTCHours()).padStart(2, '0')
  const minutes = String(localTime.getUTCMinutes()).padStart(2, '0')

  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}
