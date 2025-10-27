import { describe, it, expect } from 'vitest'
import { encodeData, decodeData } from '@/utils/dataEncoder'

describe('dataEncoder', () => {
  describe('encodeData', () => {
    it('應該編碼簡單物件', () => {
      const data = { name: '水稻', value: 100 }
      const encoded = encodeData(data)

      expect(encoded).toBeTruthy()
      expect(encoded).toBeTypeOf('string')
      expect(encoded).not.toContain('水稻')
    })

    it('應該編碼陣列', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const encoded = encodeData(data)

      expect(encoded).toBeTruthy()
      expect(encoded).not.toContain('[')
    })

    it('應該處理中文字元', () => {
      const data = { cropType: '水稻', region: '台南' }
      const encoded = encodeData(data)

      expect(encoded).toBeTruthy()
      expect(encoded).not.toContain('水稻')
      expect(encoded).not.toContain('台南')
    })
  })

  describe('decodeData', () => {
    it('應該解碼編碼後的資料', () => {
      const original = { name: '水稻', value: 100 }
      const encoded = encodeData(original)
      const decoded = decodeData(encoded)

      expect(decoded).toEqual(original)
    })

    it('應該解碼陣列', () => {
      const original = [{ id: 1 }, { id: 2 }]
      const encoded = encodeData(original)
      const decoded = decodeData(encoded)

      expect(decoded).toEqual(original)
    })

    it('應該正確處理中文', () => {
      const original = { cropType: '水稻', region: '台南' }
      const encoded = encodeData(original)
      const decoded = decodeData(encoded)

      expect(decoded).toEqual(original)
    })

    it('應該向後相容明文資料', () => {
      const plaintext = JSON.stringify({ name: '測試' })
      const decoded = decodeData(plaintext)

      expect(decoded).toEqual({ name: '測試' })
    })
  })

  describe('編碼/解碼循環', () => {
    it('應該完整保留複雜物件', () => {
      const original = {
        id: 'test-123',
        cropType: '水稻',
        region: '台南',
        billAmount: 1234.56,
        fieldArea: 10.5,
        notes: '這是備註，包含特殊字元 !@#$%',
        timestamp: Date.now(),
      }

      const encoded = encodeData(original)
      const decoded = decodeData(encoded)

      expect(decoded).toEqual(original)
    })
  })
})

