import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalculationStore } from '@/stores/calculation'
import { determineBillingSeason } from '@/utils/billing-seasons'

describe('useCalculationStore - BillingDate Integration', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCalculationStore()
  })

  describe('State Management', () => {
    it('should have billingDate in state', () => {
      expect(store.billingDate).toBeDefined()
    })

    it('should initialize billingDate to today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(store.billingDate).toBe(today)
    })

    it('should have billingSeason computed property', () => {
      expect(store.billingSeason).toBeDefined()
      expect(['夏月', '非夏月']).toContain(store.billingSeason)
    })
  })

  describe('setBillingDate Action', () => {
    it('should update billingDate state', () => {
      store.setBillingDate('2024-07-15')
      expect(store.billingDate).toBe('2024-07-15')
    })

    it('should automatically update billingSeason when date changes', () => {
      store.setBillingDate('2024-07-15')
      expect(store.billingSeason).toBe('夏月')
      
      store.setBillingDate('2024-11-15')
      expect(store.billingSeason).toBe('非夏月')
    })

    it('should validate date format (ISO 8601)', () => {
      expect(() => store.setBillingDate('invalid-date')).toThrow()
    })

    it('should reject dates outside allowed range', () => {
      expect(() => store.setBillingDate('2019-12-31')).toThrow('日期超出允許範圍')
    })

    it('should handle boundary dates correctly', () => {
      store.setBillingDate('2024-06-01')
      expect(store.billingSeason).toBe('夏月')
      
      store.setBillingDate('2024-09-30')
      expect(store.billingSeason).toBe('夏月')
      
      store.setBillingDate('2024-10-01')
      expect(store.billingSeason).toBe('非夏月')
    })
  })

  describe('calculate Action with BillingDate', () => {
    it('should include billingDate in calculation payload', () => {
      const calculateSpy = vi.spyOn(store, 'calculate')
      
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(calculateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          usage: 350,
        }),
      )
      
      // Verify internal state includes billingDate
      expect(store.billingDate).toBe('2024-07-15')
    })

    it('should use current billingDate if not provided in payload', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(store.billingDate).toBe('2024-07-15')
    })

    it('should determine billingSeason based on billingDate', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })

      expect(store.billingSeason).toBe(determineBillingSeason('2024-07-15', '2024-07-15'))
    })
  })

  describe('Result Storage with BillingDate', () => {
    it('should include billingDate in calculation result', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(store.result).toBeDefined()
      expect(store.result.billingDate).toBe('2024-07-15')
    })

    it('should include billingSeason in calculation result', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(store.result.billingSeason).toBe('夏月')
    })

    it('should include timestamp in calculation result', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(store.result.timestamp).toBeDefined()
      expect(typeof store.result.timestamp).toBe('number')
    })
  })

  describe('Future Date Handling', () => {
    it('should allow future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      expect(() => store.setBillingDate(futureDateStr)).not.toThrow()
    })

    it('should flag future dates in result metadata', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      store.setBillingDate(futureDateStr)
      store.calculate({ usage: 350 })
      
      expect(store.result.isFutureDate).toBe(true)
    })

    it('should not flag current or past dates', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(store.result.isFutureDate).toBe(false)
    })
  })

  describe('Season-Based Calculation Logic', () => {
    it('should use summer rates for 夏月', () => {
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      // Summer rates are higher than non-summer
      const summerCost = store.result.totalCost
      
      store.setBillingDate('2024-11-15')
      store.calculate({ usage: 350 })
      
      const nonSummerCost = store.result.totalCost
      
      expect(summerCost).toBeGreaterThan(nonSummerCost)
    })

    it('should use non-summer rates for 非夏月', () => {
      store.setBillingDate('2024-01-15')
      store.calculate({ usage: 350 })
      
      expect(store.billingSeason).toBe('非夏月')
      expect(store.result.rateType).toBe('非夏月')
    })

    it('should handle boundary date calculations correctly', () => {
      // Test all 4 boundary dates
      const boundaries = [
        { date: '2024-06-01', expected: '夏月' },
        { date: '2024-09-30', expected: '夏月' },
        { date: '2024-10-01', expected: '非夏月' },
        { date: '2024-05-31', expected: '非夏月' },
      ]
      
      boundaries.forEach(({ date, expected }) => {
        store.setBillingDate(date)
        store.calculate({ usage: 350 })
        expect(store.billingSeason).toBe(expected)
        expect(store.result.rateType).toBe(expected)
      })
    })
  })

  describe('Persistence Integration', () => {
    it('should persist billingDate to localStorage on calculation', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      
      store.setBillingDate('2024-07-15')
      store.calculate({ usage: 350 })
      
      expect(setItemSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('2024-07-15'),
      )
    })

    it('should restore billingDate from localStorage', () => {
      // Simulate stored data
      const storedData = {
        billingDate: '2024-07-15',
        billingSeason: '夏月',
        usage: 350,
        timestamp: Date.now(),
      }
      
      localStorage.setItem('aquametrics_last_calculation', JSON.stringify(storedData))
      
      // Create new store instance to trigger restoration
      const newStore = useCalculationStore()
      
      expect(newStore.billingDate).toBe('2024-07-15')
      expect(newStore.billingSeason).toBe('夏月')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null billingDate gracefully', () => {
      expect(() => store.setBillingDate(null)).toThrow()
    })

    it('should handle undefined billingDate gracefully', () => {
      expect(() => store.setBillingDate(undefined)).toThrow()
    })

    it('should handle leap year dates correctly', () => {
      expect(() => store.setBillingDate('2024-02-29')).not.toThrow()
      expect(() => store.setBillingDate('2023-02-29')).toThrow()
    })

    it('should handle year boundary dates', () => {
      expect(() => store.setBillingDate('2024-01-01')).not.toThrow()
      expect(() => store.setBillingDate('2024-12-31')).not.toThrow()
    })
  })

  describe('Reactivity', () => {
    it('should trigger reactivity when billingDate changes', async () => {
      let reactionCount = 0
      
      // Watch billingSeason changes
      const stopWatch = vi.fn(() => {
        reactionCount++
      })
      
      store.$subscribe(stopWatch)
      
      store.setBillingDate('2024-07-15')
      expect(reactionCount).toBeGreaterThan(0)
    })

    it('should maintain reactivity across multiple date changes', () => {
      const dates = ['2024-06-15', '2024-07-15', '2024-08-15', '2024-11-15']
      const seasons = ['夏月', '夏月', '夏月', '非夏月']
      
      dates.forEach((date, index) => {
        store.setBillingDate(date)
        expect(store.billingSeason).toBe(seasons[index])
      })
    })
  })
})
