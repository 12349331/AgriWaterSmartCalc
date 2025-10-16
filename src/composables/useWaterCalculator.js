/**
 * Water Calculator Composable
 * Implements water flow rate (Q) and monthly volume (V) calculations
 */

import {
  calculateWaterFlowRate,
  calculateMonthlyVolume,
} from '@/utils/formulas'

/**
 * Composable hook for water calculation
 */
export function useWaterCalculator() {
  /**
   * Calculate water flow rate (Q)
   * Formula: Q = (P × η) / (0.222 × H × 1.2)
   *
   * @param {number} horsepower - Pump horsepower (HP)
   * @param {number} efficiency - Pump efficiency (0.0 - 1.0)
   * @param {number} wellDepth - Well depth in meters
   * @returns {number} Water flow rate in L/s
   */
  function calculateFlowRate(horsepower, efficiency, wellDepth) {
    return calculateWaterFlowRate(horsepower, efficiency, wellDepth)
  }

  /**
   * Calculate monthly water volume (V)
   * Formula: V = (Q × 60 × C) / (2 × P × A_fen)
   *
   * @param {number} flowRate - Water flow rate (Q) in L/s
   * @param {number} kwh - Calculated electricity usage in kWh
   * @param {number} horsepower - Pump horsepower (HP)
   * @param {number} fieldArea - Field area in fen
   * @returns {number} Monthly water volume in m³
   */
  function calculateVolume(flowRate, kwh, horsepower, fieldArea) {
    return calculateMonthlyVolume(flowRate, kwh, horsepower, fieldArea)
  }

  return {
    calculateFlowRate,
    calculateVolume,
  }
}
