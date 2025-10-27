import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ReportStats from '@/components/report/ReportStats.vue'
import { useHistoryStore } from '@/stores/history'

describe('ReportStats.vue', () => {
  let wrapper
  let historyStore

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    historyStore = useHistoryStore()

    // Add mock records
    historyStore.addRecord({
      billAmount: 1500,
      electricityType: '表燈非營業用',
      cropType: '水稻',
      calculatedKwh: 500,
      monthlyVolume: 150,
      billingPeriodStart: '2025/10/01',
      billingPeriodEnd: '2025/10/31',
    })

    historyStore.addRecord({
      billAmount: 2000,
      electricityType: '表燈非營業用',
      cropType: '玉米',
      calculatedKwh: 600,
      monthlyVolume: 180,
      billingPeriodStart: '2025/11/01',
      billingPeriodEnd: '2025/11/30',
    })

    wrapper = mount(ReportStats, {
      global: {
        plugins: [pinia],
      },
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays section title', () => {
    const title = wrapper.find('.section-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('統計摘要')
  })

  it('displays three statistics cards', () => {
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBe(3)
  })

  it('displays total record count', () => {
    const text = wrapper.text()
    expect(text).toContain('總抽水次數')
    expect(text).toContain('2')
    expect(text).toContain('次')
  })

  it('displays average water volume', () => {
    const text = wrapper.text()
    expect(text).toContain('平均月用水量')
    // (150 + 180) / 2 = 165
    expect(text).toContain('165.0')
    expect(text).toContain('m³')
  })

  it('displays total kWh', () => {
    const text = wrapper.text()
    expect(text).toContain('總用電度數')
    // 500 + 600 = 1100
    expect(text).toContain('1100.0')
    expect(text).toContain('kWh')
  })

  it('handles empty history', () => {
    historyStore.clearAllRecords()
    const text = wrapper.text()

    expect(text).toContain('0')
    expect(text).toContain('0.0')
  })

  it('formats values with one decimal place', () => {
    // Add record with decimal values
    historyStore.clearAllRecords()
    historyStore.addRecord({
      calculatedKwh: 123.456,
      monthlyVolume: 78.9,
    })

    const text = wrapper.text()
    expect(text).toContain('123.5') // kWh rounded to 1 decimal
    expect(text).toContain('78.9') // Volume with 1 decimal
  })

  it('has correct styling classes', () => {
    expect(wrapper.find('.report-section').exists()).toBe(true)
    expect(wrapper.find('.stats-grid').exists()).toBe(true)
    expect(wrapper.findAll('.stat-label').length).toBe(3)
    expect(wrapper.findAll('.stat-value').length).toBe(3)
    expect(wrapper.findAll('.stat-unit').length).toBe(3)
  })
})
