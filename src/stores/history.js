import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import logger from '@/utils/logger'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentTimestampTW } from '../utils/timezone' // T024: Import timezone utility
import { sanitizeObject } from '@/utils/sanitizer'
import { encodeData, decodeData } from '@/utils/dataEncoder'

export const useHistoryStore = defineStore('history', () => {
  // State
  const records = ref([])
  const currentSortKey = ref('timestamp') // T024: Default sort key
  const sortDirection = ref('desc')     // T024: Default sort direction

  // Getters
  const recordCount = computed(() => records.value.length)

  const sortedRecords = computed(() => { // T024: Modify to support dual-field sorting
    return [...records.value].sort((a, b) => {
      let valA, valB

      // Handle sorting by billing period start or created timestamp
      if (currentSortKey.value === 'billingPeriodStart') {
        // Ensure billingPeriodStart exists, fallback to 0 for missing values to avoid errors
        valA = a.billingPeriodStart ? new Date(a.billingPeriodStart).getTime() : 0
        valB = b.billingPeriodStart ? new Date(b.billingPeriodStart).getTime() : 0
      } else { // Default or 'timestamp'
        valA = a.timestamp
        valB = b.timestamp
      }

      if (sortDirection.value === 'asc') {
        return valA - valB
      } else {
        return valB - valA
      }
    })
  })

  const getRecordById = computed(() => (id) => {
    return records.value.find((r) => r.id === id)
  })

  const filterByDateRange = computed(() => (startDate, endDate) => {
    if (!startDate && !endDate) {
      return records.value
    }

    return records.value.filter((record) => {
      const recordDate = record.billingPeriodStart ? new Date(record.billingPeriodStart) : null

      if (!recordDate) return false // Records without billingPeriodStart are excluded from date filtering

      let isAfterStart = true
      let isBeforeEnd = true

      if (startDate) {
        const start = new Date(startDate)
        isAfterStart = recordDate >= start
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Include full end day
        isBeforeEnd = recordDate <= end
      }

      return isAfterStart && isBeforeEnd
    })
  })

  const statsSummary = computed(() => (filteredRecords) => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return {
        recordCount: 0,
        avgWaterVolume: 0,
        totalKwh: 0,
      }
    }

    const recordCount = filteredRecords.length
    const totalMonthlyVolume = filteredRecords.reduce((sum, record) => sum + (record.monthlyVolume || 0), 0)
    const totalCalculatedKwh = filteredRecords.reduce((sum, record) => sum + (record.calculatedKwh || 0), 0)

    const avgWaterVolume = totalMonthlyVolume / recordCount

    return {
      recordCount,
      avgWaterVolume,
      totalKwh: totalCalculatedKwh,
    }
  })

  const getRecordsByCrop = computed(() => (cropType) => {
    return records.value.filter((r) => r.cropType === cropType)
  })

  // Actions
  function addRecord(recordData) { // T024: Modify to include billingPeriodStart & billingPeriodEnd
    // 淨化使用者可輸入的文字欄位，防止 XSS 攻擊
    const sanitizedData = sanitizeObject(recordData, [
      'cropType',
      'region',
      'notes',
      'pricingType',
    ])

    const newRecord = {
      id: uuidv4(),
      timestamp: getCurrentTimestampTW(), // Use getCurrentTimestampTW() for GMT+8 (FR-013)
      billingPeriodStart: recordData.billingPeriodStart || null, // Ensure these fields are saved
      billingPeriodEnd: recordData.billingPeriodEnd || null,     // Can be null if not provided
      ...sanitizedData,
    }

    records.value.push(newRecord)
    saveToLocalStorage()

    return newRecord
  }

  function updateRecord(id, updates) {
    const index = records.value.findIndex((r) => r.id === id)

    if (index === -1) {
      throw new Error('Record not found')
    }

    // 淨化更新的資料，防止 XSS 攻擊
    const sanitizedUpdates = sanitizeObject(updates, [
      'cropType',
      'region',
      'notes',
      'pricingType',
    ])

    records.value[index] = {
      ...records.value[index],
      ...sanitizedUpdates,
      updatedAt: getCurrentTimestampTW(), // Use for GMT+8
    }

    saveToLocalStorage()
    return records.value[index]
  }

  function deleteRecord(id) {
    const index = records.value.findIndex((r) => r.id === id)

    if (index === -1) {
      throw new Error('Record not found')
    }

    records.value.splice(index, 1)
    saveToLocalStorage()
  }

  function clearAllRecords() {
    records.value = []
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    try {
      const encoded = encodeData(records.value)
      if (encoded) {
        localStorage.setItem('aquametrics_history', encoded)
      } else {
        throw new Error('編碼失敗')
      }
    } catch (error) {
      logger.error('Failed to save to localStorage:', error)
      throw new Error('儲存失敗，可能空間不足')
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aquametrics_history')
      if (saved) {
        const decoded = decodeData(saved)
        if (decoded && Array.isArray(decoded)) {
          // 淨化載入的資料，防止手動修改 localStorage 注入惡意內容
          records.value = decoded.map(record => ({
            ...record,
            ...sanitizeObject(record, [
              'cropType',
              'region',
              'notes',
              'pricingType',
            ])
          }))
        }
      }
    } catch (error) {
      logger.error('Failed to load from localStorage:', error)
    }
  }

  function exportToCSV() { // T024: Modify to include 3 time fields
    if (records.value.length === 0) {
      throw new Error('無歷史記錄可匯出')
    }

    const headers = [
      '計費期間起',
      '計費期間迄',
      '創建時間',
      '作物類型',
      '耕作面積(分地)',
      '電費(TWD)',
      '用電度數(kWh)',
      '水流量(L/s)',
      '月用水量(m³)',
      '地區',
    ]

    const rows = records.value.map((r) => [
      r.billingPeriodStart ? new Date(r.billingPeriodStart).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
      r.billingPeriodEnd ? new Date(r.billingPeriodEnd).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
      new Date(r.timestamp).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      r.cropType,
      r.fieldArea,
      r.billAmount,
      r.calculatedKwh?.toFixed(1) || '-',
      r.waterFlowRate?.toFixed(2) || '-',
      r.monthlyVolume?.toFixed(2) || '-',
      r.region,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n')

    return csvContent
  }

  function exportToJSON() { // T024: Already handles ISO 8601 for billing periods
    if (records.value.length === 0) {
      throw new Error('無歷史記錄可匯出')
    }
    // Existing records will have timestamp as Unix ms, billingPeriodStart/End as YYYY-MM-DD strings.
    // This already aligns with the requirement for ISO 8601 for billing periods
    // and timestamp as a number for created time.
    return JSON.stringify(records.value, null, 2)
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function downloadCSV() {
    const csv = exportToCSV()
    const filename = `水資源紀錄_${new Date().toLocaleDateString('zh-TW')}.csv`
    downloadFile(csv, filename, 'text/csv;charset=utf-8;')
  }

  function downloadJSON() {
    const json = exportToJSON()
    const filename = `水資源紀錄_${new Date().toLocaleDateString('zh-TW')}.json`
    downloadFile(json, filename, 'application/json')
  }

  // T024: Action to set sorting
  function setSort(key) {
    if (currentSortKey.value === key) {
      // Toggle direction if same key
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      currentSortKey.value = key
      sortDirection.value = 'desc' // Default to descending for new sort key
    }
  }

  // Initialize
  function initialize() {
    loadFromLocalStorage()
  }

  // Auto-initialize
  initialize()

  return {
    // State
    records,
    currentSortKey, // T024: Expose sort state
    sortDirection,  // T024: Expose sort state
    // Getters
    recordCount,
    sortedRecords,
    getRecordById,
    filterByDateRange,
    statsSummary,
    getRecordsByCrop,
    // Actions
    addRecord,
    updateRecord,
    deleteRecord,
    clearAllRecords,
    exportToCSV,
    exportToJSON,
    downloadCSV,
    downloadJSON,
    setSort, // T024: Expose setSort action
  }
})
