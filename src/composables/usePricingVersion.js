/**
 * 電價版本管理模組
 * 負責版本查找、跨版本檢測、期間拆分等功能
 */

import versionsIndex from '../data/pricing/versions.json' with { type: 'json' }
import logger from '@/utils/logger'

/**
 * 電價版本管理
 */
export function usePricingVersion() {
  /**
   * 取得當前最新版本
   * @returns {Object} 當前版本資訊
   */
  function getCurrentVersion() {
    return versionsIndex.versions.find((v) => v.is_current) || versionsIndex.versions[versionsIndex.versions.length - 1]
  }

  /**
   * 根據日期找出適用的電價版本
   * @param {Date|string} date - 查詢日期
   * @returns {Object|null} 適用的版本資訊，未找到則回傳 null
   */
  function findVersionByDate(date) {
    const targetDate = new Date(date)

    // 找出該日期適用的版本
    return versionsIndex.versions.find((v) => {
      const from = new Date(v.effective_from)
      const to = v.effective_to ? new Date(v.effective_to) : new Date('2099-12-31')
      return targetDate >= from && targetDate <= to
    })
  }

  /**
   * 檢查計費期間是否橫跨多個電價版本
   * @param {Date|string} startDate - 計費起始日
   * @param {Date|string} endDate - 計費結束日
   * @returns {boolean} 是否橫跨多個版本
   */
  function checkCrossVersion(startDate, endDate) {
    const startVersion = findVersionByDate(startDate)
    const endVersion = findVersionByDate(endDate)

    if (!startVersion || !endVersion) {
      return false
    }

    return startVersion.version_id !== endVersion.version_id
  }

  /**
   * 拆分計費期間（按電價版本邊界）
   * 當計費期間橫跨多個版本時，將其拆分為多個子期間
   * @param {Date|string} startDate - 計費起始日
   * @param {Date|string} endDate - 計費結束日
   * @returns {Array} 拆分後的期間陣列
   */
  function splitBillingPeriod(startDate, endDate) {
    const periods = []
    let currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
      const version = findVersionByDate(currentDate)

      if (!version) {
        logger.warn(`找不到日期 ${currentDate.toISOString()} 的電價版本`)
        break
      }

      // 找出該版本的結束日期（取較早的日期）
      const versionEnd = version.effective_to ? new Date(version.effective_to) : end
      const periodEnd = versionEnd < end ? versionEnd : end

      // 計算天數
      const timeDiff = periodEnd.getTime() - currentDate.getTime()
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1

      periods.push({
        version_id: version.version_id,
        start: new Date(currentDate),
        end: new Date(periodEnd),
        days: days,
      })

      // 移到下一個版本的起始日
      currentDate = new Date(periodEnd)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return periods
  }

  /**
   * 載入指定版本的電價資料
   * @param {string} versionId - 版本 ID（如 '2025-10-01'）
   * @returns {Promise<Object>} 電價資料
   */
  async function loadPricingData(versionId) {
    const version = versionsIndex.versions.find((v) => v.version_id === versionId)

    if (!version) {
      throw new Error(`電價版本 ${versionId} 不存在`)
    }

    try {
      // 動態載入對應版本的電價資料（Vite requires explicit file extension）
      // Use versionId directly to construct path with .json extension
      const module = await import(`../data/pricing/${versionId}.json`)
      return module.default
    } catch (error) {
      logger.error(`載入電價資料失敗 (${versionId}):`, error)
      throw new Error(`無法載入電價版本 ${versionId}`)
    }
  }

  /**
   * 取得所有可用的版本清單
   * @returns {Array} 版本清單（按生效日期排序）
   */
  function getAllVersions() {
    return [...versionsIndex.versions].sort(
      (a, b) => new Date(b.effective_from) - new Date(a.effective_from),
    )
  }

  /**
   * 根據計費期間自動選擇適用的電價版本
   * 優先使用計費結束日的版本
   * @param {Date|string} startDate - 計費起始日
   * @param {Date|string} endDate - 計費結束日
   * @returns {Object|null} 適用的版本資訊
   */
  function getApplicableVersion(startDate, endDate) {
    // 以計費結束日為準
    return findVersionByDate(endDate)
  }

  return {
    getCurrentVersion,
    findVersionByDate,
    checkCrossVersion,
    splitBillingPeriod,
    loadPricingData,
    getAllVersions,
    getApplicableVersion,
  }
}
