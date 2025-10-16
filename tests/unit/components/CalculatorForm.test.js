import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalculatorForm from '@/components/calculator/CalculatorForm.vue'
import DatePicker from '@/components/DatePicker.vue'
import { useCalculationStore } from '@/stores/calculation'

describe('CalculatorForm.vue - DatePicker Integration', () => {
  let wrapper
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCalculationStore()
    
    wrapper = mount(CalculatorForm, {
      global: {
        components: {
          DatePicker,
        },
      },
    })
  })

  describe('DatePicker Rendering', () => {
    it('should render DatePicker component', () => {
      const datePicker = wrapper.findComponent(DatePicker)
      expect(datePicker.exists()).toBe(true)
    })

    it('should display billing date label', () => {
      const label = wrapper.find('[data-testid="billing-date-label"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('用電日期')
    })

    it('should bind billingDate to DatePicker', () => {
      const datePicker = wrapper.findComponent(DatePicker)
      expect(datePicker.props('modelValue')).toBeTruthy()
    })
  })

  describe('Billing Season Display', () => {
    it('should display current billing season badge', async () => {
      const badge = wrapper.find('[data-testid="billing-season-badge"]')
      expect(badge.exists()).toBe(true)
      expect(['夏月', '非夏月']).toContain(badge.text())
    })

    it('should update season badge when date changes', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      
      // Set to summer date
      await datePicker.vm.$emit('update:modelValue', '2024-07-15')
      await wrapper.vm.$nextTick()
      
      const badge = wrapper.find('[data-testid="billing-season-badge"]')
      expect(badge.text()).toBe('夏月')
      
      // Set to non-summer date
      await datePicker.vm.$emit('update:modelValue', '2024-11-15')
      await wrapper.vm.$nextTick()
      
      expect(badge.text()).toBe('非夏月')
    })

    it('should apply correct Tailwind styles for summer season', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-07-15')
      await wrapper.vm.$nextTick()
      
      const badge = wrapper.find('[data-testid="billing-season-badge"]')
      expect(badge.classes()).toContain('bg-orange-100')
      expect(badge.classes()).toContain('text-orange-800')
    })

    it('should apply correct Tailwind styles for non-summer season', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-11-15')
      await wrapper.vm.$nextTick()
      
      const badge = wrapper.find('[data-testid="billing-season-badge"]')
      expect(badge.classes()).toContain('bg-blue-100')
      expect(badge.classes()).toContain('text-blue-800')
    })
  })

  describe('Form Submission with BillingDate', () => {
    it('should include billingDate in calculation payload', async () => {
      const submitSpy = vi.spyOn(store, 'calculate')
      
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-07-15')
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          billingDate: '2024-07-15',
        }),
      )
    })

    it('should validate billingDate before submission', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', null)
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      const errorMsg = wrapper.find('[data-testid="validation-error"]')
      expect(errorMsg.exists()).toBe(true)
      expect(errorMsg.text()).toContain('請選擇用電日期')
    })

    it('should reject dates outside allowed range', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2019-12-31') // Before 2020-01-01
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      const errorMsg = wrapper.find('[data-testid="validation-error"]')
      expect(errorMsg.exists()).toBe(true)
      expect(errorMsg.text()).toContain('日期超出允許範圍')
    })
  })

  describe('Future Date Confirmation Flow', () => {
    it('should show confirmation modal for future dates', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', futureDateStr)
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      const modal = wrapper.find('[data-testid="future-date-modal"]')
      expect(modal.exists()).toBe(true)
      expect(modal.text()).toContain('您選擇的是未來日期，是否確定？')
    })

    it('should allow submission after user confirms future date', async () => {
      const submitSpy = vi.spyOn(store, 'calculate')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', futureDateStr)
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      const confirmButton = wrapper.find('[data-testid="confirm-future-date"]')
      await confirmButton.trigger('click')
      
      expect(submitSpy).toHaveBeenCalled()
    })

    it('should cancel submission when user rejects future date', async () => {
      const submitSpy = vi.spyOn(store, 'calculate')
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      const futureDateStr = futureDate.toISOString().split('T')[0]
      
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', futureDateStr)
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      const cancelButton = wrapper.find('[data-testid="cancel-future-date"]')
      await cancelButton.trigger('click')
      
      expect(submitSpy).not.toHaveBeenCalled()
    })
  })

  describe('Boundary Date Visual Feedback', () => {
    it('should display tooltip for boundary dates', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-06-01')
      await wrapper.vm.$nextTick()
      
      const tooltip = wrapper.find('[data-testid="boundary-date-info"]')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('這是計價季節轉換的邊界日期')
    })

    it('should highlight season transition information', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-06-01')
      await wrapper.vm.$nextTick()
      
      const info = wrapper.find('[data-testid="season-transition-info"]')
      expect(info.exists()).toBe(true)
      expect(info.text()).toMatch(/夏月.*開始/)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for date section', () => {
      const section = wrapper.find('[data-testid="billing-date-section"]')
      expect(section.attributes('role')).toBe('group')
      expect(section.attributes('aria-labelledby')).toBeTruthy()
    })

    it('should announce season changes to screen readers', async () => {
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-07-15')
      await wrapper.vm.$nextTick()
      
      const liveRegion = wrapper.find('[aria-live="polite"]')
      expect(liveRegion.exists()).toBe(true)
      expect(liveRegion.text()).toContain('夏月')
    })
  })

  describe('Integration with Existing Fields', () => {
    it('should preserve existing usage input field', () => {
      const usageInput = wrapper.find('[data-testid="usage-input"]')
      expect(usageInput.exists()).toBe(true)
    })

    it('should submit all fields together', async () => {
      const submitSpy = vi.spyOn(store, 'calculate')
      
      const usageInput = wrapper.find('[data-testid="usage-input"]')
      await usageInput.setValue('350')
      
      const datePicker = wrapper.findComponent(DatePicker)
      await datePicker.vm.$emit('update:modelValue', '2024-07-15')
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          usage: 350,
          billingDate: '2024-07-15',
        }),
      )
    })
  })
})
