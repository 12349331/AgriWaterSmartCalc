/**
 * Power Calculator Composable (NEW ALGORITHM)
 * 電力計算器組合式函式 (新演算法)
 *
 * Implements a more accurate reverse calculation for Taipower bills by:
 * 1. Using a binary search approach (`findKwhFromBill`).
 * 2. Converting monthly tiers to bimonthly tiers to match billing cycles.
 * 3. Correctly blending summer and non-summer rates based on the proportion of days in the billing period.
 *
 * This logic is based on the validated algorithm from `test.html`.
 */

// Import pricing versions metadata
import versionsData from '@/data/pricing/versions.json';
import logger from '@/utils/logger';

// 使用 Vite 的 import.meta.glob 預先載入所有 JSON 檔案
const pricingModules = import.meta.glob('@/data/pricing/*.json', { eager: true });

// --- 電價資料庫 (動態載入) ---
// 將在初始化時從 JSON 檔案載入所有歷史版本
let TAIPOWER_RATES = [];

/**
 * 將 JSON 格式的電價資料轉換為計算所需的簡化格式
 * @param {Object} jsonData - JSON 格式的電價資料
 * @returns {Object} 簡化格式的電價資料
 */
function convertJSONToPricingFormat(jsonData) {
  // 找出「表燈非營業用」的定價類型
  const targetType = jsonData.pricing_types?.find(
    pt => pt.用電種類 === '表燈非營業用'
  );

  if (!targetType) {
    logger.warn('找不到「表燈非營業用」電價資料');
    return null;
  }

  // 找出夏月和非夏月的級距資料
  const summerSeason = targetType.seasons.find(s => s.計費月份 === '夏月');
  const nonSummerSeason = targetType.seasons.find(s => s.計費月份 === '非夏月');

  if (!summerSeason || !nonSummerSeason) {
    logger.warn('找不到季節級距資料');
    return null;
  }

  // 轉換級距格式
  const convertTiers = (tiers) => {
    return tiers.map(tier => ({
      limit: tier.上限度數 || Infinity,
      rate: tier.單價
    }));
  };

  return {
    version: jsonData.description || jsonData.version,
    effective_from: jsonData.effective_from,
    effective_to: jsonData.effective_to || '9999-12-31',
    type: '表燈非營業用',
    summer: convertTiers(summerSeason.tiers),
    non_summer: convertTiers(nonSummerSeason.tiers),
  };
}

/**
 * 載入所有歷史電價版本
 * 使用 Vite 預先載入的模組
 */
function loadAllPricingVersions() {
  try {
    // Debug: 顯示所有可用的模組路徑
    logger.debug('可用的定價模組:', Object.keys(pricingModules));

    const versions = versionsData.versions;
    const loadedRates = [];

    for (const versionInfo of versions) {
      try {
        // 從預先載入的模組中獲取資料
        const modulePath = `/src/data/pricing/${versionInfo.file}`;
        const jsonModule = pricingModules[modulePath];

        if (!jsonModule) {
          logger.warn(`找不到模組: ${modulePath}`);
          logger.warn('嘗試的路徑:', modulePath);
          continue;
        }

        const jsonData = jsonModule.default;

        // 轉換格式
        const converted = convertJSONToPricingFormat(jsonData);
        if (converted) {
          loadedRates.push(converted);
        }
      } catch (error) {
        logger.warn(`無法載入電價版本 ${versionInfo.file}:`, error);
      }
    }

    // 按生效日期排序（最新的在前面）
    loadedRates.sort((a, b) => new Date(b.effective_from) - new Date(a.effective_from));

    TAIPOWER_RATES = loadedRates;
    logger.info(`✅ 成功載入 ${TAIPOWER_RATES.length} 個歷史電價版本`);
  } catch (error) {
    logger.error('❌ 載入電價版本失敗:', error);
    // 保留空陣列，讓後續邏輯可以偵測到錯誤
    TAIPOWER_RATES = [];
  }
}

// 立即初始化（同步執行）
loadAllPricingVersions();

// --- Helper Functions from the new algorithm ---

/**
 * 1. 根據「計費迄日」取得適用的電價版本
 */
function getRateVersion(periodEndStr) {
  // 檢查電價資料是否已載入
  if (TAIPOWER_RATES.length === 0) {
    logger.warn('電價資料尚未載入完成，請稍後再試');
    throw new Error('電價資料尚未載入完成');
  }

  const endDate = new Date(periodEndStr);
  for (const version of TAIPOWER_RATES) {
    const from = new Date(version.effective_from);
    const to = new Date(version.effective_to);
    if (endDate >= from && endDate <= to) {
      return version;
    }
  }

  // 提供更詳細的錯誤訊息
  const availableRange = TAIPOWER_RATES.length > 0
    ? `(可用範圍: ${TAIPOWER_RATES[TAIPOWER_RATES.length - 1].effective_from} ~ ${TAIPOWER_RATES[0].effective_to})`
    : '';
  throw new Error(`找不到適用於 ${periodEndStr} 的電價版本 ${availableRange}`);
}

/**
 * 2. 將「每月」級距轉換為「雙月」級距的度數 *寬度*
 */
function getBimonthlyTiers(monthlyTiers) {
  let bimonthlyTiers = [];
  let lastLimit = 0;
  for (const tier of monthlyTiers) {
    // The width of the tier (e.g., 330 - 120 = 210) is doubled for a bimonthly period.
    const kwhInTier = (tier.limit - lastLimit) * 2;
    bimonthlyTiers.push({ kwh: kwhInTier, rate: tier.rate });
    lastLimit = tier.limit;
    if (tier.limit === Infinity) {
      break;
    }
  }
  return bimonthlyTiers;
}

/**
 * 3. 計算夏月/非夏月天數
 */
function getSeasonalSplit(periodStartStr, periodEndStr) {
  const startDate = new Date(periodStartStr);
  const endDate = new Date(periodEndStr);

  let summerDays = 0;
  let nonSummerDays = 0;
  let totalDays = 0;

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    // Summer months are June (5) to September (8)
    const summerStart = new Date(year, 5, 1);
    const summerEnd = new Date(year, 8, 30, 23, 59, 59);

    if (currentDate >= summerStart && currentDate <= summerEnd) {
      summerDays++;
    } else {
      nonSummerDays++;
    }
    totalDays++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { summerDays, nonSummerDays, totalDays };
}

/**
 * 4. [正向計算] 根據用電度數和期間，計算流動電費
 * 可選返回詳細分解資訊
 */
function calculateBillFromKwh(totalKwh, periodStartStr, periodEndStr, returnBreakdown = false) {
  const rateVersion = getRateVersion(periodEndStr);
  const { summerDays, nonSummerDays, totalDays } = getSeasonalSplit(periodStartStr, periodEndStr);
  if (totalDays === 0) return returnBreakdown ? { bill: 0, breakdown: [] } : 0;

  const summerTiers = getBimonthlyTiers(rateVersion.summer);
  const nonSummerTiers = getBimonthlyTiers(rateVersion.non_summer);

  // 夏月計算 (含詳細記錄)
  let totalSummerCost = 0;
  let kwhRemainingSummer = totalKwh;
  const summerBreakdown = [];

  for (const tier of summerTiers) {
    const kwhInThisTier = Math.min(kwhRemainingSummer, tier.kwh);
    if (kwhInThisTier > 0) {
      const cost = kwhInThisTier * tier.rate;
      totalSummerCost += cost;
      summerBreakdown.push({
        rate: tier.rate,
        kwh: kwhInThisTier,
        cost: cost,
        days: summerDays,
        totalDays: totalDays,
      });
    }
    kwhRemainingSummer -= kwhInThisTier;
    if (kwhRemainingSummer <= 0) break;
  }

  // 非夏月計算 (含詳細記錄)
  let totalNonSummerCost = 0;
  let kwhRemainingNonSummer = totalKwh;
  const nonSummerBreakdown = [];

  for (const tier of nonSummerTiers) {
    const kwhInThisTier = Math.min(kwhRemainingNonSummer, tier.kwh);
    if (kwhInThisTier > 0) {
      const cost = kwhInThisTier * tier.rate;
      totalNonSummerCost += cost;
      nonSummerBreakdown.push({
        rate: tier.rate,
        kwh: kwhInThisTier,
        cost: cost,
        days: nonSummerDays,
        totalDays: totalDays,
      });
    }
    kwhRemainingNonSummer -= kwhInThisTier;
    if (kwhRemainingNonSummer <= 0) break;
  }

  const finalBill = (totalSummerCost * summerDays / totalDays) + (totalNonSummerCost * nonSummerDays / totalDays);

  if (returnBreakdown) {
    return {
      bill: finalBill,
      totalKwh: totalKwh,
      summerDays,
      nonSummerDays,
      totalDays,
      summerBreakdown,
      nonSummerBreakdown,
      rateVersion: rateVersion.version,
    };
  }

  return finalBill;
}

/**
 * 5. [反向推算] 根據流動電費和期間，找出用電度數 (二分搜尋法)
 */
function findKwhFromBill(targetBill, periodStartStr, periodEndStr) {
  let minKwh = 0;
  let maxKwh = 20000; // A reasonable upper limit
  let estimatedKwh = 0;
  const precision = 0.01; // Target precision of 1 cent
  const maxIterations = 100; // Safety break

  for (let i = 0; i < maxIterations; i++) {
    estimatedKwh = (minKwh + maxKwh) / 2;
    const calculatedBill = calculateBillFromKwh(estimatedKwh, periodStartStr, periodEndStr);
    const difference = calculatedBill - targetBill;

    if (Math.abs(difference) < precision) {
      return estimatedKwh; // Found a close enough match
    }

    if (difference < 0) {
      minKwh = estimatedKwh; // Calculated bill is too low, need more kWh
    } else {
      maxKwh = estimatedKwh; // Calculated bill is too high, need less kWh
    }
  }

  return estimatedKwh; // Return the best estimate after max iterations
}


// --- Exports for the composable ---

/**
 * Reverse calculate kWh from bill amount using the new, accurate algorithm.
 * Note: The parameters `electricityType` and `billingSeason` are implicitly handled
 * by the new algorithm which uses hardcoded "表燈非營業用" rates and calculates
 * seasonal splits internally.
 */
export function reverseBillToKwh(billAmount, startDate, endDate) {
  if (!billAmount || !startDate || !endDate) return 0;

  try {
    const kwh = findKwhFromBill(billAmount, startDate, endDate);
    return Math.round(kwh * 10) / 10;
  } catch (error) {
    logger.error("Error in reverseBillToKwh:", error);
    return 0; // Return 0 on error
  }
}

/**
 * This function is kept for API compatibility.
 * The new algorithm determines the rate version based on the end date and does not
 * handle splitting across multiple *rate versions* (e.g., 2024 vs 2025 rates),
 * but it correctly handles splitting *seasons* within a single version.
 */
export async function reverseBillToKwhCrossVersion(billAmount, electricityType, startDate, endDate) {
    const kwh = reverseBillToKwh(billAmount, startDate, endDate);

    // 獲取詳細的計算分解資訊
    const detailedBreakdown = calculateBillFromKwh(kwh, startDate, endDate, true);

    // 生成計算公式字串
    const formula = generateFormulaString(detailedBreakdown);

    // 返回詳細結果
    return {
        totalKwh: kwh,
        isCrossVersion: false, // Seasons are always blended
        breakdown: [],
        version: detailedBreakdown.rateVersion,
        verification: {
            billCheck: detailedBreakdown.bill,
            accuracy: Math.abs(detailedBreakdown.bill - billAmount),
            iterations: 0, // Binary search iterations (not tracked here)
            seasonalSplit: {
                summerDays: detailedBreakdown.summerDays,
                nonSummerDays: detailedBreakdown.nonSummerDays,
                totalDays: detailedBreakdown.totalDays,
            },
        },
        calculationFormula: formula,
        detailedBreakdown: detailedBreakdown,
    };
}

/**
 * 生成計算公式字串
 * 格式: 5137.1 = 1.68x240(45/61) + 2.45x420(45/61) + ... + 1.68x240(16/61) + ...
 */
function generateFormulaString(breakdown) {
    if (!breakdown || !breakdown.summerBreakdown) {
        return '';
    }

    const { bill, summerBreakdown, nonSummerBreakdown, summerDays, nonSummerDays, totalDays } = breakdown;

    let parts = [];

    // 夏月各級距
    for (const tier of summerBreakdown) {
        parts.push(`${tier.rate}×${Math.round(tier.kwh)}(${summerDays}/${totalDays})`);
    }

    // 非夏月各級距
    for (const tier of nonSummerBreakdown) {
        parts.push(`${tier.rate}×${Math.round(tier.kwh)}(${nonSummerDays}/${totalDays})`);
    }

    return `${bill.toFixed(1)} = ${parts.join(' + ')}`;
}


/**
 * Composable hook for the new power calculation logic.
 */
export function usePowerCalculator() {
  // The main function now requires start and end dates.
  // The store (`useCalculationStore`) will be responsible for passing these dates.
  return {
    reverseBillToKwh,
    reverseBillToKwhCrossVersion,
  };
}