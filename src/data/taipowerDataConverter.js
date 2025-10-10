/**
 * 台電定價資料轉換器
 * 將 001_updated.json 的原始格式轉換為應用程式可用的格式
 */

import taipowerRawData from "./001_updated.json" assert { type: "json" };

/**
 * 從原始台電 JSON 資料中提取表燈用電定價
 * @returns {Array} 標準化的定價資料陣列
 */
export function convertTaipowerData() {
  const result = [];

  // 提取「表燈」分類的資料
  const biaoData = taipowerRawData["表燈"];
  if (!biaoData || !Array.isArray(biaoData)) {
    return [];
  }

  // 解析表燈非時間電價區段
  // 資料結構：
  // - 住宅用 (index 4-10)
  // - 住宅以外非營業用 (index 4-10)
  // - 營業用 (index 4-10)

  // 表燈非營業用 - 夏月
  const nonBusinessSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column8 },
    { tier: "121-330度", price: biaoData[5]?.Column8 },
    { tier: "331-500度", price: biaoData[6]?.Column8 },
    { tier: "501-700度", price: biaoData[7]?.Column8 },
    { tier: "701-1000度", price: biaoData[8]?.Column8 },
    { tier: "1001度以上", price: biaoData[9]?.Column8 },
  ];

  // 表燈非營業用 - 非夏月
  const nonBusinessNonSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column9 },
    { tier: "121-330度", price: biaoData[5]?.Column9 },
    { tier: "331-500度", price: biaoData[6]?.Column9 },
    { tier: "501-700度", price: biaoData[7]?.Column9 },
    { tier: "701-1000度", price: biaoData[8]?.Column9 },
    { tier: "1001度以上", price: biaoData[9]?.Column9 },
  ];

  // 表燈營業用 - 夏月
  const businessSummer = [
    { tier: "330度以下", price: biaoData[4]?.Column13 },
    { tier: "331-700度", price: biaoData[5]?.Column13 },
    { tier: "701-1500度", price: biaoData[6]?.Column13 },
    { tier: "1501-3000度", price: biaoData[7]?.Column13 },
    { tier: "3001度以上", price: biaoData[8]?.Column13 },
  ];

  // 表燈營業用 - 非夏月
  const businessNonSummer = [
    { tier: "330度以下", price: biaoData[4]?.Column14 },
    { tier: "331-700度", price: biaoData[5]?.Column14 },
    { tier: "701-1500度", price: biaoData[6]?.Column14 },
    { tier: "1501-3000度", price: biaoData[7]?.Column14 },
    { tier: "3001度以上", price: biaoData[8]?.Column14 },
  ];

  // 住宅用 - 夏月
  const residentialSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column3 },
    { tier: "121-330度", price: biaoData[5]?.Column3 },
    { tier: "331-500度", price: biaoData[6]?.Column3 },
    { tier: "501-700度", price: biaoData[7]?.Column3 },
    { tier: "701-1000度", price: biaoData[8]?.Column3 },
    { tier: "1001度以上", price: biaoData[9]?.Column3 },
  ];

  // 住宅用 - 非夏月
  const residentialNonSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column4 },
    { tier: "121-330度", price: biaoData[5]?.Column4 },
    { tier: "331-500度", price: biaoData[6]?.Column4 },
    { tier: "501-700度", price: biaoData[7]?.Column4 },
    { tier: "701-1000度", price: biaoData[8]?.Column4 },
    { tier: "1001度以上", price: biaoData[9]?.Column4 },
  ];

  // 轉換為標準格式
  const addToResult = (type, season, tiers) => {
    tiers.forEach(({ tier, price }) => {
      if (price && typeof price === "number") {
        result.push({
          用電種類: type,
          計費月份: season,
          級距: tier,
          單價: price.toString(),
        });
      }
    });
  };

  // 加入所有定價資料
  addToResult("表燈非營業用", "夏月", nonBusinessSummer);
  addToResult("表燈非營業用", "非夏月", nonBusinessNonSummer);
  addToResult("表燈營業用", "夏月", businessSummer);
  addToResult("表燈營業用", "非夏月", businessNonSummer);
  addToResult("住宅用", "夏月", residentialSummer);
  addToResult("住宅用", "非夏月", residentialNonSummer);


  return result;
}

/**
 * 取得已轉換的台電定價資料
 */
export function getTaipowerPricingData() {
  try {
    return convertTaipowerData();
  } catch (error) {
    console.error("❌ 載入台電定價資料失敗:", error);
    return [];
  }
}

/**
 * 將任意格式的台電資料轉換為標準陣列格式
 * 處理以下情況:
 * 1. 已經是陣列 → 直接返回
 * 2. 是物件（API 原始格式）→ 轉換後返回
 * 3. 其他 → 返回空陣列
 */
export function normalizeTaipowerData(data) {
  // Case 1: Already an array
  if (Array.isArray(data)) {
    return data;
  }

  // Case 2: Object (raw API format) - convert it
  if (data && typeof data === "object" && data["表燈"]) {
    // Temporarily replace the import to use the passed data
    const originalData = taipowerRawData;
    try {
      // Use the conversion logic on the passed data
      return convertRawDataToArray(data);
    } finally {
      // This is just for type safety, actual conversion happens above
    }
  }

  // Case 3: Invalid data
  return [];
}

/**
 * 將原始 API 格式轉換為陣列格式
 * @param {Object} rawData - 原始 API 資料（包含 "表燈" 等 key）
 * @returns {Array} 標準化陣列
 */
function convertRawDataToArray(rawData) {
  const result = [];
  const biaoData = rawData["表燈"];

  if (!biaoData || !Array.isArray(biaoData)) {
    return [];
  }

  // Same conversion logic as convertTaipowerData
  const addToResult = (type, season, tiers) => {
    tiers.forEach(({ tier, price }) => {
      if (price && typeof price === "number") {
        result.push({
          用電種類: type,
          計費月份: season,
          級距: tier,
          單價: price.toString(),
        });
      }
    });
  };

  // 表燈非營業用 - 夏月
  const nonBusinessSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column8 },
    { tier: "121-330度", price: biaoData[5]?.Column8 },
    { tier: "331-500度", price: biaoData[6]?.Column8 },
    { tier: "501-700度", price: biaoData[7]?.Column8 },
    { tier: "701-1000度", price: biaoData[8]?.Column8 },
    { tier: "1001度以上", price: biaoData[9]?.Column8 },
  ];

  // 表燈非營業用 - 非夏月
  const nonBusinessNonSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column9 },
    { tier: "121-330度", price: biaoData[5]?.Column9 },
    { tier: "331-500度", price: biaoData[6]?.Column9 },
    { tier: "501-700度", price: biaoData[7]?.Column9 },
    { tier: "701-1000度", price: biaoData[8]?.Column9 },
    { tier: "1001度以上", price: biaoData[9]?.Column9 },
  ];

  // 表燈營業用 - 夏月
  const businessSummer = [
    { tier: "330度以下", price: biaoData[4]?.Column13 },
    { tier: "331-700度", price: biaoData[5]?.Column13 },
    { tier: "701-1500度", price: biaoData[6]?.Column13 },
    { tier: "1501-3000度", price: biaoData[7]?.Column13 },
    { tier: "3001度以上", price: biaoData[8]?.Column13 },
  ];

  // 表燈營業用 - 非夏月
  const businessNonSummer = [
    { tier: "330度以下", price: biaoData[4]?.Column14 },
    { tier: "331-700度", price: biaoData[5]?.Column14 },
    { tier: "701-1500度", price: biaoData[6]?.Column14 },
    { tier: "1501-3000度", price: biaoData[7]?.Column14 },
    { tier: "3001度以上", price: biaoData[8]?.Column14 },
  ];

  // 住宅用 - 夏月
  const residentialSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column3 },
    { tier: "121-330度", price: biaoData[5]?.Column3 },
    { tier: "331-500度", price: biaoData[6]?.Column3 },
    { tier: "501-700度", price: biaoData[7]?.Column3 },
    { tier: "701-1000度", price: biaoData[8]?.Column3 },
    { tier: "1001度以上", price: biaoData[9]?.Column3 },
  ];

  // 住宅用 - 非夏月
  const residentialNonSummer = [
    { tier: "120度以下", price: biaoData[4]?.Column4 },
    { tier: "121-330度", price: biaoData[5]?.Column4 },
    { tier: "331-500度", price: biaoData[6]?.Column4 },
    { tier: "501-700度", price: biaoData[7]?.Column4 },
    { tier: "701-1000度", price: biaoData[8]?.Column4 },
    { tier: "1001度以上", price: biaoData[9]?.Column4 },
  ];

  addToResult("表燈非營業用", "夏月", nonBusinessSummer);
  addToResult("表燈非營業用", "非夏月", nonBusinessNonSummer);
  addToResult("表燈營業用", "夏月", businessSummer);
  addToResult("表燈營業用", "非夏月", businessNonSummer);
  addToResult("住宅用", "夏月", residentialSummer);
  addToResult("住宅用", "非夏月", residentialNonSummer);

  return result;
}
