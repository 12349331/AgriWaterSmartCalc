/**
 * 台電定價資料轉換器
 * 將台電 API 原始格式轉換為標準化格式
 * 使用配置化映射，消除硬編碼
 */

import logger from '@/utils/logger'
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
    logger.error('❌ 找不到「表燈」資料或格式錯誤')
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
        logger.warn(`找不到級距定義：${electricityType}`)
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
    logger.error('❌ 載入台電定價資料失敗:', error)
    return {
      version: 'error',
      pricing_types: [],
    }
  }
}

/**
 * 轉換新版台電 API 格式（2025年後的格式）
 * @param {Object} newApiData - 新版 API 的 data 物件
 * @returns {Object} 標準化的電價資料物件
 */
function convertNewTaipowerApiFormat(newApiData) {
  // 檢查是否有「表燈非時間電價」
  const biaoData = newApiData['表燈非時間電價']
  if (!biaoData) {
    logger.warn('⚠️ 新版 API 格式中找不到「表燈非時間電價」')
    return null
  }

  const result = {
    version: new Date().toISOString().split('T')[0],
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: null,
    description: '台電電價資料（從新版 API 轉換）',
    pricing_types: [],
  }

  // 電價類型對應
  const typeMapping = {
    '非營業用': { key: '非營業用', desc: '適用於農業灌溉等非營業用途' },
    '營業用': { key: '營業用', desc: '適用於營業場所' },
    '住宅用': { key: '住宅用', desc: '適用於住宅' },
  }

  // 級距對應（新版 API 用的是中文描述）
  const tierMapping = {
    '120度以下部分': { tier: '120度以下', maxKwh: 120 },
    '121~330度部分': { tier: '121-330度', maxKwh: 330 },
    '331~500度部分': { tier: '331-500度', maxKwh: 500 },
    '501~700度部分': { tier: '501-700度', maxKwh: 700 },
    '701~1000度部分': { tier: '701-1000度', maxKwh: 1000 },
    '1001度以上部分': { tier: '1001度以上', maxKwh: null },
    '330度以下部分': { tier: '330度以下', maxKwh: 330 },
    '331~700度部分': { tier: '331-700度', maxKwh: 700 },
    '701~1500度部分': { tier: '701-1500度', maxKwh: 1500 },
    '1501~3000度部分': { tier: '1501-3000度', maxKwh: 3000 },
    '3001度以上部分': { tier: '3001度以上', maxKwh: null },
  }

  // 處理每種電價類型
  for (const [apiType, typeInfo] of Object.entries(typeMapping)) {
    const typeData = biaoData[apiType]
    if (!typeData) continue

    const pricingType = {
      用電種類: typeInfo.key,
      說明: typeInfo.desc,
      seasons: [],
    }

    // 處理夏月和非夏月
    const seasons = [
      { name: '夏月', period: '6月1日至9月30日' },
      { name: '非夏月', period: '夏月以外時間' },
    ]

    for (const season of seasons) {
      const tiers = []

      // 遍歷所有級距
      for (const [tierKey, tierInfo] of Object.entries(tierMapping)) {
        const tierData = typeData[tierKey]
        if (!tierData || !tierData[season.name]) continue

        const price = tierData[season.name]['單價']
        if (typeof price === 'number') {
          tiers.push({
            級距: tierInfo.tier,
            上限度數: tierInfo.maxKwh,
            單價: price,
          })
        }
      }

      if (tiers.length > 0) {
        pricingType.seasons.push({
          計費月份: season.name,
          期間: season.period,
          tiers,
        })
      }
    }

    if (pricingType.seasons.length > 0) {
      result.pricing_types.push(pricingType)
    }
  }

  return result
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

  // Case 3: 新版台電 API 格式（2025年後，包含 metadata 和 data）
  if (data && typeof data === 'object' && data.data && data.data['表燈非時間電價']) {
    logger.info('✅ 檢測到新版台電 API 格式（2025年後）')
    const converted = convertNewTaipowerApiFormat(data.data)
    if (converted && converted.pricing_types.length > 0) {
      logger.info(`✅ 成功轉換新版 API 格式，共 ${converted.pricing_types.length} 種電價類型`)
      return converted
    }
  }

  // Case 4: 舊版台電 API 格式（包含 data.表燈）→ 轉換為新格式
  if (data && typeof data === 'object' && data.data && data.data['表燈']) {
    logger.info('✅ 檢測到舊版台電 API 格式（包含 metadata 與 data）')
    return convertTaipowerApiData(data.data)
  }

  // Case 5: 原始 API 格式（直接包含「表燈」key）→ 轉換為新格式
  if (data && typeof data === 'object' && data['表燈']) {
    return convertTaipowerApiData(data)
  }

  // Case 6: 無效資料
  logger.warn('⚠️ 無法辨識的電價資料格式，將使用本地備援資料', data ? Object.keys(data).slice(0, 5) : 'null')
  return {
    version: 'error',
    pricing_types: [],
  }
}
