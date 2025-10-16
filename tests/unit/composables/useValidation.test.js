import { describe, it, expect } from 'vitest'
import { useValidation } from '@/composables/useValidation'

describe('useValidation', () => {
  const { rules, validateField } = useValidation()

  describe('billAmount validation', () => {
    it('should validate valid bill amounts', () => {
      expect(validateField('billAmount', 1000)).toBeNull()
      expect(validateField('billAmount', 5000)).toBeNull()
    })

    it('should reject zero or negative amounts', () => {
      expect(validateField('billAmount', 0)).toBe('電費金額必須大於 0 元')
      expect(validateField('billAmount', -100)).toBe('電費金額必須大於 0 元')
    })

    it('should reject abnormally high amounts', () => {
      expect(validateField('billAmount', 50001)).toBe(
        '電費金額異常，請檢查輸入',
      )
      expect(validateField('billAmount', 100000)).toBe(
        '電費金額異常，請檢查輸入',
      )
    })
  })

  describe('fieldArea validation', () => {
    it('should validate valid field areas', () => {
      expect(validateField('fieldArea', 1)).toBeNull()
      expect(validateField('fieldArea', 10)).toBeNull()
    })

    it('should reject areas below minimum', () => {
      expect(validateField('fieldArea', 0.4)).toBe('耕作面積至少需 0.5 分地')
      expect(validateField('fieldArea', 0)).toBe('耕作面積至少需 0.5 分地')
    })

    it('should reject areas above maximum', () => {
      expect(validateField('fieldArea', 51)).toBe(
        '耕作面積超過 50 分地，請確認輸入',
      )
      expect(validateField('fieldArea', 100)).toBe(
        '耕作面積超過 50 分地，請確認輸入',
      )
    })
  })

  describe('pumpEfficiency validation', () => {
    it('should validate valid efficiency values', () => {
      expect(validateField('pumpEfficiency', 0.75)).toBeNull()
      expect(validateField('pumpEfficiency', 0.5)).toBeNull()
      expect(validateField('pumpEfficiency', 1.0)).toBeNull()
    })

    it('should reject zero or negative values', () => {
      expect(validateField('pumpEfficiency', 0)).toBe('抽水效率必須大於 0')
      expect(validateField('pumpEfficiency', -0.5)).toBe('抽水效率必須大於 0')
    })

    it('should reject values above 1.0', () => {
      expect(validateField('pumpEfficiency', 1.1)).toBe(
        '抽水效率不可超過 1.0（100%）',
      )
      expect(validateField('pumpEfficiency', 2)).toBe(
        '抽水效率不可超過 1.0（100%）',
      )
    })
  })

  describe('wellDepth validation', () => {
    it('should validate valid well depths', () => {
      expect(validateField('wellDepth', 20)).toBeNull()
      expect(validateField('wellDepth', 50)).toBeNull()
    })

    it('should reject zero or negative depths', () => {
      expect(validateField('wellDepth', 0)).toBe('水井深度必須大於 0 公尺')
      expect(validateField('wellDepth', -10)).toBe('水井深度必須大於 0 公尺')
    })

    it('should reject depths above maximum', () => {
      expect(validateField('wellDepth', 201)).toBe(
        '水井深度超過 200 公尺，請確認輸入',
      )
      expect(validateField('wellDepth', 500)).toBe(
        '水井深度超過 200 公尺，請確認輸入',
      )
    })
  })

  describe('cropType validation', () => {
    it('should validate non-empty crop type', () => {
      expect(validateField('cropType', '水稻')).toBeNull()
      expect(validateField('cropType', '葉菜類')).toBeNull()
    })

    it('should reject empty crop type', () => {
      expect(validateField('cropType', '')).toBe('請選擇作物類型')
      expect(validateField('cropType', null)).toBe('請選擇作物類型')
    })
  })

  describe('region validation', () => {
    it('should validate non-empty region', () => {
      expect(validateField('region', 'north')).toBeNull()
      expect(validateField('region', 'south')).toBeNull()
    })

    it('should reject empty region', () => {
      expect(validateField('region', '')).toBe('請選擇地區')
      expect(validateField('region', null)).toBe('請選擇地區')
    })
  })
})
