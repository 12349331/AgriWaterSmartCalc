/**
 * Traditional Chinese (Taiwan) translations
 * Placeholder for future i18n support
 */

export default {
  app: {
    title: '智慧農業水資源管理平台',
    subtitle: '以電推水 - 農業用水量估算工具',
  },
  calculator: {
    title: '水資源估算',
    billAmount: '電費金額 (TWD)',
    electricityType: '用電種類',
    billingSeason: '計費月份',
    cropType: '作物類型',
    fieldArea: '耕作面積 (分地)',
    region: '地區',
    calculate: '計算用水量',
    reset: '重設',
  },
  billingPeriod: {
    startDate: '電費計費起始日',
    endDate: '電費計費結束日',
    season: '計價季節',
    autoDetermined: '(自動判定)',
    summer: '夏月',
    nonSummer: '非夏月',
  },
  results: {
    title: '計算結果',
    kwh: '推算用電度數',
    flowRate: '每秒鐘抽水量 (Q)',
    monthlyVolume: '每月用水量 (V)',
    overExtraction: '用水量超過建議閾值',
    save: '儲存紀錄',
    share: '分享',
  },
  history: {
    title: '歷史記錄',
    empty: '尚無歷史記錄',
    exportCSV: '匯出 CSV',
    exportJSON: '匯出 JSON',
    clearAll: '清除全部',
  },
  dashboard: {
    seasonal: '季節性趨勢',
    crop: '作物比較',
    annual: '年度趨勢',
    stats: '統計摘要',
  },
  common: {
    loading: '載入中...',
    error: '發生錯誤',
    success: '操作成功',
    cancel: '取消',
    confirm: '確認',
    close: '關閉',
    edit: '編輯',
    delete: '刪除',
    save: '儲存',
  },
  validation: {
    required: '此欄位為必填',
    invalidFormat: '格式不正確',
    dateRange: {
      incomplete: '請完整選擇電費計費期間（開始與結束日期）',
      endBeforeStart: '結束日期必須晚於開始日期',
      outOfRange: '日期必須在 2020/01/01 與 {maxDate} 之間',
      tooLong: '計費期間異常長（超過 {days} 天），請確認日期是否正確',
      futureDate: '您選擇的計費期間包含未來日期，是否確定？',
    },
  },
  warnings: {
    crossSeason: '此計費期間橫跨夏月與非夏月邊界，系統已自動判定為「{season}」（以天數較多者為準）。',
  },
}
