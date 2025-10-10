/**
 * 歷史紀錄資料遷移工具
 * 處理舊資料新增計費期間欄位（billingPeriodStart/End）的遷移邏輯
 */

/**
 * 為舊歷史紀錄新增計費期間欄位
 * @param {Array<Object>} records - 歷史紀錄陣列
 * @returns {Array<Object>} 遷移後的紀錄陣列
 */
export function addBillingPeriodToLegacyRecords(records) {
  if (!Array.isArray(records)) {
    return []
  }

  return records.map((record) => {
    // 若已有 billingPeriodStart，直接返回
    if (record.billingPeriodStart && record.billingPeriodEnd) {
      return record
    }

    let dateStr

    // 嘗試從 timestamp 轉換
    if (record.timestamp && !isNaN(record.timestamp)) {
      try {
        dateStr = new Date(record.timestamp).toISOString().split('T')[0]
      } catch (error) {
        dateStr = new Date().toISOString().split('T')[0] // 使用當前日期作為降級
      }
    } else {
      // 損壞的紀錄：使用當前日期作為降級
      dateStr = new Date().toISOString().split('T')[0]
    }

    // 舊紀錄：計費期間起迄設為同一天
    return {
      ...record,
      billingPeriodStart: dateStr,
      billingPeriodEnd: dateStr,
    }
  })
}

/**
 * 在應用啟動時執行資料遷移
 * @param {Object} historyStore - Pinia history store 實例
 */
export function migrateHistoryOnStartup(historyStore) {
  if (!historyStore || !historyStore.records) {
    return
  }

  const records = historyStore.records

  // 檢查是否有舊紀錄需要遷移
  const hasLegacyRecords = records.some((r) => !r.billingPeriodStart)

  if (!hasLegacyRecords) {
    return
  }

  try {
    const migratedRecords = addBillingPeriodToLegacyRecords(records)
    historyStore.records = migratedRecords

    // 儲存到 LocalStorage
    if (typeof historyStore.saveToLocalStorage === 'function') {
      historyStore.saveToLocalStorage()
    }

  } catch (error) {
    console.error('[Migration] Migration failed:', error)
    // 不阻止應用啟動
  }
}
