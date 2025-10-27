/**
 * iOS-Compatible PDF Generator
 * Uses pure jsPDF without html2canvas to avoid iOS canvas memory limitations
 */

import { jsPDF } from 'jspdf'
// Import autoTable plugin - it extends jsPDF prototype
import autoTable from 'jspdf-autotable'
import { generatePDFFilename, formatTaiwanDateTime } from './report-generator'
import logger from './logger'

/**
 * Load Chinese font for PDF
 * Since all CDN sources are unreliable, we'll skip font loading
 * and use a workaround: convert Chinese text to images where critical
 * @param {jsPDF} doc - jsPDF instance
 * @returns {Promise<boolean>} True if font loaded successfully
 */
async function loadChineseFont(doc) {
  try {
    logger.warn('⚠️ Using default font (Helvetica) for iOS PDF - English text only')
    logger.info('💡 iOS PDF will display in English due to font limitations')
    return false
  } catch (error) {
    logger.error('Font loading failed', { error: error.message })
    return false
  }
}

/**
 * Generate PDF report for iOS browsers
 * @param {HTMLElement} templateElement - The PDF template element (used for data extraction)
 * @param {Object} calculationStore - Calculation store with current data
 * @param {Object} historyStore - History store with records
 * @param {Array} chartImages - Array of {title, imageData} for charts
 * @returns {Promise<{success: boolean, duration: number}>}
 */
export async function generateIOSPDF(templateElement, calculationStore, historyStore, chartImages = []) {
  const startTime = performance.now()

  try {
    logger.info('Starting iOS-specific PDF generation')

    // Create PDF document (A4, portrait)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    // Load Chinese font (with fallback)
    const fontLoaded = await loadChineseFont(doc)

    // Page settings
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Set font to Chinese (NotoSansTC) if loaded, fallback to helvetica
    const fontName = fontLoaded ? 'NotoSansTC' : 'helvetica'
    const tableFontName = fontName // Use same font for tables
    try {
      doc.setFont(fontName, 'normal')
      if (!fontLoaded) {
        logger.warn('⚠️ Using default font (Helvetica) for iOS PDF')
      }
    } catch (e) {
      logger.warn('Font setting failed, using helvetica')
      doc.setFont('helvetica')
    }

    // ===== Header =====
    doc.setFontSize(20)
    doc.setTextColor(26, 115, 232) // Blue color
    doc.text('Water Resource Estimation Report', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text('Agricultural Water Usage Calculation Tool', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(`Report Generated: ${formatTaiwanDateTime()}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Draw line separator
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // ===== Input Parameters Section =====
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Input Parameters', margin, yPosition)
    yPosition += 8

    // Parameters table
    const billingPeriod = calculationStore.billingPeriodStart && calculationStore.billingPeriodEnd
      ? `${calculationStore.billingPeriodStart} ~ ${calculationStore.billingPeriodEnd}`
      : calculationStore.billingDate || 'Not set'

    const parametersData = [
      ['Electricity Bill', `${calculationStore.billAmount || 0} TWD`],
      ['Billing Period', billingPeriod],
      ['Electricity Type', `${calculationStore.electricityType}-${calculationStore.timePricingCategory || 'Standard'}`],
      ['Crop Type', calculationStore.cropType || 'Not selected'],
      ['Field Area', `${calculationStore.fieldArea || 0} m²`],
      ['Pump Horsepower', `${calculationStore.pumpHorsepower || 0} HP`],
      ['Pump Efficiency', `${((calculationStore.pumpEfficiency || 0) * 100).toFixed(0)}%`],
      ['Well Depth', `${calculationStore.wellDepth || 0} m`],
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: parametersData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: tableFontName,
        fontStyle: 'normal',
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'normal', fillColor: [249, 249, 249] },
        1: { cellWidth: contentWidth - 40 },
      },
      margin: { left: margin, right: margin },
    })

    yPosition = doc.lastAutoTable.finalY + 10

    // ===== Calculation Results Section =====
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = margin
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Calculation Results', margin, yPosition)
    yPosition += 8

    const resultsData = [
      ['Estimated Power Usage', `${calculationStore.calculatedKwh?.toFixed(2) || 0} kWh`],
      ['Water Flow Rate', `${calculationStore.waterFlowRate?.toFixed(2) || 0} L/min`],
      ['Monthly Water Volume', `${calculationStore.monthlyVolume?.toFixed(2) || 0} m³`],
      ['Data Source', calculationStore.pricingDataSource || 'Unknown'],
    ]

    if (calculationStore.isOverExtraction) {
      resultsData.push(['Warning', 'Possible over-extraction'])
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: resultsData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        font: tableFontName,
        fontStyle: 'normal',
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'normal', fillColor: [249, 249, 249] },
        1: { cellWidth: contentWidth - 40 },
      },
      margin: { left: margin, right: margin },
    })

    yPosition = doc.lastAutoTable.finalY + 10

    // ===== Historical Records Section =====
    if (historyStore && historyStore.recordCount > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = margin
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`Historical Records (Total: ${historyStore.recordCount})`, margin, yPosition)
      yPosition += 8

      // Prepare history table data (show latest 10 records)
      const recentRecords = historyStore.records.slice(0, 10)
      const historyTableData = recentRecords.map(record => [
        new Date(record.timestamp).toLocaleDateString('en-US'),
        `${record.billAmount || 0}`,
        `${record.calculatedKwh?.toFixed(1) || 0}`,
        `${record.monthlyVolume?.toFixed(1) || 0}`,
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Bill(TWD)', 'Power(kWh)', 'Water(m³)']],
        body: historyTableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          font: tableFontName,
          fontStyle: 'normal',
        },
        headStyles: {
          fillColor: [74, 144, 226],
          textColor: 255,
          fontStyle: 'normal',
          font: tableFontName,
        },
        margin: { left: margin, right: margin },
      })

      yPosition = doc.lastAutoTable.finalY + 10
    }

    // ===== Charts Section =====
    if (chartImages && chartImages.length > 0) {
      logger.info(`Embedding ${chartImages.length} charts`)

      for (const chart of chartImages) {
        // Check if need new page
        if (yPosition > pageHeight - 100) {
          doc.addPage()
          yPosition = margin
        }

        // Chart title
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(chart.title || 'Chart', margin, yPosition)
        yPosition += 8

        try {
          // Add image (chart.imageData should be base64 data URL)
          const imgWidth = contentWidth
          const imgHeight = (imgWidth * 3) / 4 // 4:3 aspect ratio

          doc.addImage(chart.imageData, 'PNG', margin, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 10
        } catch (error) {
          logger.error('Chart embedding failed', { error, chartTitle: chart.title })
          doc.setFontSize(10)
          doc.setTextColor(255, 0, 0)
          doc.text('(Chart loading failed)', margin, yPosition)
          yPosition += 10
        }
      }
    }

    // ===== Footer =====
    const footerY = pageHeight - 10
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `© ${new Date().getFullYear()} Water Resource Estimation Platform`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    )

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, { align: 'right' })
    }

    // Save PDF
    const filename = generatePDFFilename()
    doc.save(filename)

    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    logger.info(`iOS PDF generation successful, took ${duration} seconds`)

    return {
      success: true,
      duration: parseFloat(duration),
    }
  } catch (error) {
    logger.error('iOS PDF generation failed', { error })
    throw error
  }
}
