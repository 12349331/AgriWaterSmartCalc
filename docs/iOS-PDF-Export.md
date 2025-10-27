# iOS PDF Export Feature

## Overview

This feature provides iOS-compatible PDF export functionality for the AquaMetrics water resource estimation platform.

## Problem

iOS browsers (Safari, Chrome, Brave, etc.) have strict canvas memory and size limitations that cause the standard `html2pdf.js` library to fail:

- Canvas memory limit: 384MB (iOS 15+)
- Canvas area limit: 16,777,216 pixels

These limitations prevent PDF generation using canvas-based rendering on iOS devices.

## Solution

We implemented a dual-strategy approach:

### Desktop/Android Browsers
- Continue using `html2pdf.js` (with full Chinese text support)
- Renders high-quality PDFs with Chinese characters

### iOS Browsers
- Use pure `jsPDF` without canvas rendering
- **English-only PDF reports** to avoid font compatibility issues
- Bypasses iOS canvas limitations completely

## Implementation

### Key Files

1. **`src/utils/browser-detector.js`**
   - Detects iOS browsers (iPhone, iPad, iPod)
   - Handles iPadOS detection (reports as MacIntel with touch support)

2. **`src/utils/ios-pdf-generator.js`**
   - Generates PDFs using pure jsPDF (no canvas)
   - Creates English-language reports with:
     - Header section
     - Input parameters table
     - Calculation results table
     - Historical records table (latest 10 records)
     - Embedded chart images
     - Page numbers and footer

3. **`src/composables/usePDFExport.js`**
   - Branch logic: checks browser type
   - Routes to appropriate PDF generator

4. **`src/App.vue`**
   - Converts ECharts to images before PDF generation
   - Passes calculation and history stores to iOS generator

## Usage

Users on iOS devices will see:
- Same PDF export button as other platforms
- PDF downloads successfully
- **Report displayed in English** (due to font limitations)

Desktop/Android users will see:
- PDF export button
- PDF downloads successfully
- **Report displayed in Chinese** (full native language support)

## Technical Details

### Browser Detection
```javascript
function isIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isIOSDevice || isIPadOS
}
```

### PDF Generation Flow (iOS)
1. Detect iOS browser using `shouldUseIOSPDFGenerator()`
2. Create jsPDF document (A4, portrait)
3. Use Helvetica font (default, supports English/numbers)
4. Manually draw content sections:
   - Text headers
   - Tables using `jspdf-autotable`
   - Images for charts
5. Save PDF file

### Why English-only on iOS?

jsPDF requires TTF/OTF fonts with proper unicode mapping for Chinese characters. However:
- Modern CDNs only serve WOFF/WOFF2 fonts (web-optimized)
- TTF files are 5-10MB in size (not suitable for CDN)
- Loading TTF fonts from external sources fails due to CORS/403/404 errors
- Embedding fonts in the app would significantly increase bundle size

Therefore, we chose **Option C**: Keep iOS PDF export functional with English text only.

## Future Improvements

Possible enhancements:
1. Bundle a lightweight Chinese TTF font (if bundle size is acceptable)
2. Generate bilingual reports (English + Chinese)
3. Allow users to choose report language
4. Server-side PDF generation with full font support

## Testing

To test iOS PDF export:
1. Open the app on an iOS device (iPhone/iPad)
2. Input calculation parameters
3. Click "匯出 PDF" button
4. Verify PDF downloads successfully
5. Open PDF and confirm English text is readable

To test desktop PDF export:
1. Open the app on a desktop browser
2. Input calculation parameters
3. Click "匯出 PDF" button
4. Verify PDF downloads successfully
5. Open PDF and confirm Chinese text is readable

## Dependencies

- `jspdf`: ^2.5.2 - Core PDF generation library
- `jspdf-autotable`: ^5.0.2 - Table generation plugin
- `html2pdf.js`: ^0.12.1 - Desktop/Android PDF generation (with canvas)
- `html2canvas`: ^1.4.1 - Used by html2pdf.js for rendering

## Changelog

### 2025-10-28
- Initial implementation of iOS PDF export
- Added browser detection utilities
- Implemented English-only PDF generation for iOS
- Preserved Chinese PDF support for desktop/Android
