// 用水計算公式，依據 spec.md

import { CALCULATION_PARAMS } from "@/config/constants";

/**
 * 計算抽水流量 (Q)，使用抽水機規格參數
 * 公式：Q = (P × η) / (0.222 × H × 1.2)
 *
 * @param {number} horsepower - 抽水機馬力 (HP)
 * @param {number} efficiency - 抽水機效率 (0.0 - 1.0)
 * @param {number} wellDepth - 井深，單位：公尺
 * @returns {number} 抽水流量，單位：公升/秒 (L/s)
 */
export function calculateWaterFlowRate(horsepower, efficiency, wellDepth) {
  if (!horsepower || !efficiency || !wellDepth) return 0;

  const { gravityConstant, safetyFactor } = CALCULATION_PARAMS;

  return (
    (horsepower * efficiency) / (gravityConstant * wellDepth * safetyFactor)
  );
}

/**
 * 計算每月用水量 (V)
 * 公式：V = (Q × 60 × C) / (2 × P × A_fen)
 *
 * @param {number} flowRate - 抽水流量 (Q)，單位：公升/秒 (L/s)
 * @param {number} kwh - 計算得出的用電量，單位：度 (kWh)
 * @param {number} horsepower - 抽水機馬力 (HP)
 * @param {number} fieldArea - 田地面積，單位：分
 * @returns {number} 每月用水量，單位：立方公尺 (m³)
 */
export function calculateMonthlyVolume(flowRate, kwh, horsepower, fieldArea) {
  if (!flowRate || !kwh || !horsepower || !fieldArea) return 0;

  const { minutesPerHour, hoursPerKwhDivisor } = CALCULATION_PARAMS;

  return (
    (flowRate * minutesPerHour * kwh) /
    (hoursPerKwhDivisor * horsepower * fieldArea)
  );
}

/**
 * 將公頃轉換為分（台灣面積單位）
 * 1 分 = 0.0969 公頃
 *
 * @param {number} hectares - 面積，單位：公頃
 * @returns {number} 面積，單位：分
 */
export function hectaresToFen(hectares) {
  return hectares / 0.0969;
}

/**
 * 將分轉換為公頃
 *
 * @param {number} fen - 面積，單位：分
 * @returns {number} 面積，單位：公頃
 */
export function fenToHectares(fen) {
  return fen * 0.0969;
}

/**
 * 檢查用水量是否超過超抽閾值
 *
 * @param {number} volume - 每月用水量，單位：立方公尺 (m³)
 * @returns {boolean} 若超過超抽閾值則返回 true
 */
export function isOverExtraction(volume) {
  return volume > CALCULATION_PARAMS.overExtractionThreshold;
}
