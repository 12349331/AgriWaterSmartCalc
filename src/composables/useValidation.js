// Validation rules with Traditional Chinese error messages
// Enhanced to support both hard errors and soft warnings
export function useValidation() {
  const rules = {
    billAmount: (value) => {
      if (!value || value <= 0) return { error: '電費金額必須大於 0 元', warning: null }
      if (value > 50000) return { error: '電費金額異常，請檢查輸入', warning: null }
      return { error: null, warning: null }
    },

    fieldArea: (value) => {
      if (!value || value < 0.5) return { error: '耕作面積至少需 0.5 分地', warning: null }
      if (value > 50) return { error: '耕作面積超過 50 分地，請確認輸入', warning: null }
      return { error: null, warning: null }
    },

    pumpEfficiency: (value) => {
      // Hard validation
      if (value === null || value === undefined || value === '') {
        return { error: '請輸入抽水效率', warning: null }
      }

      const num = parseFloat(value)

      if (isNaN(num)) {
        return { error: '抽水效率必須是數字', warning: null }
      }

      if (num < 0.0 || num > 1.0) {
        return { error: '效率值必須在 0.0 到 1.0 之間', warning: null }
      }

      // Soft validation (only if hard validation passed)
      let warning = null
      if (num < 0.2) {
        warning = '效率值偏低(通常為 0.25-0.85),請確認'
      } else if (num > 0.9) {
        warning = '效率值偏高(通常為 0.25-0.85),請確認'
      }

      return { error: null, warning }
    },

    wellDepth: (value) => {
      // Hard validation
      if (value === null || value === undefined || value === '') {
        return { error: '請輸入水井深度', warning: null }
      }

      const num = parseFloat(value)

      if (isNaN(num)) {
        return { error: '水井深度必須是數字', warning: null }
      }

      if (num <= 0) {
        return { error: '水井深度必須大於 0', warning: null }
      }

      if (num > 1000) {
        return { error: '水井深度過大(最大 1,000 公尺),請確認', warning: null }
      }

      // Soft validation (only if hard validation passed)
      let warning = null
      if (num < 5 || num > 100) {
        warning = '深度異常,請確認'
      }

      return { error: null, warning }
    },

    cropType: (value) => {
      if (!value) return { error: '請選擇作物類型', warning: null }
      return { error: null, warning: null }
    },

    region: (value) => {
      if (!value) return { error: '請選擇地區', warning: null }
      return { error: null, warning: null }
    },

    pumpHorsepower: (value) => {
      if (value === null || value === undefined || value === '') {
        return { error: '請輸入抽水馬力', warning: null }
      }

      const num = parseFloat(value)

      if (isNaN(num)) {
        return { error: '抽水馬力必須是數字', warning: null }
      }

      if (num < 1.0) {
        return { error: '抽水馬力至少需 1.0 HP', warning: null }
      }

      if (num > 50.0) {
        return { error: '抽水馬力超過 50 HP，請確認輸入', warning: null }
      }

      return { error: null, warning: null }
    },
  }

  /**
   * Validate a single field and return both error and warning
   * @param {string} fieldName - Name of the field to validate
   * @param {any} value - Value to validate
   * @returns {Object} { error: string|null, warning: string|null }
   */
  function validateField(fieldName, value) {
    const validator = rules[fieldName]
    if (!validator) return { error: null, warning: null }

    const result = validator(value)

    // Backward compatibility: if result is string (old format), treat as error
    if (typeof result === 'string') {
      return { error: result, warning: null }
    }

    return result
  }

  /**
   * Validate all fields in form data
   * @param {Object} formData - Object containing all form fields
   * @returns {Object} { errors: Object, warnings: Object }
   */
  function validateAll(formData) {
    const errors = {}
    const warnings = {}

    for (const [field, value] of Object.entries(formData)) {
      const { error, warning } = validateField(field, value)
      if (error) {
        errors[field] = error
      }
      if (warning) {
        warnings[field] = warning
      }
    }

    return { errors, warnings }
  }

  return {
    rules,
    validateField,
    validateAll,
  }
}
