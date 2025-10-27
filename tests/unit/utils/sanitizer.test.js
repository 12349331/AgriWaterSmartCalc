import { describe, it, expect } from 'vitest'
import { sanitizeInput, sanitizeObject, sanitizeArray } from '@/utils/sanitizer'

describe('sanitizer', () => {
  describe('sanitizeInput', () => {
    it('移除 HTML 標籤', () => {
      const input = '<script>alert("XSS")</script>正常文字'
      const result = sanitizeInput(input)
      expect(result).toBe('正常文字')
      expect(result).not.toContain('<script>')
    })

    it('移除事件處理器', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeInput(input)
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('alert')
    })

    it('移除 iframe 標籤', () => {
      const input = '<iframe src="evil.com"></iframe>安全內容'
      const result = sanitizeInput(input)
      expect(result).toBe('安全內容')
      expect(result).not.toContain('iframe')
    })

    it('保留純文字內容', () => {
      const input = '這是純文字內容，包含數字123和符號!@#'
      const result = sanitizeInput(input)
      expect(result).toBe(input)
    })

    it('處理非字串輸入', () => {
      expect(sanitizeInput(123)).toBe(123)
      expect(sanitizeInput(null)).toBe(null)
      expect(sanitizeInput(undefined)).toBe(undefined)
      expect(sanitizeInput({})).toEqual({})
    })

    it('移除危險的 javascript: 協議', () => {
      const input = '<a href="javascript:alert(1)">連結</a>'
      const result = sanitizeInput(input)
      expect(result).toBe('連結')
      expect(result).not.toContain('javascript:')
    })

    it('處理複雜的 XSS 攻擊嘗試', () => {
      const input = '<svg/onload=alert(1)>文字內容'
      const result = sanitizeInput(input)
      expect(result).toBe('文字內容')
      expect(result).not.toContain('onload')
      expect(result).not.toContain('<svg')
    })
  })

  describe('sanitizeObject', () => {
    it('淨化物件中指定的字串欄位', () => {
      const input = {
        cropType: '<script>alert("XSS")</script>水稻',
        region: '台南<img src=x onerror=alert(1)>',
        notes: '正常備註',
        fieldArea: 10,
      }

      const result = sanitizeObject(input, ['cropType', 'region', 'notes'])

      expect(result.cropType).toBe('水稻')
      expect(result.region).toBe('台南')
      expect(result.notes).toBe('正常備註')
      expect(result.fieldArea).toBe(10)
      expect(result.cropType).not.toContain('<script>')
    })

    it('不影響未指定的欄位', () => {
      const input = {
        cropType: '<script>alert("XSS")</script>水稻',
        untouched: '<div>這個不應該被淨化</div>',
      }

      const result = sanitizeObject(input, ['cropType'])

      expect(result.cropType).toBe('水稻')
      expect(result.untouched).toBe('<div>這個不應該被淨化</div>')
    })

    it('處理空物件', () => {
      const result = sanitizeObject({}, ['cropType'])
      expect(result).toEqual({})
    })

    it('處理不存在的欄位', () => {
      const input = { cropType: '水稻' }
      const result = sanitizeObject(input, ['cropType', 'nonexistent'])
      expect(result.cropType).toBe('水稻')
    })
  })

  describe('sanitizeArray', () => {
    it('淨化陣列中的字串元素', () => {
      const input = [
        '<script>alert("XSS")</script>水稻',
        '正常文字',
        '<img src=x onerror=alert(1)>玉米',
      ]

      const result = sanitizeArray(input)

      expect(result).toHaveLength(3)
      expect(result[0]).toBe('水稻')
      expect(result[1]).toBe('正常文字')
      expect(result[2]).toBe('玉米')
      expect(result.join('')).not.toContain('<script>')
    })

    it('保留非字串元素', () => {
      const input = ['文字', 123, null, { key: 'value' }]
      const result = sanitizeArray(input)

      expect(result).toHaveLength(4)
      expect(result[0]).toBe('文字')
      expect(result[1]).toBe(123)
      expect(result[2]).toBe(null)
      expect(result[3]).toEqual({ key: 'value' })
    })

    it('處理空陣列', () => {
      const result = sanitizeArray([])
      expect(result).toEqual([])
    })

    it('處理非陣列輸入', () => {
      expect(sanitizeArray(null)).toBe(null)
      expect(sanitizeArray(undefined)).toBe(undefined)
      expect(sanitizeArray('string')).toBe('string')
    })
  })
})

