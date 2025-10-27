/**
 * 簡易資料編碼/解碼工具
 * 使用 Base64 編碼防止直接讀取 localStorage 資料
 */

export function encodeData(data) {
  try {
    const json = JSON.stringify(data)
    return btoa(unescape(encodeURIComponent(json)))
  } catch (error) {
    console.error('編碼失敗:', error)
    return null
  }
}

export function decodeData(encoded) {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)))
    return JSON.parse(decoded)
  } catch (error) {
    // 可能是舊格式（明文），嘗試直接解析
    try {
      return JSON.parse(encoded)
    } catch {
      console.error('解碼失敗:', error)
      return null
    }
  }
}

