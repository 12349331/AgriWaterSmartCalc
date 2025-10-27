import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reverseBillToKwh, reverseBillToKwhCrossVersion } from '@/composables/usePowerCalculator'
import logger from '@/utils/logger'
import {
  calculateWaterFlowRate,
  calculateMonthlyVolume,
} from '@/utils/formulas'
import { getTaipowerPricingData, normalizeTaipowerData } from '@/data/taipowerDataConverter'
import { fallbackPricingData } from '@/data/taipowerFallback'
import { determineBillingSeason, checkCrossSeasonBoundary } from '@/utils/billing-seasons'
import { isWithinRange, isFutureDate, MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'
import { usePricingVersion } from '@/composables/usePricingVersion'

export const useCalculationStore = defineStore('calculation', () => {
  // State - Step 1: User Inputs (Bill Analysis)
  const electricityType = ref('非營業用')
  const timePricingCategory = ref('非時間電價') // NEW: Time pricing category
  const billingSeason = ref('夏月')
  const billAmount = ref(0)

  // State - Billing Date (Feature 003)
  const billingDate = ref(new Date().toISOString().split('T')[0])
  const calculationTimestamp = ref(null)
  const resultMetadata = ref(null)

  // State - Billing Period (User Story P1)
  const billingPeriodStart = ref(null)
  const billingPeriodEnd = ref(null)

  // State - Step 2: Field & Pump Parameters
  const cropType = ref('')
  const fieldArea = ref(0)
  const region = ref('south')

  // State - Advanced Parameters
  const pumpHorsepower = ref(5.0)
  const pumpEfficiency = ref(0.75) // UPDATED: Default changed from 0.75 to 0.75 (already correct)
  const wellDepth = ref(30.0) // UPDATED: Default changed from 20.0 to 30.0

  // State - Taipower API Data (cached)
  const taipowerPricing = ref([])
  const pricingCacheTimestamp = ref(0)

  // State - Calculation status
  const hasCalculated = ref(false)
  const pricingDataSource = ref('') // 'api' | 'local' | 'cache' | 'fallback'

  // NEW: Pricing version information
  const currentPricingVersion = ref(null) // 當前使用的電價版本 ID
  const isCrossVersion = ref(false) // 是否橫跨多個版本
  const crossVersionBreakdown = ref([]) // 跨版本拆分詳情

  // NEW: Verification information (計算結果驗證資訊)
  const verificationInfo = ref({
    billCheck: 0, // 反推驗證的電費金額
    accuracy: 0, // 精確度（誤差值）
    iterations: 0, // 二分搜尋迭代次數
    billingDaysSummary: '', // 計費天數摘要
    pricingVersionUsed: '', // 使用的電價版本
    seasonalSplit: null, // 季節天數分布
  })

  // NEW: Calculation formula (計算公式)
  const calculationFormula = ref('')
  const detailedBreakdown = ref(null)

  // NEW: Dirty state tracking
  const initialState = ref(null)
  const isDirty = ref(false)
  const dirtyFields = ref(new Set())
  const lastModifiedTimestamp = ref(null)

  // Getters (Computed Properties)
  const calculatedKwh = computed(() => {
    // If the essential parameters for the new algorithm are not available, return 0.
    if (!billAmount.value || !billingPeriodStart.value || !billingPeriodEnd.value) {
      return 0
    }

    // Directly call the new, self-contained reverseBillToKwh function.
    // It no longer depends on externally passed pricing data or season.
    return reverseBillToKwh(
      billAmount.value,
      billingPeriodStart.value,
      billingPeriodEnd.value,
    )
  })

  const waterFlowRate = computed(() => {
    if (!pumpHorsepower.value || !wellDepth.value) return 0

    return calculateWaterFlowRate(
      pumpHorsepower.value,
      pumpEfficiency.value,
      wellDepth.value,
    )
  })

  const monthlyVolume = computed(() => {
    if (!waterFlowRate.value || !fieldArea.value) return 0

    return calculateMonthlyVolume(
      waterFlowRate.value,
      calculatedKwh.value,
      pumpHorsepower.value,
      fieldArea.value,
    )
  })

  const isOverExtraction = computed(() => {
    return monthlyVolume.value > 2000 // Threshold from config
  })

  // Computed properties for billing date (Feature 003)
  const computedBillingSeason = computed(() => {
    // User Story P1: Use billing period if available
    if (billingPeriodStart.value && billingPeriodEnd.value) {
      try {
        return determineBillingSeason(billingPeriodStart.value, billingPeriodEnd.value)
      } catch (error) {
      }
    }

    // Fallback to single billing date (Feature 003)
    if (!billingDate.value) return billingSeason.value

    try {
      // For single date, use it as both start and end
      return determineBillingSeason(billingDate.value, billingDate.value)
    } catch (error) {
      return billingSeason.value // Fallback to manual selection
    }
  })

  const isFutureBillingDate = computed(() => {
    if (!billingDate.value) return false
    return isFutureDate(billingDate.value)
  })

  const isValidBillingDate = computed(() => {
    if (!billingDate.value) return false
    return isWithinRange(billingDate.value, MIN_ALLOWED_DATE, getMaxAllowedDate())
  })

  // Computed properties for billing period (User Story P1)
  const crossesSeasonBoundary = computed(() => {
    if (!billingPeriodStart.value || !billingPeriodEnd.value) {
      return false
    }
    return checkCrossSeasonBoundary(billingPeriodStart.value, billingPeriodEnd.value)
  })

  // NEW: Computed properties for dirty state tracking
  const isFieldDirty = computed(() => (fieldName) => {
    return dirtyFields.value.has(fieldName)
  })

  const getDirtyFields = computed(() => {
    return Array.from(dirtyFields.value)
  })

  const needsRecalculation = computed(() => {
    return isDirty.value && hasCalculated.value
  })

  // Actions
  async function fetchTaipowerPricing() {
    const cacheAge = Date.now() - pricingCacheTimestamp.value
    const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

    if (cacheAge < CACHE_TTL && taipowerPricing.value.length > 0) {
      if (!pricingDataSource.value) {
        pricingDataSource.value = 'cache'
      }
      return taipowerPricing.value // Return cached data
    }

    try {
      // Use proxy in development, direct URL in production
      const apiUrl = import.meta.env.DEV
        ? '/api/taipower'
        : import.meta.env.VITE_TAIPOWER_API_URL ||
          'https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json'

      const response = await fetch(apiUrl, { timeout: 5000 })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const rawData = await response.json()

      // Normalize data (convert object format to array if needed)
      const normalizedData = normalizeTaipowerData(rawData)

      // Check if data is valid (handle both array and object formats)
      const isValidData = normalizedData.pricing_types
        ? normalizedData.pricing_types.length > 0
        : Array.isArray(normalizedData) && normalizedData.length > 0

      if (!isValidData) {
        throw new Error('API 返回資料格式錯誤或為空')
      }

      taipowerPricing.value = normalizedData
      pricingCacheTimestamp.value = Date.now()

      // Persist normalized data to LocalStorage
      localStorage.setItem(
        'aquametrics_taipower_pricing',
        JSON.stringify(normalizedData),
      )
      localStorage.setItem(
        'aquametrics_pricing_timestamp',
        Date.now().toString(),
      )

      pricingDataSource.value = 'api'
      return normalizedData
    } catch (error) {

      // **降級策略 1: 優先使用最新版本的本地電價資料**
      try {
        const localData = await getTaipowerPricingData()

        if (localData && (localData.pricing_types || Array.isArray(localData))) {
          taipowerPricing.value = localData
          pricingCacheTimestamp.value = Date.now()

          // Save to localStorage for next time
          localStorage.setItem(
            'aquametrics_taipower_pricing',
            JSON.stringify(localData),
          )
          localStorage.setItem(
            'aquametrics_pricing_timestamp',
            Date.now().toString(),
          )

          const dataCount = localData.pricing_types ? localData.pricing_types.length : localData.length
          logger.info(
            '✅ 成功載入本地完整定價資料，共',
            dataCount,
            '筆',
          )
          pricingDataSource.value = 'local'
          return localData
        }
      } catch (localError) {
        logger.warn('⚠️ 載入本地電價資料失敗:', localError)
      }

      // **降級策略 2: 使用 LocalStorage 快取**
      try {
        const cached = localStorage.getItem('aquametrics_taipower_pricing')
        if (cached) {
          const cachedData = JSON.parse(cached)
          taipowerPricing.value = cachedData
          pricingDataSource.value = 'cache'
          return cachedData
        }
      } catch (cacheError) {
      }

      // **降級策略 3: 使用簡化備援資料 (最後手段)**
      taipowerPricing.value = fallbackPricingData
      pricingCacheTimestamp.value = Date.now()
      pricingDataSource.value = 'fallback'

      // Save fallback to localStorage for next time
      localStorage.setItem(
        'aquametrics_taipower_pricing',
        JSON.stringify(fallbackPricingData),
      )
      localStorage.setItem(
        'aquametrics_pricing_timestamp',
        Date.now().toString(),
      )

      return fallbackPricingData
    }
  }

  function setPumpParams(params) {
    if (params.horsepower !== undefined)
      pumpHorsepower.value = params.horsepower
    if (params.efficiency !== undefined)
      pumpEfficiency.value = params.efficiency
    if (params.wellDepth !== undefined) wellDepth.value = params.wellDepth
  }

  // NEW: Dirty state tracking functions
  function markFieldDirty(fieldName) {
    dirtyFields.value.add(fieldName)
    isDirty.value = true
    lastModifiedTimestamp.value = Date.now()
  }

  function saveInitialState() {
    initialState.value = {
      billAmount: billAmount.value,
      electricityType: electricityType.value,
      timePricingCategory: timePricingCategory.value,
      billingSeason: billingSeason.value,
      cropType: cropType.value,
      fieldArea: fieldArea.value,
      region: region.value,
      pumpHorsepower: pumpHorsepower.value,
      pumpEfficiency: pumpEfficiency.value,
      wellDepth: wellDepth.value,
      billingDate: billingDate.value,
      billingPeriodStart: billingPeriodStart.value,
      billingPeriodEnd: billingPeriodEnd.value,
    }
    isDirty.value = false
    dirtyFields.value.clear()
  }

  function setFormData(data) {
    if (data.billAmount !== undefined) billAmount.value = data.billAmount
    if (data.electricityType !== undefined)
      electricityType.value = data.electricityType
    if (data.billingSeason !== undefined)
      billingSeason.value = data.billingSeason
    if (data.cropType !== undefined) cropType.value = data.cropType
    if (data.fieldArea !== undefined) fieldArea.value = data.fieldArea
    if (data.region !== undefined) region.value = data.region

    // User Story P1: Billing period handling
    if (data.billingPeriodStart !== undefined) {
      billingPeriodStart.value = data.billingPeriodStart
    }
    if (data.billingPeriodEnd !== undefined) {
      billingPeriodEnd.value = data.billingPeriodEnd
    }

    // Feature 003: Billing date handling (fallback for single date)
    if (data.billingDate !== undefined) {
      setBillingDate(data.billingDate)
    }

    // Mark as calculated and store timestamp
    hasCalculated.value = true
    calculationTimestamp.value = Date.now()

    // Store result metadata
    resultMetadata.value = {
      billingDate: billingDate.value,
      billingPeriodStart: billingPeriodStart.value,
      billingPeriodEnd: billingPeriodEnd.value,
      billingSeason: computedBillingSeason.value,
      crossesSeasonBoundary: crossesSeasonBoundary.value,
      timestamp: calculationTimestamp.value,
      isFutureDate: isFutureBillingDate.value,
    }

    // NEW: Save initial state after calculation for dirty tracking
    saveInitialState()
  }

  function setBillingDate(newDate) {
    if (!newDate) {
      throw new Error('請選擇用電日期')
    }

    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      throw new Error('日期格式錯誤')
    }

    // Validate range
    if (!isWithinRange(newDate, MIN_ALLOWED_DATE, getMaxAllowedDate())) {
      throw new Error('日期超出允許範圍（2020-01-01 至未來一年）')
    }

    // Validate date is valid
    const dateObj = new Date(newDate)
    if (isNaN(dateObj.getTime())) {
      throw new Error('無效的日期')
    }

    billingDate.value = newDate

    // Auto-update billingSeason based on date (use same date for start and end)
    const season = determineBillingSeason(newDate, newDate)
    billingSeason.value = season

    return true
  }

  async function calculate(params) {
    // Feature 003: Support billingDate in calculation
    const calculationData = {
      ...params,
      billingDate: params.billingDate || billingDate.value,
      billingSeason: params.billingSeason || computedBillingSeason.value,
    }

    setFormData(calculationData)

    // NEW: Check if we need cross-version calculation
    let kwhResult = calculatedKwh.value
    let versionInfo = {}

    if (billingPeriodStart.value && billingPeriodEnd.value) {
      // Use cross-version calculation for billing periods
      try {
        const crossVersionResult = await reverseBillToKwhCrossVersion(
          billAmount.value,
          electricityType.value,
          billingPeriodStart.value,
          billingPeriodEnd.value,
        )

        kwhResult = crossVersionResult.totalKwh
        isCrossVersion.value = crossVersionResult.isCrossVersion
        crossVersionBreakdown.value = crossVersionResult.breakdown || []

        // 更新驗證資訊
        if (crossVersionResult.verification) {
          const verification = crossVersionResult.verification

          // 建立計費天數摘要
          let billingDaysSummary = ''
          if (verification.seasonalSplit) {
            const { summerDays, nonSummerDays, totalDays } = verification.seasonalSplit
            billingDaysSummary = `共 ${totalDays} 天 (夏月 ${summerDays} 天 / 非夏月 ${nonSummerDays} 天)`
          }

          verificationInfo.value = {
            billCheck: verification.billCheck || 0,
            accuracy: verification.accuracy || 0,
            iterations: verification.iterations || 0,
            billingDaysSummary,
            pricingVersionUsed: crossVersionResult.version || '',
            seasonalSplit: verification.seasonalSplit,
          }
        }

        // 更新計算公式和詳細分解
        calculationFormula.value = crossVersionResult.calculationFormula || ''
        detailedBreakdown.value = crossVersionResult.detailedBreakdown || null

        if (crossVersionResult.isCrossVersion) {
          versionInfo = {
            isCrossVersion: true,
            breakdown: crossVersionResult.breakdown,
          }
        } else {
          currentPricingVersion.value = crossVersionResult.version || null
          versionInfo = {
            isCrossVersion: false,
            version: crossVersionResult.version,
            season: crossVersionResult.season,
          }
        }
      } catch (error) {
        logger.error('跨版本計算失敗:', error)
        // Fallback to simple calculation
        kwhResult = calculatedKwh.value
      }
    } else {
      // Single version calculation
      const { findVersionByDate } = usePricingVersion()
      const version = findVersionByDate(billingDate.value)
      currentPricingVersion.value = version?.version_id || null
      isCrossVersion.value = false
      crossVersionBreakdown.value = []

      versionInfo = {
        isCrossVersion: false,
        version: currentPricingVersion.value,
        season: computedBillingSeason.value,
      }
    }

    return {
      kwh: kwhResult,
      flowRate: waterFlowRate.value,
      volume: monthlyVolume.value,
      isOverExtraction: isOverExtraction.value,
      metadata: {
        ...resultMetadata.value,
        ...versionInfo,
      },
    }
  }

  function reset() {
    billAmount.value = 0
    electricityType.value = '非營業用' // NEW: Reset to default
    timePricingCategory.value = '非時間電價' // NEW: Reset to default
    cropType.value = ''
    fieldArea.value = 0
    hasCalculated.value = false
    // Feature 003: Reset billing date to today
    billingDate.value = new Date().toISOString().split('T')[0]
    // User Story P1: Reset billing period
    billingPeriodStart.value = null
    billingPeriodEnd.value = null
    calculationTimestamp.value = null
    resultMetadata.value = null
    // NEW: Reset dirty state
    initialState.value = null
    isDirty.value = false
    dirtyFields.value.clear()
    lastModifiedTimestamp.value = null
    // Keep advanced params (user preference)
  }

  // Initialize from LocalStorage on store creation
  async function initialize() {
    const cached = localStorage.getItem('aquametrics_taipower_pricing')
    const timestamp = localStorage.getItem('aquametrics_pricing_timestamp')

    if (cached && timestamp) {
      const cacheAge = Date.now() - parseInt(timestamp)
      const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

      if (cacheAge < CACHE_TTL) {
        taipowerPricing.value = JSON.parse(cached)
        pricingCacheTimestamp.value = parseInt(timestamp)
        pricingDataSource.value = 'cache'
        return
      }
    }

    // 如果沒有快取或快取過期，嘗試載入本地完整資料
    try {
      const localData = await getTaipowerPricingData()
      if (localData && (localData.pricing_types || (Array.isArray(localData) && localData.length > 0))) {
        taipowerPricing.value = localData
        pricingCacheTimestamp.value = Date.now()
        pricingDataSource.value = 'local'
      }
    } catch (error) {
      logger.warn(
        '⚠️ 初始化：本地完整定價資料載入失敗，將在首次計算時嘗試從 API 取得',
      )
    }
  }

  // Auto-initialize
  initialize()

  return {
    // State
    billAmount,
    electricityType,
    timePricingCategory, // NEW
    billingSeason,
    cropType,
    fieldArea,
    region,
    pumpHorsepower,
    pumpEfficiency,
    wellDepth,
    taipowerPricing,
    pricingCacheTimestamp,
    hasCalculated,
    pricingDataSource,
    // Feature 003: Billing Date State
    billingDate,
    calculationTimestamp,
    resultMetadata,
    // User Story P1: Billing Period State
    billingPeriodStart,
    billingPeriodEnd,
    // NEW: Pricing Version State
    currentPricingVersion,
    isCrossVersion,
    crossVersionBreakdown,
    // NEW: Verification State
    verificationInfo,
    // NEW: Calculation Formula State
    calculationFormula,
    detailedBreakdown,
    // NEW: Dirty State
    isDirty,
    dirtyFields,
    initialState,
    lastModifiedTimestamp,
    // Getters
    calculatedKwh,
    waterFlowRate,
    monthlyVolume,
    isOverExtraction,
    // Feature 003: Billing Date Getters
    computedBillingSeason,
    isFutureBillingDate,
    isValidBillingDate,
    // User Story P1: Billing Period Getters
    crossesSeasonBoundary,
    // NEW: Dirty State Getters
    isFieldDirty,
    getDirtyFields,
    needsRecalculation,
    // Actions
    fetchTaipowerPricing,
    setPumpParams,
    setFormData,
    setBillingDate,
    calculate,
    reset,
    // NEW: Dirty State Actions
    markFieldDirty,
    saveInitialState,
  }
})
