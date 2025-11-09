/**
 * 水量計算組合式函式
 * 實作水流量 (Q) 與月用水量 (V) 的計算
 */

import {
  calculateWaterFlowRate,
  calculateMonthlyVolume,
} from '@/utils/formulas'

/**
 * 水量計算的組合式鉤子
 */
export function useWaterCalculator() {
  /**
   * 計算水流量 (Q)
   * 公式: Q = (P × η) / (0.222 × H × 1.2)
   *
   * @param {number} horsepower - 馬達馬力 (HP)
   * @param {number} efficiency - 馬達效率 (0.0 - 1.0)
   * @param {number} wellDepth - 井深(公尺)
   * @returns {number} 水流量(公升/秒)
   */
  function calculateFlowRate(horsepower, efficiency, wellDepth) {
    return calculateWaterFlowRate(horsepower, efficiency, wellDepth)
  }

  /**
   * 計算月用水量 (V)
   * 公式: V = (Q × 60 × C) / (2 × P × A_fen)
   *
   * @param {number} flowRate - 水流量 (Q)(公升/秒)
   * @param {number} kwh - 計算出的用電度數(kWh)
   * @param {number} horsepower - 馬達馬力 (HP)
   * @param {number} fieldArea - 農地面積(分)
   * @returns {number} 月用水量(立方公尺)
   */
  function calculateVolume(flowRate, kwh, horsepower, fieldArea) {
    return calculateMonthlyVolume(flowRate, kwh, horsepower, fieldArea)
  }

  return {
    calculateFlowRate,
    calculateVolume,
  }
}
