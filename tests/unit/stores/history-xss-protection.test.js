import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHistoryStore } from '@/stores/history'

describe('useHistoryStore - XSS Protection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('新增記錄時的 XSS 防護', () => {
    it('應移除作物類型中的腳本標籤', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '<script>alert("XSS")</script>水稻',
        region: '台南',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.cropType).toBe('水稻')
      expect(record.cropType).not.toContain('<script>')
      expect(record.cropType).not.toContain('alert')
    })

    it('應移除地區中的惡意標籤', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '水稻',
        region: '台南<img src=x onerror=alert(1)>',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.region).toBe('台南')
      expect(record.region).not.toContain('<img')
      expect(record.region).not.toContain('onerror')
    })

    it('應移除備註中的 iframe 標籤', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '水稻',
        region: '台南',
        notes: '<iframe src="evil.com"></iframe>重要備註',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.notes).toBe('重要備註')
      expect(record.notes).not.toContain('iframe')
    })

    it('應保留正常的文字內容', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '水稻',
        region: '台南市',
        notes: '這是正常的備註，包含數字123和符號!@#',
        pricingType: '表燈非營業用',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.cropType).toBe('水稻')
      expect(record.region).toBe('台南市')
      expect(record.notes).toBe('這是正常的備註，包含數字123和符號!@#')
      expect(record.pricingType).toBe('表燈非營業用')
    })
  })

  describe('更新記錄時的 XSS 防護', () => {
    it('應在更新時淨化惡意內容', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '水稻',
        region: '台南',
        billAmount: 1000,
        fieldArea: 5,
      })

      store.updateRecord(record.id, {
        cropType: '<svg/onload=alert(1)>玉米',
        notes: '<script>document.cookie</script>更新備註',
      })

      const updated = store.getRecordById(record.id)
      expect(updated.cropType).toBe('玉米')
      expect(updated.notes).toBe('更新備註')
      expect(updated.cropType).not.toContain('svg')
      expect(updated.notes).not.toContain('script')
    })
  })

  describe('從 localStorage 載入時的 XSS 防護', () => {
    it('應淨化從 localStorage 載入的惡意內容', () => {
      // 模擬被手動修改過的 localStorage 資料
      const maliciousData = [
        {
          id: 'test-1',
          cropType: '<script>alert("XSS")</script>水稻',
          region: '台南<img src=x onerror=alert(1)>',
          notes: '<iframe src="evil.com"></iframe>備註',
          billAmount: 1000,
          fieldArea: 5,
          timestamp: Date.now(),
        },
      ]

      localStorage.setItem('aquametrics_history', JSON.stringify(maliciousData))

      // 建立新的 store 實例來觸發載入
      const store = useHistoryStore()

      const record = store.records[0]
      expect(record.cropType).toBe('水稻')
      expect(record.region).toBe('台南')
      expect(record.notes).toBe('備註')
      expect(record.cropType).not.toContain('<script>')
      expect(record.region).not.toContain('<img')
      expect(record.notes).not.toContain('iframe')
    })
  })

  describe('複雜的 XSS 攻擊防護', () => {
    it('應防護 javascript: 協議注入', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '水稻',
        region: '<a href="javascript:alert(1)">台南</a>',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.region).toBe('台南')
      expect(record.region).not.toContain('javascript:')
      expect(record.region).not.toContain('href')
    })

    it('應防護事件處理器注入', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '<div onclick="alert(1)">水稻</div>',
        region: '台南',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.cropType).toBe('水稻')
      expect(record.cropType).not.toContain('onclick')
      expect(record.cropType).not.toContain('div')
    })

    it('應防護 SVG 標籤攻擊', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '<svg onload="alert(1)">玉米</svg>',
        region: '台南',
        billAmount: 1000,
        fieldArea: 5,
      })

      expect(record.cropType).toBe('玉米')
      expect(record.cropType).not.toContain('svg')
      expect(record.cropType).not.toContain('onload')
    })
  })

  describe('數字和數值欄位不受影響', () => {
    it('數字欄位應保持原樣', () => {
      const store = useHistoryStore()

      const record = store.addRecord({
        cropType: '<script>alert(1)</script>水稻',
        region: '台南',
        billAmount: 1234.56,
        fieldArea: 10.5,
        pumpHorsepower: 20,
        pumpEfficiency: 0.75,
        wellDepth: 50,
      })

      expect(record.billAmount).toBe(1234.56)
      expect(record.fieldArea).toBe(10.5)
      expect(record.pumpHorsepower).toBe(20)
      expect(record.pumpEfficiency).toBe(0.75)
      expect(record.wellDepth).toBe(50)
    })
  })
})

