/**
 * 台電定價資料轉換器
 * 將台電 API 原始格式轉換為標準化格式
 * 使用配置化映射，消除硬編碼
 */

import {
  API_COLUMN_MAPPING,
  TIER_DEFINITIONS,
  SEASON_DEFINITIONS,
  ELECTRICITY_TYPE_DESCRIPTIONS,
} from '@/config/taipower-api-mapping'

/**
 * 將台電 API 原始格式轉換為標準化格式
 * 使用配置化映射，消除硬編碼
 *
 * @param {Object} rawData - 台電 API 原始資料（包含「表燈」等 key）
 * @param {string} versionId - 版本 ID（選填）
 * @returns {Object} 標準化的電價資料物件
 */
export function convertTaipowerApiData(rawData, versionId = null) {
  const result = {
    version: versionId || new Date().toISOString().split('T')[0],
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: null,
    description: '台電電價資料（自動轉換）',
    pricing_types: [],
  }

  // 提取「表燈」分類的資料
  const biaoData = rawData['表燈']
  if (!biaoData || !Array.isArray(biaoData)) {
    console.error('❌ 找不到「表燈」資料或格式錯誤')
    return result
  }

  // 遍歷每種電價類型
  for (const [electricityType, seasons] of Object.entries(API_COLUMN_MAPPING)) {
    const pricingType = {
      用電種類: electricityType,
      說明: ELECTRICITY_TYPE_DESCRIPTIONS[electricityType] || '',
      seasons: [],
    }

    // 遍歷夏月/非夏月
    for (const [season, mapping] of Object.entries(seasons)) {
      const tierDefinitions = TIER_DEFINITIONS[electricityType]
      if (!tierDefinitions) {
        console.warn(`找不到級距定義：${electricityType}`)
        continue
      }

      // 根據配置提取級距資料
      const tiers = tierDefinitions
        .map((tierDef) => {
          const rowIndex = mapping.rowStart + tierDef.rowOffset
          const price = biaoData[rowIndex]?.[mapping.column]

          if (typeof price !== 'number') {
            return null // 跳過無效資料
          }

          return {
            級距: tierDef.tier,
            上限度數: tierDef.maxKwh,
            單價: price,
          }
        })
        .filter((t) => t !== null) // 移除無效項目

      pricingType.seasons.push({
        計費月份: season,
        期間: SEASON_DEFINITIONS[season]?.period || '',
        tiers,
      })
    }

    result.pricing_types.push(pricingType)
  }

  return result
}

/**
 * 取得台電定價資料（已轉換為新格式）
 * 從本地檔案載入最新版本
 * @returns {Promise<Object>} 電價資料物件
 */
export async function getTaipowerPricingData() {
  try {
    // 載入最新版本的電價資料（2025-10-01 為當前版本）
    const latestVersion = await import('@/data/pricing/2025-10-01.json')
    return latestVersion.default
  } catch (error) {
    console.error('❌ 載入台電定價資料失敗:', error)
    return {
      version: 'error',
      pricing_types: [],
    }
  }
}

/**
 * 將任意格式的台電資料轉換為標準格式（向後相容）
 * @param {Object|Array} data - 台電資料（任意格式）
 * @returns {Object|Array} 標準化資料
 */
export function normalizeTaipowerData(data) {
  // Case 1: 已經是新格式（包含 pricing_types）
  if (data && data.pricing_types) {
    return data
  }

  // Case 2: 已經是舊陣列格式
  if (Array.isArray(data)) {
    return data
  }

  // Case 3: 原始 API 格式（包含「表燈」key）→ 轉換為新格式
  if (data && typeof data === 'object' && data['表燈']) {
    return convertTaipowerApiData(data)
  }

  // Case 4: 無效資料
  console.error('❌ 無法辨識的電價資料格式')
  return {
    version: 'error',
    pricing_types: [],
  }
}
