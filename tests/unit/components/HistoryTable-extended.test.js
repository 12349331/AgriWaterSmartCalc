import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import HistoryTable from '@/components/history/HistoryTable.vue'
import { useHistoryStore } from '@/stores/history'
import DateRangeFilter from '@/components/common/DateRangeFilter.vue'
import StatsSummary from '@/components/common/StatsSummary.vue'

describe('HistoryTable-extended.vue (P3 Integration)', () => {
  let wrapper
  let historyStore

  const mockRecords = [
    { id: '1', billingPeriodStart: '2025-01-01', billingPeriodEnd: '2025-01-31', timestamp: 1735689600000, cropType: 'Rice', fieldArea: 10, calculatedKwh: 50, monthlyVolume: 100, region: 'North' }, // 2025-01-01
    { id: '2', billingPeriodStart: '2025-01-15', billingPeriodEnd: '2025-02-14', timestamp: 1736899200000, cropType: 'Wheat', fieldArea: 12, calculatedKwh: 100, monthlyVolume: 200, region: 'South' }, // 2025-01-15
    { id: '3', billingPeriodStart: '2025-02-01', billingPeriodEnd: '2025-02-28', timestamp: 1738368000000, cropType: 'Corn', fieldArea: 8, calculatedKwh: 75, monthlyVolume: 150, region: 'East' }, // 2025-02-01
    { id: '4', billingPeriodStart: '2025-02-10', billingPeriodEnd: '2025-03-09', timestamp: 1739145600000, cropType: 'Rice', fieldArea: 15, calculatedKwh: 125, monthlyVolume: 250, region: 'West' }, // 2025-02-10
    { id: '5', billingPeriodStart: '2025-03-01', billingPeriodEnd: '2025-03-31', timestamp: 1740787200000, cropType: 'Wheat', fieldArea: 11, calculatedKwh: 150, monthlyVolume: 300, region: 'North' }, // 2025-03-01
    { id: '6', billingPeriodStart: '2024-12-01', billingPeriodEnd: '2024-12-31', timestamp: 1733011200000, cropType: 'Corn', fieldArea: 9, calculatedKwh: 25, monthlyVolume: 50, region: 'South' }, // 2024-12-01
    { id: '7', billingPeriodStart: '2025-01-31', billingPeriodEnd: '2025-02-28', timestamp: 1738281600000, cropType: 'Rice', fieldArea: 7, calculatedKwh: 60, monthlyVolume: 120, region: 'East' }, // 2025-01-31
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    historyStore = useHistoryStore()
    historyStore.records = JSON.parse(JSON.stringify(mockRecords)) // Deep copy

    wrapper = mount(HistoryTable, {
      // No stubs - test real component integration
    })
  })

  it('renders DateRangeFilter and StatsSummary components', () => {
    expect(wrapper.findComponent(DateRangeFilter).exists()).toBe(true)
    expect(wrapper.findComponent(StatsSummary).exists()).toBe(true)
  })

  it('StatsSummary initially displays stats for all records', () => {
    const totalKwh = mockRecords.reduce((sum, r) => sum + r.calculatedKwh, 0)
    const avgMonthlyVolume = mockRecords.reduce((sum, r) => sum + r.monthlyVolume, 0) / mockRecords.length

    // Check initial display values (formatted)
    expect(wrapper.find('[data-test="stats-record-count"]').text()).toBe(String(mockRecords.length))
    expect(wrapper.find('[data-test="stats-avg-water-volume"]').text()).toBe(avgMonthlyVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    expect(wrapper.find('[data-test="stats-total-kwh"]').text()).toBe(totalKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
  })

  it('filters records and updates stats summary when date range is applied', async () => {
    const dateFilter = wrapper.findComponent(DateRangeFilter)

    // Simulate setting dates and applying filter
    await dateFilter.find('[data-test="start-date-input"]').setValue('2025-01-01')
    await dateFilter.find('[data-test="end-date-input"]').setValue('2025-01-31')
    await dateFilter.find('[data-test="apply-filter-button"]').trigger('click')

    // Expected records after filter: id 1, 2, 7
    expect(wrapper.findAll('[data-test="history-table"] tbody tr').length).toBe(3)
    expect(wrapper.find('[data-test="stats-record-count"]').text()).toBe('3')

    // Calculate expected stats for filtered records (id 1, 2, 7)
    const filtered = mockRecords.filter(r => ['1', '2', '7'].includes(r.id))
    const filteredTotalKwh = filtered.reduce((sum, r) => sum + r.calculatedKwh, 0)
    const filteredAvgMonthlyVolume = filtered.reduce((sum, r) => sum + r.monthlyVolume, 0) / filtered.length

    expect(wrapper.find('[data-test="stats-avg-water-volume"]').text()).toBe(filteredAvgMonthlyVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    expect(wrapper.find('[data-test="stats-total-kwh"]').text()).toBe(filteredTotalKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
  })

  it('clears filter and restores all records and stats summary', async () => {
    const dateFilter = wrapper.findComponent(DateRangeFilter)

    // Apply a filter first
    await dateFilter.find('[data-test="start-date-input"]').setValue('2025-01-01')
    await dateFilter.find('[data-test="end-date-input"]').setValue('2025-01-01')
    await dateFilter.find('[data-test="apply-filter-button"]').trigger('click')

    expect(wrapper.findAll('[data-test="history-table"] tbody tr').length).toBe(1) // Only record 1

    // Clear the filter
    await dateFilter.find('[data-test="clear-filter-button"]').trigger('click')

    // Expect all records to be restored
    expect(wrapper.findAll('[data-test="history-table"] tbody tr').length).toBe(mockRecords.length)
    expect(wrapper.find('[data-test="stats-record-count"]').text()).toBe(String(mockRecords.length))
  })

  it('table headers are sortable and update sorted records display', async () => {
    // This implicitly tests SortableTableHeader integration and historyStore.setSort
    // Default sort is timestamp desc
    expect(wrapper.find('[data-test="history-table"] tbody tr:first-child [data-test="created-time"]').text()).toContain('2025/03/01') // Newest timestamp

    // Click on Billing Period header to sort by billingPeriodStart desc (first click sets to desc)
    await wrapper.findAll('th')[0].trigger('click') // Assuming '計費期間' is the first sortable header
    expect(wrapper.find('[data-test="history-table"] tbody tr:first-child [data-test="billing-period-start"]').text()).toContain('2025/03/01') // Newest billingPeriodStart

    // Click again to sort by billingPeriodStart asc
    await wrapper.findAll('th')[0].trigger('click')
    expect(wrapper.find('[data-test="history-table"] tbody tr:first-child [data-test="billing-period-start"]').text()).toContain('2024/12/01') // Oldest billingPeriodStart
  })
})
