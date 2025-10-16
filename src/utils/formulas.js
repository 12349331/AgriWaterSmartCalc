// Water calculation formulas based on spec.md

import { CALCULATION_PARAMS } from '@/config/constants'

/**
 * Calculate water flow rate (Q) using pump specifications
 * Formula: Q = (P × η) / (0.222 × H × 1.2)
 *
 * @param {number} horsepower - Pump horsepower (HP)
 * @param {number} efficiency - Pump efficiency (0.0 - 1.0)
 * @param {number} wellDepth - Well depth in meters
 * @returns {number} Water flow rate in L/s
 */
export function calculateWaterFlowRate(horsepower, efficiency, wellDepth) {
  if (!horsepower || !efficiency || !wellDepth) return 0

  const { gravityConstant, safetyFactor } = CALCULATION_PARAMS

  return (
    (horsepower * efficiency) / (gravityConstant * wellDepth * safetyFactor)
  )
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
export function calculateMonthlyVolume(flowRate, kwh, horsepower, fieldArea) {
  if (!flowRate || !kwh || !horsepower || !fieldArea) return 0

  const { minutesPerHour, hoursPerKwhDivisor } = CALCULATION_PARAMS

  return (
    (flowRate * minutesPerHour * kwh) /
    (hoursPerKwhDivisor * horsepower * fieldArea)
  )
}

/**
 * Convert hectares to fen (Taiwan land unit)
 * 1 fen = 0.0969 hectares
 *
 * @param {number} hectares - Area in hectares
 * @returns {number} Area in fen
 */
export function hectaresToFen(hectares) {
  return hectares / 0.0969
}

/**
 * Convert fen to hectares
 *
 * @param {number} fen - Area in fen
 * @returns {number} Area in hectares
 */
export function fenToHectares(fen) {
  return fen * 0.0969
}

/**
 * Check if water volume exceeds extraction threshold
 *
 * @param {number} volume - Monthly water volume in m³
 * @returns {boolean} True if over extraction
 */
export function isOverExtraction(volume) {
  return volume > CALCULATION_PARAMS.overExtractionThreshold
}
