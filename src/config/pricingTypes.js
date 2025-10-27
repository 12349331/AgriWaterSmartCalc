/**
 * Electricity pricing type definitions
 * Based on Taiwan Power Company rate classifications
 */
export const ELECTRICITY_TYPES = [
  {
    id: 'non-business',
    value: '非營業用',
    key: 'non-business',
    pricingTable: 'taipower_non_business_2024',
    enabled: true,
  },
  {
    id: 'business',
    value: '營業用',
    key: 'business',
    pricingTable: 'taipower_business_2024',
    enabled: true,
  },
  {
    id: 'residential',
    value: '住宅用',
    key: 'residential',
    pricingTable: 'taipower_residential_2024',
    enabled: true,
  },
]

/**
 * Time-based pricing categories
 */
export const TIME_PRICING_CATEGORIES = [
  {
    id: 'time-based',
    value: '非時間電價',
    key: 'time-based',
    enabled: true,
    tooltip: null,
  },
  {
    id: 'contract-based',
    value: '契約內容電價（暫未開發）',
    key: 'contract-based',
    enabled: false,
    tooltip: '此功能開發中',
  },
]

/**
 * Default pump parameters
 */
export const DEFAULT_PUMP_PARAMS = {
  efficiency: 0.75,
  horsepower: 5,
  wellDepth: 30,
}

/**
 * Validation ranges
 */
export const VALIDATION_RANGES = {
  pumpEfficiency: {
    min: 0.0,
    max: 1.0,
    typical: { min: 0.6, max: 0.85 },
    warningMessage: '效率值偏低/偏高(通常為 0.6-0.85),請確認',
  },
  wellDepth: {
    min: 0,
    max: 1000,
    recommended: { min: 5, max: 100 },
    warningMessage: '深度異常,請確認',
  },
}
