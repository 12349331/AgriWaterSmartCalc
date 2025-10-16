/**
 * DateRangePicker.test.js
 * Component tests for DateRangePicker (billing period selection)
 *
 * Test coverage:
 * - Dual date input rendering
 * - Date selection emits
 * - End < start error
 * - >70 days warning
 * - Future date warning
 * - Cross-season warning
 * - Date range limits
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateRangePicker from '@/components/calculator/DateRangePicker.vue'

describe('DateRangePicker Component', () => {
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-07-15')) // Set to summer season
  })

  afterEach(() => {
    vi.useRealTimers()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render dual date inputs', () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: null,
          endDate: null,
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      expect(startInput.exists()).toBe(true)
      expect(endInput.exists()).toBe(true)
    })

    it('should display labels for start and end date', () => {
      wrapper = mount(DateRangePicker)

      const labels = wrapper.findAll('label')
      expect(labels.length).toBeGreaterThanOrEqual(2)
    })

    it('should render with initial values', () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: '2024-07-31',
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      expect(startInput.element.value).toBe('2024-07-01')
      expect(endInput.element.value).toBe('2024-07-31')
    })

    it('should be responsive (mobile-friendly layout)', () => {
      wrapper = mount(DateRangePicker)

      // Check for responsive classes (should have flex or grid layout)
      const container = wrapper.find('[data-testid="date-range-container"]')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Date Selection', () => {
    it('should emit update:startDate when start date changes', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: null,
          endDate: null,
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      await startInput.setValue('2024-07-01')

      expect(wrapper.emitted('update:startDate')).toBeTruthy()
      expect(wrapper.emitted('update:startDate')[0]).toEqual(['2024-07-01'])
    })

    it('should emit update:endDate when end date changes', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: null,
        },
      })

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      await endInput.setValue('2024-07-31')

      expect(wrapper.emitted('update:endDate')).toBeTruthy()
      expect(wrapper.emitted('update:endDate')[0]).toEqual(['2024-07-31'])
    })

    it('should emit season-changed when valid period is selected', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: null,
          endDate: null,
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      await startInput.setValue('2024-07-01')
      await endInput.setValue('2024-07-31')

      // Should emit season-changed with '夏月'
      expect(wrapper.emitted('season-changed')).toBeTruthy()
      expect(wrapper.emitted('season-changed')[0]).toEqual(['夏月'])
    })
  })

  describe('Validation - End < Start Error', () => {
    it('should show error when end date is before start date', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-15',
          endDate: '2024-07-01', // End before start
        },
      })

      await wrapper.vm.$nextTick()

      const errorMessage = wrapper.find('[data-testid="validation-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('結束日期必須晚於開始日期')
    })

    it('should emit validation-error when end < start', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-15',
          endDate: null,
        },
      })

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      await endInput.setValue('2024-07-01')

      expect(wrapper.emitted('validation-error')).toBeTruthy()
      expect(wrapper.emitted('validation-error')[0][0].error).toContain('結束日期必須晚於開始日期')
    })

    it('should not show error when dates are valid', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: '2024-07-31',
        },
      })

      await wrapper.vm.$nextTick()

      const errorMessage = wrapper.find('[data-testid="validation-error"]')
      expect(errorMessage.exists()).toBe(false)
    })
  })

  describe('Validation - Long Period Warning (>70 days)', () => {
    it('should show warning when period exceeds 70 days', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-01-01',
          endDate: '2024-04-01', // 91 days
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="period-warning"]')
      expect(warningMessage.exists()).toBe(true)
      expect(warningMessage.text()).toContain('計費期間異常長')
      expect(warningMessage.text()).toContain('70 天')
    })

    it('should not show warning for normal period length', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: '2024-07-31', // 31 days
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="period-warning"]')
      expect(warningMessage.exists()).toBe(false)
    })

    it('should emit validation-error with warning for long periods', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-01-01',
          endDate: null,
        },
      })

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      await endInput.setValue('2024-04-01')

      expect(wrapper.emitted('validation-error')).toBeTruthy()
      const emitted = wrapper.emitted('validation-error')[0][0]
      expect(emitted.warning).toContain('計費期間異常長')
    })
  })

  describe('Validation - Future Date Warning', () => {
    it('should show warning when period includes future dates', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-20', // Future date (current is 2024-07-15)
          endDate: '2024-08-01',
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="future-date-warning"]')
      expect(warningMessage.exists()).toBe(true)
      expect(warningMessage.text()).toContain('未來日期')
    })

    it('should not show warning for past dates', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-06-01',
          endDate: '2024-06-30',
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="future-date-warning"]')
      expect(warningMessage.exists()).toBe(false)
    })
  })

  describe('Cross-Season Warning', () => {
    it('should show warning when period crosses summer/non-summer boundary', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-05-15', // Non-summer
          endDate: '2024-06-14',   // Summer
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="cross-season-warning"]')
      expect(warningMessage.exists()).toBe(true)
      expect(warningMessage.text()).toContain('橫跨')
    })

    it('should emit cross-season-warning event', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-05-15',
          endDate: null,
        },
      })

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      await endInput.setValue('2024-06-14')

      expect(wrapper.emitted('cross-season-warning')).toBeTruthy()
      expect(wrapper.emitted('cross-season-warning')[0][0]).toEqual(true)
    })

    it('should not show warning for same-season period', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: '2024-07-31', // Both in summer
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="cross-season-warning"]')
      expect(warningMessage.exists()).toBe(false)
    })

    it('should show cross-season warning for 9/30 to 10/1', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-09-30', // Last day of summer
          endDate: '2024-10-01',   // First day of non-summer
        },
      })

      await wrapper.vm.$nextTick()

      const warningMessage = wrapper.find('[data-testid="cross-season-warning"]')
      expect(warningMessage.exists()).toBe(true)
    })
  })

  describe('Date Range Limits', () => {
    it('should enforce minimum date (2020-01-01)', () => {
      wrapper = mount(DateRangePicker, {
        props: {
          minDate: '2020-01-01',
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      expect(startInput.attributes('min')).toBe('2020-01-01')
    })

    it('should enforce maximum date (today + 1 year)', () => {
      wrapper = mount(DateRangePicker, {
        props: {
          maxDate: '2025-07-15',
        },
      })

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      expect(endInput.attributes('max')).toBe('2025-07-15')
    })

    it('should show error when date is out of range', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2019-12-31', // Before min date
          endDate: '2024-07-31',
        },
      })

      await wrapper.vm.$nextTick()

      const errorMessage = wrapper.find('[data-testid="validation-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('2020/01/01')
    })
  })

  describe('Disabled State', () => {
    it('should disable inputs when disabled prop is true', () => {
      wrapper = mount(DateRangePicker, {
        props: {
          disabled: true,
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      expect(startInput.attributes('disabled')).toBeDefined()
      expect(endInput.attributes('disabled')).toBeDefined()
    })

    it('should enable inputs when disabled prop is false', () => {
      wrapper = mount(DateRangePicker, {
        props: {
          disabled: false,
        },
      })

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      expect(startInput.attributes('disabled')).toBeUndefined()
      expect(endInput.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Season Display', () => {
    it('should display determined season for summer period', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: '2024-07-31',
        },
      })

      await wrapper.vm.$nextTick()

      const seasonDisplay = wrapper.find('[data-testid="season-display"]')
      expect(seasonDisplay.text()).toContain('夏月')
    })

    it('should display determined season for non-summer period', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-11-01',
          endDate: '2024-11-30',
        },
      })

      await wrapper.vm.$nextTick()

      const seasonDisplay = wrapper.find('[data-testid="season-display"]')
      expect(seasonDisplay.text()).toContain('非夏月')
    })
  })

  describe('Incomplete Period', () => {
    it('should handle missing start date', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: null,
          endDate: '2024-07-31',
        },
      })

      await wrapper.vm.$nextTick()

      const errorMessage = wrapper.find('[data-testid="validation-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('請完整選擇')
    })

    it('should handle missing end date', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-01',
          endDate: null,
        },
      })

      await wrapper.vm.$nextTick()

      const errorMessage = wrapper.find('[data-testid="validation-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('請完整選擇')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      wrapper = mount(DateRangePicker)

      const startInput = wrapper.find('[data-testid="start-date-input"]')
      const endInput = wrapper.find('[data-testid="end-date-input"]')

      expect(startInput.attributes('aria-label')).toBeDefined()
      expect(endInput.attributes('aria-label')).toBeDefined()
    })

    it('should have aria-invalid on inputs with errors', async () => {
      wrapper = mount(DateRangePicker, {
        props: {
          startDate: '2024-07-15',
          endDate: '2024-07-01', // End before start
        },
      })

      await wrapper.vm.$nextTick()

      const endInput = wrapper.find('[data-testid="end-date-input"]')
      expect(endInput.attributes('aria-invalid')).toBe('true')
    })
  })
})
