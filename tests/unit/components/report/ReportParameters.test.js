import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ReportParameters from '@/components/report/ReportParameters.vue'
import { useCalculationStore } from '@/stores/calculation'

describe('ReportParameters.vue', () => {
  let wrapper
  let calculationStore

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    calculationStore = useCalculationStore()

    // Set mock data in calculation store
    calculationStore.billAmount = 1500
    calculationStore.billingPeriodStart = '2025/10/01'
    calculationStore.billingPeriodEnd = '2025/10/31'
    calculationStore.electricityType = '表燈非營業用'
    calculationStore.timePricingCategory = '農事用電'
    calculationStore.cropType = '水稻'
    calculationStore.fieldArea = 5000
    calculationStore.pumpHorsepower = 10
    calculationStore.pumpEfficiency = 0.45
    calculationStore.wellDepth = 30

    wrapper = mount(ReportParameters, {
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
    expect(title.text()).toBe('輸入參數')
  })

  it('displays all 8 parameter fields', () => {
    const paramItems = wrapper.findAll('.parameter-item')
    expect(paramItems.length).toBe(8)
  })

  it('displays bill amount with unit', () => {
    const text = wrapper.text()
    expect(text).toContain('電費金額')
    expect(text).toContain('1500 元')
  })

  it('displays billing period correctly', () => {
    const text = wrapper.text()
    expect(text).toContain('計費期間')
    expect(text).toContain('2025/10/01 ~ 2025/10/31')
  })

  it('displays electricity type', () => {
    const text = wrapper.text()
    expect(text).toContain('電價種類')
    expect(text).toContain('表燈非營業用-農事用電')
  })

  it('displays crop type', () => {
    const text = wrapper.text()
    expect(text).toContain('作物類型')
    expect(text).toContain('水稻')
  })

  it('displays field area with unit', () => {
    const text = wrapper.text()
    expect(text).toContain('耕地面積')
    expect(text).toContain('5000 m²')
  })

  it('displays pump horsepower with unit', () => {
    const text = wrapper.text()
    expect(text).toContain('抽水馬力')
    expect(text).toContain('10 HP')
  })

  it('displays pump efficiency as percentage', () => {
    const text = wrapper.text()
    expect(text).toContain('抽水效率')
    expect(text).toContain('45%')
  })

  it('displays well depth with unit', () => {
    const text = wrapper.text()
    expect(text).toContain('水井深度')
    expect(text).toContain('30 m')
  })

  it('handles missing crop type', async () => {
    calculationStore.cropType = null

    await wrapper.vm.$nextTick()
    const text = wrapper.text()
    expect(text).toContain('未選擇')
  })

  it('handles zero values', async () => {
    calculationStore.billAmount = 0
    calculationStore.fieldArea = 0

    await wrapper.vm.$nextTick()
    const text = wrapper.text()
    expect(text).toContain('0 元')
    expect(text).toContain('0 m²')
  })

  it('formats efficiency percentage correctly', async () => {
    calculationStore.pumpEfficiency = 0.678

    await wrapper.vm.$nextTick()
    const text = wrapper.text()
    expect(text).toContain('68%')
  })

  it('has correct styling classes', () => {
    expect(wrapper.find('.report-section').exists()).toBe(true)
    expect(wrapper.find('.parameters-list').exists()).toBe(true)
    expect(wrapper.findAll('.param-label').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.param-value').length).toBeGreaterThan(0)
  })
})
