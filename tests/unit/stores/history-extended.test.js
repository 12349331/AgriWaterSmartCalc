import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore } from '@/stores/history';

describe('History Store Extensions (P3)', () => {
  let historyStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    historyStore = useHistoryStore();
    historyStore.records = [
      { id: '1', billingPeriodStart: '2025-01-01', monthlyVolume: 100, calculatedKwh: 50 },
      { id: '2', billingPeriodStart: '2025-01-15', monthlyVolume: 200, calculatedKwh: 100 },
      { id: '3', billingPeriodStart: '2025-02-01', monthlyVolume: 150, calculatedKwh: 75 },
      { id: '4', billingPeriodStart: '2025-02-28', monthlyVolume: 250, calculatedKwh: 125 },
      { id: '5', billingPeriodStart: '2025-03-10', monthlyVolume: 300, calculatedKwh: 150 },
      { id: '6', billingPeriodStart: '2024-12-20', monthlyVolume: 50, calculatedKwh: 25 },
      { id: '7', billingPeriodStart: '2025-01-31', monthlyVolume: 120, calculatedKwh: 60 }, // Edge case for date range
      { id: '8', billingPeriodStart: null, monthlyVolume: 0, calculatedKwh: 0 }, // Record with no billingPeriodStart
    ];
  });

  describe('filterByDateRange getter', () => {
    it('returns all records if no start or end date is provided', () => {
      const filtered = historyStore.filterByDateRange(null, null);
      expect(filtered.length).toBe(historyStore.records.length);
    });

    it('filters records by start date correctly', () => {
      const filtered = historyStore.filterByDateRange('2025-02-01', null);
      expect(filtered.length).toBe(3); // Records 3, 4, 5
      expect(filtered.map(r => r.id)).toEqual(['3', '4', '5']);
    });

    it('filters records by end date correctly (inclusive)', () => {
      const filtered = historyStore.filterByDateRange(null, '2025-01-31');
      expect(filtered.length).toBe(4); // Records 1, 2, 6, 7
      expect(filtered.map(r => r.id)).toEqual(['1', '2', '6', '7']);
    });

    it('filters records by both start and end dates correctly', () => {
      const filtered = historyStore.filterByDateRange('2025-01-10', '2025-02-10');
      expect(filtered.length).toBe(3); // Records 2, 3, 7 (in array order)
      expect(filtered.map(r => r.id)).toEqual(['2', '3', '7']);
    });

    it('handles cross-year filtering correctly', () => {
      const filtered = historyStore.filterByDateRange('2024-12-15', '2025-01-10');
      expect(filtered.length).toBe(2); // Records 1, 6 (in array order)
      expect(filtered.map(r => r.id)).toEqual(['1', '6']);
    });

    it('excludes records with null billingPeriodStart', () => {
      const filtered = historyStore.filterByDateRange('2025-01-01', '2025-03-31');
      expect(filtered.some(r => r.id === '8')).toBe(false);
      expect(filtered.length).toBe(6); // All records except 8
    });

    it('returns empty array if no records match', () => {
      const filtered = historyStore.filterByDateRange('2026-01-01', '2026-01-31');
      expect(filtered.length).toBe(0);
    });
  });

  describe('statsSummary getter', () => {
    it('calculates correct stats for all records', () => {
      const summary = historyStore.statsSummary(historyStore.records.filter(r => r.billingPeriodStart !== null)); // Exclude null date record for calculation
      expect(summary.recordCount).toBe(7);
      // (100+200+150+250+300+50+120) / 7 = 1170 / 7 = 167.14...
      expect(summary.avgWaterVolume).toBeCloseTo(167.14, 2);
      // (50+100+75+125+150+25+60) = 585
      expect(summary.totalKwh).toBe(585);
    });

    it('calculates correct stats for filtered records', () => {
      const filtered = historyStore.filterByDateRange('2025-01-01', '2025-01-31');
      const summary = historyStore.statsSummary(filtered);
      expect(summary.recordCount).toBe(3); // Records 1, 2, 7
      // (100+200+120) / 3 = 420 / 3 = 140
      expect(summary.avgWaterVolume).toBe(140);
      // (50+100+60) = 210
      expect(summary.totalKwh).toBe(210);
    });

    it('returns zero stats for an empty array of records', () => {
      const summary = historyStore.statsSummary([]);
      expect(summary.recordCount).toBe(0);
      expect(summary.avgWaterVolume).toBe(0);
      expect(summary.totalKwh).toBe(0);
    });
  });
});
