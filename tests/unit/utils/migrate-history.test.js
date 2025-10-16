import { describe, it, expect, vi } from 'vitest'
import {
  addBillingPeriodToLegacyRecords,
  migrateHistoryOnStartup,
} from '../../../src/utils/migrate-history.js'

describe('migrate-history.js', () => {
  describe('addBillingPeriodToLegacyRecords', () => {
    it('should skip records that already have billingPeriodStart and billingPeriodEnd', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000, // 2024-07-12
          billingPeriodStart: '2024-07-01',
          billingPeriodEnd: '2024-07-31',
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result).toHaveLength(1)
      expect(result[0].billingPeriodStart).toBe('2024-07-01')
      expect(result[0].billingPeriodEnd).toBe('2024-07-31')
      expect(result[0].timestamp).toBe(1720713600000) // Unchanged
    })

    it('should add billingPeriod fields to old records without them (migrate from timestamp)', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000, // 2024-07-12T00:00:00Z
          reading: 1500,
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('billingPeriodStart')
      expect(result[0]).toHaveProperty('billingPeriodEnd')
      expect(result[0].billingPeriodStart).toMatch(/2024-07-1[12]/) // Date from timestamp
      expect(result[0].billingPeriodEnd).toBe(result[0].billingPeriodStart) // Same day
    })

    it('should set billingPeriodStart and billingPeriodEnd to same day for legacy records', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000, // 2024-07-12
          reading: 1500,
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result[0].billingPeriodStart).toBe(result[0].billingPeriodEnd)
    })

    it('should handle empty array', () => {
      const result = addBillingPeriodToLegacyRecords([])
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should return empty array for null input', () => {
      const result = addBillingPeriodToLegacyRecords(null)
      expect(result).toEqual([])
    })

    it('should return empty array for undefined input', () => {
      const result = addBillingPeriodToLegacyRecords(undefined)
      expect(result).toEqual([])
    })

    it('should return empty array for non-array input', () => {
      const result = addBillingPeriodToLegacyRecords('not-an-array')
      expect(result).toEqual([])
    })

    it('should handle large dataset migration (100+ records)', () => {
      const records = Array.from({ length: 150 }, (_, i) => ({
        id: `record-${i}`,
        timestamp: 1720713600000 + i * 86400000, // Each day apart
        reading: 1000 + i * 10,
      }))

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result).toHaveLength(150)

      // Check all records have billing period fields
      result.forEach((record) => {
        expect(record).toHaveProperty('billingPeriodStart')
        expect(record).toHaveProperty('billingPeriodEnd')
        expect(record.billingPeriodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(record.billingPeriodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should handle mixed records (some with, some without billingPeriod)', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000,
          billingPeriodStart: '2024-07-01',
          billingPeriodEnd: '2024-07-31',
        },
        {
          id: '2',
          timestamp: 1718121600000, // No billingPeriod fields
          reading: 1400,
        },
        {
          id: '3',
          timestamp: 1721318400000,
          billingPeriodStart: '2024-07-10',
          billingPeriodEnd: '2024-08-09',
        },
        {
          id: '4',
          timestamp: 1715529600000, // No billingPeriod fields
          reading: 1300,
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result).toHaveLength(4)

      // Record 1: Already had billingPeriod (unchanged)
      expect(result[0].billingPeriodStart).toBe('2024-07-01')
      expect(result[0].billingPeriodEnd).toBe('2024-07-31')

      // Record 2: Migrated from timestamp
      expect(result[1].billingPeriodStart).toMatch(/2024-06-1[12]/)
      expect(result[1].billingPeriodEnd).toBe(result[1].billingPeriodStart)

      // Record 3: Already had billingPeriod (unchanged)
      expect(result[2].billingPeriodStart).toBe('2024-07-10')
      expect(result[2].billingPeriodEnd).toBe('2024-08-09')

      // Record 4: Migrated from timestamp
      expect(result[3].billingPeriodStart).toMatch(/2024-05-1[23]/)
      expect(result[3].billingPeriodEnd).toBe(result[3].billingPeriodStart)
    })

    it('should use current date fallback for corrupted record with missing timestamp', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const records = [
        {
          id: 'corrupted-1',
          reading: 1500,
          // No timestamp field
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('billingPeriodStart')
      expect(result[0]).toHaveProperty('billingPeriodEnd')
      expect(result[0].billingPeriodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Current date
      expect(result[0].billingPeriodEnd).toBe(result[0].billingPeriodStart)

      // Should log warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Record corrupted-1 has no valid timestamp'),
      )

      consoleSpy.mockRestore()
    })

    it('should use current date fallback for corrupted record with invalid timestamp', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const records = [
        {
          id: 'corrupted-2',
          timestamp: 'invalid-timestamp',
          reading: 1500,
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('billingPeriodStart')
      expect(result[0]).toHaveProperty('billingPeriodEnd')
      expect(result[0].billingPeriodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Record corrupted-2 has no valid timestamp'),
      )

      consoleSpy.mockRestore()
    })

    it('should preserve all original fields when migrating', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000,
          reading: 1500,
          cost: 250,
          season: '夏月',
          notes: 'Test record',
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      expect(result[0]).toMatchObject({
        id: '1',
        timestamp: 1720713600000,
        reading: 1500,
        cost: 250,
        season: '夏月',
        notes: 'Test record',
      })
      expect(result[0]).toHaveProperty('billingPeriodStart')
      expect(result[0]).toHaveProperty('billingPeriodEnd')
    })

    it('should handle record with only billingPeriodStart (missing billingPeriodEnd)', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000,
          billingPeriodStart: '2024-07-01',
          // Missing billingPeriodEnd
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      // Should add billingPeriod fields since billingPeriodEnd is missing
      expect(result[0]).toHaveProperty('billingPeriodStart')
      expect(result[0]).toHaveProperty('billingPeriodEnd')
      expect(result[0].billingPeriodStart).toMatch(/2024-07-1[12]/)
      expect(result[0].billingPeriodEnd).toBe(result[0].billingPeriodStart)
    })

    it('should handle record with only billingPeriodEnd (missing billingPeriodStart)', () => {
      const records = [
        {
          id: '1',
          timestamp: 1720713600000,
          billingPeriodEnd: '2024-07-31',
          // Missing billingPeriodStart
        },
      ]

      const result = addBillingPeriodToLegacyRecords(records)

      // Should add billingPeriod fields since billingPeriodStart is missing
      expect(result[0]).toHaveProperty('billingPeriodStart')
      expect(result[0]).toHaveProperty('billingPeriodEnd')
      expect(result[0].billingPeriodStart).toMatch(/2024-07-1[12]/)
      expect(result[0].billingPeriodEnd).toBe(result[0].billingPeriodStart)
    })
  })

  describe('migrateHistoryOnStartup', () => {
    it('should migrate records when legacy records exist', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockStore = {
        records: [
          {
            id: '1',
            timestamp: 1720713600000,
            reading: 1500,
            // No billingPeriod fields
          },
          {
            id: '2',
            timestamp: 1718121600000,
            reading: 1400,
          },
        ],
        saveToLocalStorage: vi.fn(),
      }

      migrateHistoryOnStartup(mockStore)

      // Should migrate records
      expect(mockStore.records).toHaveLength(2)
      expect(mockStore.records[0]).toHaveProperty('billingPeriodStart')
      expect(mockStore.records[0]).toHaveProperty('billingPeriodEnd')
      expect(mockStore.records[1]).toHaveProperty('billingPeriodStart')
      expect(mockStore.records[1]).toHaveProperty('billingPeriodEnd')

      // Should save to localStorage
      expect(mockStore.saveToLocalStorage).toHaveBeenCalled()

      // Should log migration messages
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Migrating 2 history records'),
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Migration completed successfully'),
      )

      consoleSpy.mockRestore()
    })

    it('should skip migration when no legacy records exist', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockStore = {
        records: [
          {
            id: '1',
            timestamp: 1720713600000,
            billingPeriodStart: '2024-07-01',
            billingPeriodEnd: '2024-07-31',
          },
        ],
        saveToLocalStorage: vi.fn(),
      }

      migrateHistoryOnStartup(mockStore)

      // Should not call saveToLocalStorage
      expect(mockStore.saveToLocalStorage).not.toHaveBeenCalled()

      // Should log skip message
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] No legacy records found'),
      )

      consoleSpy.mockRestore()
    })

    it('should skip migration when records array is empty', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockStore = {
        records: [],
        saveToLocalStorage: vi.fn(),
      }

      migrateHistoryOnStartup(mockStore)

      expect(mockStore.saveToLocalStorage).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] No legacy records found'),
      )

      consoleSpy.mockRestore()
    })

    it('should handle invalid history store gracefully (null)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      migrateHistoryOnStartup(null)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Invalid history store'),
      )

      consoleSpy.mockRestore()
    })

    it('should handle invalid history store gracefully (undefined)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      migrateHistoryOnStartup(undefined)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Invalid history store'),
      )

      consoleSpy.mockRestore()
    })

    it('should handle missing records property', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mockStore = {
        saveToLocalStorage: vi.fn(),
        // No records property
      }

      migrateHistoryOnStartup(mockStore)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Invalid history store'),
      )

      consoleSpy.mockRestore()
    })

    it('should handle migration errors gracefully without crashing', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mockStore = {
        records: [
          {
            id: '1',
            timestamp: 1720713600000,
          },
        ],
        saveToLocalStorage: vi.fn(() => {
          throw new Error('LocalStorage error')
        }),
      }

      // Should not throw
      expect(() => {
        migrateHistoryOnStartup(mockStore)
      }).not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] Migration failed'),
        expect.any(Error),
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Migration] App will continue with unmigrated data'),
      )

      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('should handle store without saveToLocalStorage method', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockStore = {
        records: [
          {
            id: '1',
            timestamp: 1720713600000,
          },
        ],
        // No saveToLocalStorage method
      }

      // Should not throw
      expect(() => {
        migrateHistoryOnStartup(mockStore)
      }).not.toThrow()

      // Migration should still happen
      expect(mockStore.records[0]).toHaveProperty('billingPeriodStart')
      expect(mockStore.records[0]).toHaveProperty('billingPeriodEnd')

      consoleSpy.mockRestore()
    })
  })
})
