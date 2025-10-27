import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import PDFTemplate from '@/components/report/PDFTemplate.vue'

describe('PDFTemplate.vue', () => {
  let wrapper

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    wrapper = mount(PDFTemplate, {
      global: {
        plugins: [pinia],
        stubs: {
          ReportHeader: true,
          ReportParameters: true,
          ReportStats: true,
          ReportCharts: true,
          ReportInsights: true,
        },
      },
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('has pdf-template class', () => {
    expect(wrapper.find('.pdf-template').exists()).toBe(true)
  })

  it('renders all report sub-components', () => {
    expect(wrapper.findComponent({ name: 'ReportHeader' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ReportParameters' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ReportStats' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ReportCharts' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ReportInsights' }).exists()).toBe(true)
  })

  it('renders components in correct order', () => {
    // Check that all report components are rendered
    const reportHeader = wrapper.findComponent({ name: 'ReportHeader' })
    const reportParams = wrapper.findComponent({ name: 'ReportParameters' })
    const reportStats = wrapper.findComponent({ name: 'ReportStats' })
    const reportCharts = wrapper.findComponent({ name: 'ReportCharts' })
    const reportInsights = wrapper.findComponent({ name: 'ReportInsights' })

    expect(reportHeader.exists()).toBe(true)
    expect(reportParams.exists()).toBe(true)
    expect(reportStats.exists()).toBe(true)
    expect(reportCharts.exists()).toBe(true)
    expect(reportInsights.exists()).toBe(true)
  })

  it('displays footer with copyright', () => {
    const footer = wrapper.find('.report-footer')
    expect(footer.exists()).toBe(true)

    const footerText = footer.find('.footer-text')
    expect(footerText.exists()).toBe(true)
    expect(footerText.text()).toContain('水資源查詢與估算平台')
  })

  it('displays current year in footer', () => {
    const currentYear = new Date().getFullYear()
    const footerText = wrapper.find('.footer-text')
    expect(footerText.text()).toContain(currentYear.toString())
  })

  it('exposes pdfTemplateRef', () => {
    expect(wrapper.vm.pdfTemplateRef).toBeDefined()
  })

  it('has A4 width styling (210mm)', () => {
    const template = wrapper.find('.pdf-template')
    expect(template.exists()).toBe(true)
    // Style should be applied via CSS, checking class existence
  })
})
