import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultCard from '@/components/calculator/ResultCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

describe('ResultCard', () => {
  const createWrapper = (props = {}) => {
    return mount(ResultCard, {
      props: {
        waterFlowRate: 0.704,
        monthlyVolume: 1500,
        calculatedKwh: 500,
        isOverExtraction: false,
        loading: false,
        ...props,
      },
      global: {
        components: {
          LoadingSpinner,
        },
      },
    })
  }

  it('should render result card', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('h2').text()).toBe('計算結果')
  })

  it('should display calculation results', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('500.0 kWh')
    expect(wrapper.text()).toContain('0.70 L/s')
    expect(wrapper.text()).toContain('1500.00 m³')
  })

  it('should show over-extraction warning', () => {
    const wrapper = createWrapper({
      monthlyVolume: 2500,
      isOverExtraction: true,
    })

    expect(wrapper.text()).toContain('用水量超過建議閾值')
    expect(wrapper.html()).toContain('text-orange-600')
  })

  it('should show loading state', () => {
    const wrapper = createWrapper({ loading: true })

    expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true)
    expect(wrapper.text()).toContain('計算中...')
  })

  it('should emit save event', async () => {
    const wrapper = createWrapper()

    await wrapper.find('button.btn-primary').trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('should emit share event', async () => {
    const wrapper = createWrapper()

    const buttons = wrapper.findAll('button')
    const shareButton = buttons.find((btn) => btn.text().includes('分享'))

    await shareButton.trigger('click')

    expect(wrapper.emitted('share')).toBeTruthy()
  })

  it('should apply correct color for normal usage', () => {
    const wrapper = createWrapper({ monthlyVolume: 1500 })

    const volumeCard = wrapper.find('.bg-indigo-50')
    expect(volumeCard.exists()).toBe(true)
  })

  it('should apply warning color for over-extraction', () => {
    const wrapper = createWrapper({
      monthlyVolume: 2500,
      isOverExtraction: true,
    })

    const volumeCard = wrapper.find('.bg-orange-50')
    expect(volumeCard.exists()).toBe(true)
  })
})
