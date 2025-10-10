import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { reverseBillToKwh } from "@/composables/usePowerCalculator";
import {
  calculateWaterFlowRate,
  calculateMonthlyVolume,
} from "@/utils/formulas";
import { getTaipowerPricingData, normalizeTaipowerData } from "@/data/taipowerDataConverter";
import { fallbackPricingData } from "@/data/taipowerFallback";
import { determineBillingSeason, checkCrossSeasonBoundary } from "@/utils/billing-seasons";
import { isWithinRange, isFutureDate, MIN_ALLOWED_DATE, getMaxAllowedDate } from "@/utils/date-validators";

export const useCalculationStore = defineStore("calculation", () => {
  // State - Step 1: User Inputs (Bill Analysis)
  const electricityType = ref("表燈非營業用");
  const billingSeason = ref("夏月");
  const billAmount = ref(0);

  // State - Billing Date (Feature 003)
  const billingDate = ref(new Date().toISOString().split('T')[0]);
  const calculationTimestamp = ref(null);
  const resultMetadata = ref(null);

  // State - Billing Period (User Story P1)
  const billingPeriodStart = ref(null);
  const billingPeriodEnd = ref(null);

  // State - Step 2: Field & Pump Parameters
  const cropType = ref("");
  const fieldArea = ref(0);
  const region = ref("south");

  // State - Advanced Parameters
  const pumpHorsepower = ref(5.0);
  const pumpEfficiency = ref(0.75);
  const wellDepth = ref(20.0);

  // State - Taipower API Data (cached)
  const taipowerPricing = ref([]);
  const pricingCacheTimestamp = ref(0);

  // State - Calculation status
  const hasCalculated = ref(false);
  const pricingDataSource = ref(""); // 'api' | 'local' | 'cache' | 'fallback'

  // Getters (Computed Properties)
  const calculatedKwh = computed(() => {
    if (!billAmount.value || taipowerPricing.value.length === 0) {
      // Fallback calculation if no API data
      return billAmount.value > 0 ? billAmount.value / 3.5 : 0;
    }

    return reverseBillToKwh(
      billAmount.value,
      electricityType.value,
      billingSeason.value,
      taipowerPricing.value
    );
  });

  const waterFlowRate = computed(() => {
    if (!pumpHorsepower.value || !wellDepth.value) return 0;

    return calculateWaterFlowRate(
      pumpHorsepower.value,
      pumpEfficiency.value,
      wellDepth.value
    );
  });

  const monthlyVolume = computed(() => {
    if (!waterFlowRate.value || !fieldArea.value) return 0;

    return calculateMonthlyVolume(
      waterFlowRate.value,
      calculatedKwh.value,
      pumpHorsepower.value,
      fieldArea.value
    );
  });

  const isOverExtraction = computed(() => {
    return monthlyVolume.value > 2000; // Threshold from config
  });

  // Computed properties for billing date (Feature 003)
  const computedBillingSeason = computed(() => {
    // User Story P1: Use billing period if available
    if (billingPeriodStart.value && billingPeriodEnd.value) {
      try {
        return determineBillingSeason(billingPeriodStart.value, billingPeriodEnd.value);
      } catch (error) {
        console.warn('[Store] Failed to determine billing season from period:', error);
      }
    }

    // Fallback to single billing date (Feature 003)
    if (!billingDate.value) return billingSeason.value;

    try {
      // For single date, use it as both start and end
      return determineBillingSeason(billingDate.value, billingDate.value);
    } catch (error) {
      console.warn('[Store] Failed to determine billing season:', error);
      return billingSeason.value; // Fallback to manual selection
    }
  });

  const isFutureBillingDate = computed(() => {
    if (!billingDate.value) return false;
    return isFutureDate(billingDate.value);
  });

  const isValidBillingDate = computed(() => {
    if (!billingDate.value) return false;
    return isWithinRange(billingDate.value, MIN_ALLOWED_DATE, getMaxAllowedDate());
  });

  // Computed properties for billing period (User Story P1)
  const crossesSeasonBoundary = computed(() => {
    if (!billingPeriodStart.value || !billingPeriodEnd.value) {
      return false;
    }
    return checkCrossSeasonBoundary(billingPeriodStart.value, billingPeriodEnd.value);
  });

  // Actions
  async function fetchTaipowerPricing() {
    const cacheAge = Date.now() - pricingCacheTimestamp.value;
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

    if (cacheAge < CACHE_TTL && taipowerPricing.value.length > 0) {
      console.log("✅ 使用快取的台電定價資料");
      if (!pricingDataSource.value) {
        pricingDataSource.value = "cache";
      }
      return taipowerPricing.value; // Return cached data
    }

    try {
      // Use proxy in development, direct URL in production
      const apiUrl = import.meta.env.DEV
        ? "/api/taipower"
        : import.meta.env.VITE_TAIPOWER_API_URL ||
          "https://service.taipower.com.tw/data/opendata/apply/file/d007008/001.json";

      console.log("🔄 嘗試從台電 API 取得定價資料...");
      const response = await fetch(apiUrl, { timeout: 5000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const rawData = await response.json();

      // Normalize data (convert object format to array if needed)
      const normalizedData = normalizeTaipowerData(rawData);

      if (normalizedData.length === 0) {
        throw new Error("API 返回資料格式錯誤或為空");
      }

      taipowerPricing.value = normalizedData;
      pricingCacheTimestamp.value = Date.now();

      // Persist normalized data to LocalStorage
      localStorage.setItem(
        "aquametrics_taipower_pricing",
        JSON.stringify(normalizedData)
      );
      localStorage.setItem(
        "aquametrics_pricing_timestamp",
        Date.now().toString()
      );

      console.log("✅ 成功從台電 API 取得定價資料，共", normalizedData.length, "筆");
      pricingDataSource.value = "api";
      return normalizedData;
    } catch (error) {
      console.warn("⚠️ 台電 API 連線失敗:", error.message);

      // **降級策略 1: 優先使用 001_updated.json 的完整資料**
      try {
        console.log("🔄 嘗試使用本地完整定價資料 (001_updated.json)...");
        const localData = getTaipowerPricingData();

        if (localData && localData.length > 0) {
          taipowerPricing.value = localData;
          pricingCacheTimestamp.value = Date.now();

          // Save to localStorage for next time
          localStorage.setItem(
            "aquametrics_taipower_pricing",
            JSON.stringify(localData)
          );
          localStorage.setItem(
            "aquametrics_pricing_timestamp",
            Date.now().toString()
          );

          console.log(
            "✅ 成功載入本地完整定價資料，共",
            localData.length,
            "筆"
          );
          pricingDataSource.value = "local";
          return localData;
        }
      } catch (localError) {
        console.warn("⚠️ 本地完整定價資料載入失敗:", localError);
      }

      // **降級策略 2: 使用 LocalStorage 快取**
      try {
        const cached = localStorage.getItem("aquametrics_taipower_pricing");
        if (cached) {
          const cachedData = JSON.parse(cached);
          taipowerPricing.value = cachedData;
          pricingDataSource.value = "cache";
          console.log("✅ 使用 LocalStorage 快取的定價資料");
          return cachedData;
        }
      } catch (cacheError) {
        console.warn("⚠️ LocalStorage 快取讀取失敗:", cacheError);
      }

      // **降級策略 3: 使用簡化備援資料 (最後手段)**
      console.warn("⚠️ 使用簡化備援定價資料 (精確度較低)");
      taipowerPricing.value = fallbackPricingData;
      pricingCacheTimestamp.value = Date.now();
      pricingDataSource.value = "fallback";

      // Save fallback to localStorage for next time
      localStorage.setItem(
        "aquametrics_taipower_pricing",
        JSON.stringify(fallbackPricingData)
      );
      localStorage.setItem(
        "aquametrics_pricing_timestamp",
        Date.now().toString()
      );

      return fallbackPricingData;
    }
  }

  function setPumpParams(params) {
    if (params.horsepower !== undefined)
      pumpHorsepower.value = params.horsepower;
    if (params.efficiency !== undefined)
      pumpEfficiency.value = params.efficiency;
    if (params.wellDepth !== undefined) wellDepth.value = params.wellDepth;
  }

  function setFormData(data) {
    if (data.billAmount !== undefined) billAmount.value = data.billAmount;
    if (data.electricityType !== undefined)
      electricityType.value = data.electricityType;
    if (data.billingSeason !== undefined)
      billingSeason.value = data.billingSeason;
    if (data.cropType !== undefined) cropType.value = data.cropType;
    if (data.fieldArea !== undefined) fieldArea.value = data.fieldArea;
    if (data.region !== undefined) region.value = data.region;

    // User Story P1: Billing period handling
    if (data.billingPeriodStart !== undefined) {
      billingPeriodStart.value = data.billingPeriodStart;
    }
    if (data.billingPeriodEnd !== undefined) {
      billingPeriodEnd.value = data.billingPeriodEnd;
    }

    // Feature 003: Billing date handling (fallback for single date)
    if (data.billingDate !== undefined) {
      setBillingDate(data.billingDate);
    }

    // Mark as calculated and store timestamp
    hasCalculated.value = true;
    calculationTimestamp.value = Date.now();

    // Store result metadata
    resultMetadata.value = {
      billingDate: billingDate.value,
      billingPeriodStart: billingPeriodStart.value,
      billingPeriodEnd: billingPeriodEnd.value,
      billingSeason: computedBillingSeason.value,
      crossesSeasonBoundary: crossesSeasonBoundary.value,
      timestamp: calculationTimestamp.value,
      isFutureDate: isFutureBillingDate.value,
    };
  }

  function setBillingDate(newDate) {
    if (!newDate) {
      throw new Error('請選擇用電日期');
    }

    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      throw new Error('日期格式錯誤');
    }

    // Validate range
    if (!isWithinRange(newDate, MIN_ALLOWED_DATE, getMaxAllowedDate())) {
      throw new Error('日期超出允許範圍（2020-01-01 至未來一年）');
    }

    // Validate date is valid
    const dateObj = new Date(newDate);
    if (isNaN(dateObj.getTime())) {
      throw new Error('無效的日期');
    }

    billingDate.value = newDate;

    // Auto-update billingSeason based on date
    const season = determineBillingSeason(newDate);
    billingSeason.value = season;

    return true;
  }

  function calculate(params) {
    // Feature 003: Support billingDate in calculation
    const calculationData = {
      ...params,
      billingDate: params.billingDate || billingDate.value,
      billingSeason: params.billingSeason || computedBillingSeason.value,
    };

    setFormData(calculationData);

    return {
      kwh: calculatedKwh.value,
      flowRate: waterFlowRate.value,
      volume: monthlyVolume.value,
      isOverExtraction: isOverExtraction.value,
      metadata: resultMetadata.value,
    };
  }

  function reset() {
    billAmount.value = 0;
    cropType.value = "";
    fieldArea.value = 0;
    hasCalculated.value = false;
    // Feature 003: Reset billing date to today
    billingDate.value = new Date().toISOString().split('T')[0];
    // User Story P1: Reset billing period
    billingPeriodStart.value = null;
    billingPeriodEnd.value = null;
    calculationTimestamp.value = null;
    resultMetadata.value = null;
    // Keep advanced params (user preference)
  }

  // Initialize from LocalStorage on store creation
  function initialize() {
    const cached = localStorage.getItem("aquametrics_taipower_pricing");
    const timestamp = localStorage.getItem("aquametrics_pricing_timestamp");

    if (cached && timestamp) {
      const cacheAge = Date.now() - parseInt(timestamp);
      const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge < CACHE_TTL) {
        taipowerPricing.value = JSON.parse(cached);
        pricingCacheTimestamp.value = parseInt(timestamp);
        pricingDataSource.value = "cache";
        console.log("✅ 初始化：載入快取的台電定價資料");
        return;
      }
    }

    // 如果沒有快取或快取過期，嘗試載入本地完整資料
    try {
      const localData = getTaipowerPricingData();
      if (localData && localData.length > 0) {
        taipowerPricing.value = localData;
        pricingCacheTimestamp.value = Date.now();
        pricingDataSource.value = "local";
        console.log("✅ 初始化：載入本地完整定價資料");
      }
    } catch (error) {
      console.warn(
        "⚠️ 初始化：本地完整定價資料載入失敗，將在首次計算時嘗試從 API 取得"
      );
    }
  }

  // Auto-initialize
  initialize();

  return {
    // State
    billAmount,
    electricityType,
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
    // Actions
    fetchTaipowerPricing,
    setPumpParams,
    setFormData,
    setBillingDate,
    calculate,
    reset,
  };
});
