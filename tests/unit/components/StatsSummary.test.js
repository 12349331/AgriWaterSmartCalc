import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import StatsSummary from '@/components/common/StatsSummary.vue'

describe('StatsSummary.vue', () => {
  let wrapper

  const mockStatsSummaryData = {
    recordCount: 1234,
    avgWaterVolume: 5678.123,
    totalKwh: 90123.456,
  }

  beforeEach(() => {
    wrapper = mount(StatsSummary, {
      props: {
        statsSummaryData: mockStatsSummaryData,
        showAlways: true,
      },
    })
  })

  it('renders correctly with provided stats data', () => {
    expect(wrapper.find('[data-test="stats-record-count"]').text()).toBe('1,234')
    expect(wrapper.find('[data-test="stats-avg-water-volume"]').text()).toBe('5,678.12')
    expect(wrapper.find('[data-test="stats-total-kwh"]').text()).toBe('90,123.5')
  })

  it('renders zero values when no stats data is provided', async () => {
    await wrapper.setProps({
      statsSummaryData: {
        recordCount: 0,
        avgWaterVolume: 0,
        totalKwh: 0,
      },
    })
    expect(wrapper.find('[data-test="stats-record-count"]').text()).toBe('0')
    expect(wrapper.find('[data-test="stats-avg-water-volume"]').text()).toBe('0.00')
    expect(wrapper.find('[data-test="stats-total-kwh"]').text()).toBe('0.0')
  })

  it('always shows the component regardless of showAlways prop (as FR-014 requirement)', () => {
    // The component itself is always rendered, the prop affects internal logic if any
    expect(wrapper.isVisible()).toBe(true)
    wrapper.setProps({ showAlways: false })
    expect(wrapper.isVisible()).toBe(true)
  })
})
