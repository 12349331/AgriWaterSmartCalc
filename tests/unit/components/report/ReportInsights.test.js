import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ReportInsights from '@/components/report/ReportInsights.vue'
import { useHistoryStore } from '@/stores/history'

// Mock insights-generator
vi.mock('@/utils/insights-generator', () => ({
  generateInsights: vi.fn((stats) => {
    if (stats.avgWaterUsage === 0) {
      return [
        '暫無足夠數據進行分析。',
        '暫無用水記錄。',
        '建議定期追蹤用水記錄，以優化灌溉管理。',
      ]
    }
    return [
      '用水量變化範圍較大，建議檢視不同時期的灌溉策略。',
      '平均用水量適中，符合一般作物需求。',
      '建議定期追蹤用水記錄，以優化灌溉管理。',
    ]
  }),
}))

describe('ReportInsights.vue', () => {
  let wrapper
  let historyStore
  let generateInsights

  beforeEach(async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    historyStore = useHistoryStore()

    generateInsights = (await import('@/utils/insights-generator')).generateInsights

    // Add mock records
    historyStore.addRecord({
      calculatedKwh: 500,
      monthlyVolume: 150,
    })

    historyStore.addRecord({
      calculatedKwh: 600,
      monthlyVolume: 250,
    })

    wrapper = mount(ReportInsights, {
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
    expect(title.text()).toBe('數據洞察')
  })

  it('displays all 5 statistical values', () => {
    const statRows = wrapper.findAll('.stat-row')
    expect(statRows.length).toBe(5)
  })

  it('displays record count', () => {
    const text = wrapper.text()
    expect(text).toContain('總紀錄次數')
    expect(text).toContain('2 次')
  })

  it('displays average water usage', () => {
    const text = wrapper.text()
    expect(text).toContain('平均用水量')
    expect(text).toContain('200.0 m³') // (150 + 250) / 2
  })

  it('displays max water usage', () => {
    const text = wrapper.text()
    expect(text).toContain('最大用水量')
    expect(text).toContain('250.0 m³')
  })

  it('displays min water usage', () => {
    const text = wrapper.text()
    expect(text).toContain('最小用水量')
    expect(text).toContain('150.0 m³')
  })

  it('displays average kWh', () => {
    const text = wrapper.text()
    expect(text).toContain('平均用電')
    expect(text).toContain('550.0 kWh') // (500 + 600) / 2
  })

  it('displays insights subtitle', () => {
    const subtitle = wrapper.find('.insights-subtitle')
    expect(subtitle.exists()).toBe(true)
    expect(subtitle.text()).toBe('分析洞察：')
  })

  it('displays insight text items', () => {
    const insightItems = wrapper.findAll('.insight-item')
    expect(insightItems.length).toBe(3)
  })

  it('calls generateInsights with correct stats', () => {
    expect(generateInsights).toHaveBeenCalled()
    const callArg = generateInsights.mock.calls[0][0]
    expect(callArg).toHaveProperty('avgWaterUsage')
    expect(callArg).toHaveProperty('maxWaterUsage')
    expect(callArg).toHaveProperty('minWaterUsage')
  })

  it('handles empty history', async () => {
    historyStore.clearAllRecords()

    await wrapper.vm.$nextTick()
    const text = wrapper.text()
    expect(text).toContain('0 次')
    expect(text).toContain('0.0 m³')
    expect(text).toContain('0.0 kWh')
  })

  it('formats values with one decimal place', async () => {
    historyStore.clearAllRecords()
    historyStore.addRecord({
      calculatedKwh: 123.456,
      monthlyVolume: 78.912,
    })

    await wrapper.vm.$nextTick()
    const text = wrapper.text()
    expect(text).toContain('78.9')
    expect(text).toContain('123.5')
  })

  it('has correct styling classes', () => {
    expect(wrapper.find('.report-section').exists()).toBe(true)
    expect(wrapper.find('.insights-stats').exists()).toBe(true)
    expect(wrapper.find('.insights-text').exists()).toBe(true)
    expect(wrapper.find('.insights-list').exists()).toBe(true)
  })
})
