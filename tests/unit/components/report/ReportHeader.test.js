import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ReportHeader from '@/components/report/ReportHeader.vue'

// Mock report-generator
vi.mock('@/utils/report-generator', () => ({
  formatTaiwanDateTime: vi.fn(() => '2025年10月27日 14:30'),
}))

describe('ReportHeader.vue', () => {
  let wrapper
  let formatTaiwanDateTime

  beforeEach(async () => {
    formatTaiwanDateTime = (await import('@/utils/report-generator')).formatTaiwanDateTime

    wrapper = mount(ReportHeader)
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the report title', () => {
    const title = wrapper.find('.report-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('水資源查詢與估算平台 - 數據報告')
  })

  it('displays the export time', () => {
    const exportTime = wrapper.find('.export-time')
    expect(exportTime.exists()).toBe(true)
    expect(exportTime.text()).toContain('匯出時間：')
    expect(exportTime.text()).toContain('2025年10月27日 14:30')
  })

  it('calls formatTaiwanDateTime to format the time', () => {
    expect(formatTaiwanDateTime).toHaveBeenCalled()
  })

  it('has report-header class', () => {
    expect(wrapper.find('.report-header').exists()).toBe(true)
  })
})
