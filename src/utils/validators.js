// Pure validation functions (no dependencies)

export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function isInRange(value, min, max) {
  return isValidNumber(value) && value >= min && value <= max
}

export function isPositive(value) {
  return isValidNumber(value) && value > 0
}

export function isValidBillAmount(amount) {
  return isInRange(amount, 0, 50000)
}

export function isValidFieldArea(area) {
  return isInRange(area, 0.5, 50)
}

export function isValidPumpEfficiency(efficiency) {
  return isInRange(efficiency, 0, 1.0)
}

export function isValidWellDepth(depth) {
  return isPositive(depth) && depth <= 200
}
