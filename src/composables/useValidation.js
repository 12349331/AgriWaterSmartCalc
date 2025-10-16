// Validation rules with Traditional Chinese error messages
export function useValidation() {
  const rules = {
    billAmount: (value) => {
      if (!value || value <= 0) return '電費金額必須大於 0 元'
      if (value > 50000) return '電費金額異常，請檢查輸入'
      return null
    },

    fieldArea: (value) => {
      if (!value || value < 0.5) return '耕作面積至少需 0.5 分地'
      if (value > 50) return '耕作面積超過 50 分地，請確認輸入'
      return null
    },

    pumpEfficiency: (value) => {
      if (!value || value <= 0) return '抽水效率必須大於 0'
      if (value > 1.0) return '抽水效率不可超過 1.0（100%）'
      return null
    },

    wellDepth: (value) => {
      if (!value || value <= 0) return '水井深度必須大於 0 公尺'
      if (value > 200) return '水井深度超過 200 公尺，請確認輸入'
      return null
    },

    cropType: (value) => {
      if (!value) return '請選擇作物類型'
      return null
    },

    region: (value) => {
      if (!value) return '請選擇地區'
      return null
    },
  }

  function validateField(fieldName, value) {
    const validator = rules[fieldName]
    if (!validator) return null
    return validator(value)
  }

  function validateAll(formData) {
    const errors = {}
    for (const [field, value] of Object.entries(formData)) {
      const error = validateField(field, value)
      if (error) {
        errors[field] = error
      }
    }
    return errors
  }

  return {
    rules,
    validateField,
    validateAll,
  }
}
