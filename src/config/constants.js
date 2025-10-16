// Calculation constants for water flow estimation
export const CALCULATION_PARAMS = {
  gravityConstant: 0.222, // Gravity constant for water pumping
  safetyFactor: 1.2, // Safety factor in flow calculation
  minutesPerHour: 60, // Minutes per hour conversion
  hoursPerKwhDivisor: 2, // Hours per kWh divisor for average operating hours
  overExtractionThreshold: 2000, // Warning threshold for monthly volume (m³)
}
