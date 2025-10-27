/**
 * Noto Sans TC Font Loader for jsPDF
 * Uses jsDelivr CDN to load Traditional Chinese font in TTF format
 */

import logger from '@/utils/logger'

/**
 * Load Noto Sans TC font from CDN (TTF format for jsPDF compatibility)
 * @returns {Promise<string>} Base64 encoded font data
 */
export async function loadNotoSansTCFont() {
  try {
    logger.info('開始從 CDN 載入 Noto Sans TC 字型 (TTF 格式)...')

    // Try multiple font sources in order of preference
    const fontUrls = [
      // Option 1: Fontsource via unpkg (most reliable for web fonts)
      'https://unpkg.com/@fontsource/noto-sans-tc@5.0.18/files/noto-sans-tc-chinese-traditional-400-normal.ttf',
      // Option 2: Fontsource via jsDelivr
      'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tc@5.0.18/files/noto-sans-tc-chinese-traditional-400-normal.ttf',
      // Option 3: Alternative GitHub raw (Noto CJK project)
      'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansTC-Regular.otf',
      // Option 4: Font CDN (fontmeme backup)
      'https://fontmeme.com/fonts/download/117738/noto-sans-tc.regular.ttf',
    ]

    let lastError = null

    for (const fontUrl of fontUrls) {
      try {
        logger.info(`嘗試載入字型: ${fontUrl}`)

        const response = await fetch(fontUrl, {
          mode: 'cors',
          cache: 'default',
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // Get the font as ArrayBuffer
        const fontArrayBuffer = await response.arrayBuffer()

        // Convert ArrayBuffer to Base64
        const base64String = arrayBufferToBase64(fontArrayBuffer)

        logger.info(`✅ 字型載入成功 (TTF)，大小: ${(base64String.length / 1024).toFixed(2)} KB`)

        return base64String
      } catch (error) {
        lastError = error
        logger.warn(`字型來源失敗: ${error.message}，嘗試下一個來源...`)
        continue
      }
    }

    throw lastError || new Error('所有字型來源都失敗')
  } catch (error) {
    logger.error('字型載入失敗', { error: error.message })
    throw error
  }
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param {ArrayBuffer} buffer
 * @returns {string} Base64 string
 */
function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}

/**
 * Alternative: Load font from Google Fonts CDN (TTF format)
 * @returns {Promise<string>} Base64 encoded font data
 */
export async function loadNotoSansTCFromGoogleFonts() {
  try {
    logger.info('從 Google Fonts CDN 載入字型...')

    // Use direct link to Noto Sans TC Regular TTF from GitHub
    const fontUrl = 'https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/TC/NotoSansTC-Regular.otf'

    const response = await fetch(fontUrl, {
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`字型載入失敗: ${response.status}`)
    }

    const fontArrayBuffer = await response.arrayBuffer()
    const base64String = arrayBufferToBase64(fontArrayBuffer)

    logger.info(`✅ Google Fonts 字型載入成功`)

    return base64String
  } catch (error) {
    logger.error('Google Fonts 字型載入失敗', { error: error.message })
    throw error
  }
}
