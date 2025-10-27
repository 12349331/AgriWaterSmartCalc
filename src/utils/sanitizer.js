/**
 * 轉義 HTML 特殊字元，防止 XSS 攻擊
 * 將所有可能被瀏覽器解釋為 HTML 的字元轉換為安全的 HTML 實體
 * @param {string} text - 要轉義的文字
 * @returns {string} - 轉義後的安全文字
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return text
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return text.replace(/[&<>"'/]/g, char => htmlEscapeMap[char])
}

/**
 * 淨化使用者輸入的文字，防止 XSS 攻擊
 * 使用 DOM API 來移除所有 HTML 標籤，只保留純文字內容
 * @param {string} input - 使用者輸入的文字
 * @returns {string} - 淨化後的安全文字
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  // 第一步：移除危險的標籤及其內容（script, style, iframe等）
  let cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
  
  // 第二步：使用 DOM API 來移除剩餘的 HTML 標籤，保留純文字
  const temp = document.createElement('div')
  temp.innerHTML = cleaned
  
  // 取得純文字內容，這會自動移除所有 HTML 標籤
  // 例如：'<b>粗體</b>文字' -> '粗體文字'
  return temp.textContent || temp.innerText || ''
}

/**
 * 淨化物件中的所有字串欄位
 * @param {Object} obj - 要淨化的物件
 * @param {Array<string>} fields - 需要淨化的欄位名稱
 * @returns {Object} - 淨化後的物件
 */
export function sanitizeObject(obj, fields) {
  const sanitized = { ...obj }
  fields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field])
    }
  })
  return sanitized
}

/**
 * 淨化陣列中的所有字串元素
 * @param {Array} arr - 要淨化的陣列
 * @returns {Array} - 淨化後的陣列
 */
export function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return arr
  return arr.map(item => {
    if (typeof item === 'string') {
      return sanitizeInput(item)
    }
    return item
  })
}

