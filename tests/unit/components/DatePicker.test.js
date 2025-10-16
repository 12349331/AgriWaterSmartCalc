import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DatePicker from '@/components/DatePicker.vue'
import { MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'

describe('DatePicker.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(DatePicker, {
      props: {
        modelValue: '2024-07-15',
      },
    })
  })

  describe('Rendering', () => {
    it('should render date input field', () => {
      const input = wrapper.find('input[type="date"]')
      expect(input.exists()).toBe(true)
    })

    it('should display current modelValue', () => {
      const input = wrapper.find('input[type="date"]')
      expect(input.element.value).toBe('2024-07-15')
    })

    it('should set min attribute to MIN_ALLOWED_DATE', () => {
      const input = wrapper.find('input[type="date"]')
      expect(input.attributes('min')).toBe(MIN_ALLOWED_DATE)
    })

    it('should set max attribute to today + 1 year', () => {
      const input = wrapper.find('input[type="date"]')
      expect(input.attributes('max')).toBe(getMaxAllowedDate())
    })
  })

  describe('Date Selection', () => {
    it('should emit update:modelValue on date change', async () => {
      const input = wrapper.find('input[type="date"]')
      await input.setValue('2024-08-20')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['2024-08-20'])
    })

    it('should emit season-change event when billing season changes', async () => {
      const input = wrapper.find('input[type="date"]')
      
      // Change from summer (07) to non-summer (10)
      await input.setValue('2024-10-15')
      
      expect(wrapper.emitted('season-change')).toBeTruthy()
      expect(wrapper.emitted('season-change')[0]).toEqual(['非夏月'])
    })

    it('should not emit season-change when season remains the same', async () => {
      const input = wrapper.find('input[type="date"]')
      
      // Change within summer months (07 -> 08)
      await input.setValue('2024-08-15')
      
      expect(wrapper.emitted('season-change')).toBeFalsy()
    })
  })

  describe('Future Date Warning', () => {
    it('should display warning for future dates', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      await wrapper.setProps({ modelValue: futureDateStr })
      
      const warning = wrapper.find('[data-testid="future-date-warning"]')
      expect(warning.exists()).toBe(true)
      expect(warning.text()).toContain('您選擇的是未來日期')
    })

    it('should not display warning for current or past dates', async () => {
      await wrapper.setProps({ modelValue: '2024-07-15' })
      
      const warning = wrapper.find('[data-testid="future-date-warning"]')
      expect(warning.exists()).toBe(false)
    })

    it('should apply warning styles (yellow background)', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      await wrapper.setProps({ modelValue: futureDateStr })
      
      const warning = wrapper.find('[data-testid="future-date-warning"]')
      expect(warning.classes()).toContain('bg-yellow-100')
    })
  })

  describe('Boundary Date Visual Feedback', () => {
    it('should highlight boundary dates (06-01, 09-30, 10-01, 05-31)', async () => {
      const boundaryDates = ['2024-06-01', '2024-09-30', '2024-10-01', '2024-05-31']
      
      for (const date of boundaryDates) {
        await wrapper.setProps({ modelValue: date })
        const indicator = wrapper.find('[data-testid="boundary-indicator"]')
        expect(indicator.exists()).toBe(true)
      }
    })

    it('should not highlight non-boundary dates', async () => {
      await wrapper.setProps({ modelValue: '2024-07-15' })
      const indicator = wrapper.find('[data-testid="boundary-indicator"]')
      expect(indicator.exists()).toBe(false)
    })

    it('should display tooltip on hover for boundary dates', async () => {
      await wrapper.setProps({ modelValue: '2024-06-01' })
      const tooltip = wrapper.find('[data-testid="boundary-tooltip"]')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('計價季節轉換日')
    })
  })

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      const input = wrapper.find('input[type="date"]')
      const labelId = input.attributes('aria-labelledby')
      expect(labelId).toBeTruthy()
      
      const label = wrapper.find(`#${labelId}`)
      expect(label.exists()).toBe(true)
    })

    it('should have aria-describedby for warning messages', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      await wrapper.setProps({ modelValue: futureDateStr })
      
      const input = wrapper.find('input[type="date"]')
      const describedBy = input.attributes('aria-describedby')
      expect(describedBy).toContain('future-date-warning')
    })

    it('should be keyboard navigable', async () => {
      const input = wrapper.find('input[type="date"]')
      expect(input.attributes('tabindex')).not.toBe('-1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid date input gracefully', async () => {
      const input = wrapper.find('input[type="date"]')
      await input.setValue('invalid-date')
      
      // Should not crash and should not emit
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('should handle null modelValue', async () => {
      await wrapper.setProps({ modelValue: null })
      const input = wrapper.find('input[type="date"]')
      expect(input.element.value).toBe('')
    })

    it('should prevent dates outside allowed range', async () => {
      const input = wrapper.find('input[type="date"]')
      
      // Browser should prevent this, but test the constraint
      expect(input.attributes('min')).toBe('2020-01-01')
      expect(input.attributes('max')).toBeTruthy()
    })
  })
})
