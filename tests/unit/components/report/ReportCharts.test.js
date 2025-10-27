import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ReportCharts from '@/components/report/ReportCharts.vue'
import { useHistoryStore } from '@/stores/history'

describe('ReportCharts.vue', () => {
  let wrapper
  let historyStore

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    historyStore = useHistoryStore()

    // Add mock records
    historyStore.addRecord({
      calculatedKwh: 500,
      monthlyVolume: 150,
      cropType: '水稻',
    })

    wrapper = mount(ReportCharts, {
      global: {
        plugins: [pinia],
        stubs: {
          SeasonalChart: true,
          CropComparisonChart: true,
          AnnualTrendChart: true,
        },
      },
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays section title', () => {
    const title = wrapper.find('.section-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('圖表視覺化')
  })

  it('displays three chart containers', () => {
    const chartContainers = wrapper.findAll('.chart-container')
    expect(chartContainers.length).toBe(3)
  })

  it('displays seasonal chart with title', () => {
    const containers = wrapper.findAll('.chart-container')
    const seasonalContainer = containers[0]
    expect(seasonalContainer.text()).toContain('季節性用水趨勢')
  })

  it('displays crop comparison chart with title', () => {
    const containers = wrapper.findAll('.chart-container')
    const cropContainer = containers[1]
    expect(cropContainer.text()).toContain('作物用水量比較')
  })

  it('displays annual trend chart with title', () => {
    const containers = wrapper.findAll('.chart-container')
    const annualContainer = containers[2]
    expect(annualContainer.text()).toContain('年度用水趨勢')
  })

  it('renders chart components when records exist', () => {
    expect(wrapper.findComponent({ name: 'SeasonalChart' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CropComparisonChart' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AnnualTrendChart' }).exists()).toBe(true)
  })

  it('passes records prop to chart components', () => {
    const seasonalChart = wrapper.findComponent({ name: 'SeasonalChart' })
    expect(seasonalChart.props('records')).toBeDefined()
    expect(seasonalChart.props('records').length).toBeGreaterThan(0)
  })

  it('displays "暫無數據" when no records', () => {
    historyStore.clearAllRecords()

    const text = wrapper.text()
    expect(text).toContain('暫無數據')

    // Chart components should not be rendered
    expect(wrapper.findComponent({ name: 'SeasonalChart' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'CropComparisonChart' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'AnnualTrendChart' }).exists()).toBe(false)
  })

  it('has correct styling classes', () => {
    expect(wrapper.find('.report-section').exists()).toBe(true)
    expect(wrapper.findAll('.chart-title').length).toBe(3)
  })
})
