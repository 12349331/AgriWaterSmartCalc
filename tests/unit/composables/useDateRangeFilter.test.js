import { ref } from 'vue';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDateRangeFilter } from '@/composables/useDateRangeFilter';

describe('useDateRangeFilter', () => {
  const mockRecords = ref([
    { id: '1', billingPeriodStart: '2025-01-05' },
    { id: '2', billingPeriodStart: '2025-01-15' },
    { id: '3', billingPeriodStart: '2025-02-01' },
    { id: '4', billingPeriodStart: '2025-02-28' },
    { id: '5', billingPeriodStart: '2025-03-10' },
    { id: '6', billingPeriodStart: '2024-12-20' }, // Cross-year
    { id: '7', billingPeriodStart: '2026-01-01' }, // Future
    { id: '8', billingPeriodStart: null }, // Record with no date
  ]);

  let filterComposable;

  beforeEach(() => {
    filterComposable = useDateRangeFilter(mockRecords, 'billingPeriodStart');
  });

  it('initializes with null start and end dates', () => {
    expect(filterComposable.filterStartDate.value).toBeNull();
    expect(filterComposable.filterEndDate.value).toBeNull();
    expect(filterComposable.filteredRecords.value.length).toBe(mockRecords.value.length);
  });

  it('filters records by start date correctly', () => {
    filterComposable.filterStartDate.value = '2025-02-01';
    expect(filterComposable.filteredRecords.value.length).toBe(4); // 3, 4, 5, 7
    expect(filterComposable.filteredRecords.value.map(r => r.id)).toEqual(['3', '4', '5', '7']);
  });

  it('filters records by end date correctly (inclusive)', () => {
    filterComposable.filterEndDate.value = '2025-01-31';
    expect(filterComposable.filteredRecords.value.length).toBe(3); // 6, 1, 2
    expect(filterComposable.filteredRecords.value.map(r => r.id)).toEqual(['1', '2', '6']);
  });

  it('filters records by both start and end dates correctly', () => {
    filterComposable.filterStartDate.value = '2025-01-10';
    filterComposable.filterEndDate.value = '2025-02-10';
    expect(filterComposable.filteredRecords.value.length).toBe(2); // 2, 3
    expect(filterComposable.filteredRecords.value.map(r => r.id)).toEqual(['2', '3']);
  });

  it('handles cross-year filtering correctly', () => {
    filterComposable.filterStartDate.value = '2024-12-15';
    filterComposable.filterEndDate.value = '2025-01-10';
    expect(filterComposable.filteredRecords.value.length).toBe(2); // 1, 6 (in array order)
    expect(filterComposable.filteredRecords.value.map(r => r.id)).toEqual(['1', '6']);
  });

  it('returns all records if filter dates are invalid or empty', () => {
    filterComposable.filterStartDate.value = 'invalid-date';
    filterComposable.filterEndDate.value = 'invalid-date';
    expect(filterComposable.filteredRecords.value.length).toBe(mockRecords.value.length);
  });

  it('clears the filter and restores all records', async () => {
    filterComposable.filterStartDate.value = '2025-01-01';
    filterComposable.filterEndDate.value = '2025-01-31';
    expect(filterComposable.filteredRecords.value.length).toBe(2);

    filterComposable.clearFilter();
    expect(filterComposable.filterStartDate.value).toBeNull();
    expect(filterComposable.filterEndDate.value).toBeNull();
    expect(filterComposable.filteredRecords.value.length).toBe(mockRecords.value.length);
  });

  it('applyFilter method does not change behavior (reactive filter)', () => {
    filterComposable.filterStartDate.value = '2025-01-01';
    const initialFilteredCount = filterComposable.filteredRecords.value.length;
    filterComposable.applyFilter(); // Should not change anything as it's reactive
    expect(filterComposable.filteredRecords.value.length).toBe(initialFilteredCount);
  });

  it('excludes records with null billingPeriodStart from filtering', () => {
    filterComposable.filterStartDate.value = '2025-01-01';
    filterComposable.filterEndDate.value = '2025-01-31';
    // Record 8 has null billingPeriodStart and should not be included in any date-filtered results
    expect(filterComposable.filteredRecords.value.some(r => r.id === '8')).toBe(false);
  });
});
