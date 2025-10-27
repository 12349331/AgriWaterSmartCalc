/**
 * Browser Detection Utility
 * Detects iOS browsers (Safari, Chrome, Brave, etc.) to determine PDF generation strategy
 */

/**
 * Check if the current browser is running on iOS
 * @returns {boolean} True if running on iOS (iPhone, iPad, iPod)
 */
export function isIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase()

  // Check for iOS devices
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)

  // Check for iPad on iOS 13+ (reports as MacIntel)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  return isIOSDevice || isIPadOS
}

/**
 * Check if the current browser is Safari on iOS
 * @returns {boolean} True if running Safari on iOS
 */
export function isIOSSafari() {
  if (!isIOS()) return false

  const userAgent = window.navigator.userAgent.toLowerCase()

  // Safari on iOS contains "safari" but not "chrome", "crios", "fxios", etc.
  const isSafari = userAgent.includes('safari') &&
                   !userAgent.includes('chrome') &&
                   !userAgent.includes('crios') &&
                   !userAgent.includes('fxios')

  return isSafari
}

/**
 * Check if the current browser is Chrome on iOS (CriOS)
 * @returns {boolean} True if running Chrome on iOS
 */
export function isIOSChrome() {
  if (!isIOS()) return false

  const userAgent = window.navigator.userAgent.toLowerCase()
  return userAgent.includes('crios')
}

/**
 * Check if the current browser is Brave on iOS
 * Note: Brave on iOS is difficult to detect reliably, as it uses WebKit like Safari
 * This function checks for known Brave indicators
 * @returns {boolean} True if likely running Brave on iOS
 */
export function isIOSBrave() {
  if (!isIOS()) return false

  // Brave has navigator.brave API on desktop, but not reliably on iOS
  // We check for it anyway
  if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
    return true
  }

  // Fallback: treat as generic iOS browser
  return false
}

/**
 * Check if the current browser should use iOS-compatible PDF generation
 * This includes all iOS browsers (Safari, Chrome, Brave, Firefox, etc.)
 * because they all use WebKit and share the same canvas limitations
 * @returns {boolean} True if should use iOS-compatible PDF generation
 */
export function shouldUseIOSPDFGenerator() {
  return isIOS()
}

/**
 * Get browser information for debugging
 * @returns {Object} Browser information
 */
export function getBrowserInfo() {
  return {
    isIOS: isIOS(),
    isIOSSafari: isIOSSafari(),
    isIOSChrome: isIOSChrome(),
    isIOSBrave: isIOSBrave(),
    shouldUseIOSPDFGenerator: shouldUseIOSPDFGenerator(),
    userAgent: window.navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  }
}
