import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AdvancedParams from '@/components/calculator/AdvancedParams.vue'

// Mock van-slider component
const VanSliderStub = {
  name: 'van-slider',
  template: '<div class="van-slider-stub"></div>',
  props: ['modelValue', 'min', 'max', 'step', 'disabled', 'activeColor'],
  emits: ['update:model-value'],
}

describe('AdvancedParams.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(AdvancedParams, {
      props: {
        show: false,
        efficiency: 0.45,
        errors: {},
        warnings: {},
        disabled: false,
        ...props,
      },
      global: {
        stubs: {
          'van-slider': VanSliderStub,
        },
      },
    })
  }

  describe('Component Rendering', () => {
    it('renders the component when show is true', () => {
      const wrapper = createWrapper({ show: true })
      expect(wrapper.find('.govuk-form-group').exists()).toBe(true)
      expect(wrapper.text()).toContain('抽水效率')
    })

    it('does not render parameters when show is false', () => {
      const wrapper = createWrapper({ show: false })
      expect(wrapper.find('.govuk-form-group').exists()).toBe(false)
    })

    it('renders toggle button correctly', () => {
      const wrapper = createWrapper({ show: false })
      const button = wrapper.find('button')
      expect(button.text()).toBe('展開')
      expect(button.attributes('aria-expanded')).toBe('false')
    })

    it('updates toggle button when show is true', () => {
      const wrapper = createWrapper({ show: true })
      const button = wrapper.find('button')
      expect(button.text()).toBe('收合')
      expect(button.attributes('aria-expanded')).toBe('true')
    })
  })

  describe('Efficiency Slider', () => {
    it('renders efficiency slider correctly', () => {
      const wrapper = createWrapper({ show: true, efficiency: 0.45 })
      const slider = wrapper.find('[data-testid="efficiency-slider"]')
      expect(slider.exists()).toBe(true)
    })

    it('displays correct percentage value', () => {
      const wrapper = createWrapper({ show: true, efficiency: 0.45 })
      const percentageInput = wrapper.find('[data-testid="efficiency-percentage-input"]')
      expect(Number(percentageInput.element.value)).toBe(45)
    })

    it('displays 0 for minimum value', () => {
      const wrapper = createWrapper({ show: true, efficiency: 0 })
      const percentageInput = wrapper.find('[data-testid="efficiency-percentage-input"]')
      expect(Number(percentageInput.element.value)).toBe(0)
    })

    it('displays 100 for maximum value', () => {
      const wrapper = createWrapper({ show: true, efficiency: 1.0 })
      const percentageInput = wrapper.find('[data-testid="efficiency-percentage-input"]')
      expect(Number(percentageInput.element.value)).toBe(100)
    })

    it('rounds percentage to nearest integer', () => {
      const wrapper = createWrapper({ show: true, efficiency: 0.756 })
      const percentageInput = wrapper.find('[data-testid="efficiency-percentage-input"]')
      expect(Number(percentageInput.element.value)).toBe(76)
    })

    it('emits update:efficiency event when slider changes', async () => {
      const wrapper = createWrapper({ show: true, efficiency: 0.45 })
      const slider = wrapper.findComponent({ name: 'van-slider' })

      await slider.vm.$emit('update:model-value', 0.6)

      expect(wrapper.emitted('update:efficiency')).toBeTruthy()
      expect(wrapper.emitted('update:efficiency')[0]).toEqual([0.6])
    })

    it('emits update:efficiency event when percentage input changes', async () => {
      const wrapper = createWrapper({ show: true, efficiency: 0.45 })
      const percentageInput = wrapper.find('[data-testid="efficiency-percentage-input"]')

      await percentageInput.setValue('60')

      expect(wrapper.emitted('update:efficiency')).toBeTruthy()
      expect(wrapper.emitted('update:efficiency')[0]).toEqual([0.6])
    })

    it('clamps percentage input to 0-100 range', async () => {
      const wrapper = createWrapper({ show: true, efficiency: 0.45 })
      const percentageInput = wrapper.find('[data-testid="efficiency-percentage-input"]')

      // Test upper bound
      await percentageInput.setValue('150')
      expect(wrapper.emitted('update:efficiency')[0]).toEqual([1.0])

      // Test lower bound
      await percentageInput.setValue('-10')
      expect(wrapper.emitted('update:efficiency')[1]).toEqual([0.0])
    })

    it('disables slider when disabled prop is true', () => {
      const wrapper = createWrapper({ show: true, disabled: true })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.props('disabled')).toBe(true)
    })

    it('enables slider when disabled prop is false', () => {
      const wrapper = createWrapper({ show: true, disabled: false })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.props('disabled')).toBe(false)
    })

    it('has correct slider range (0 to 1)', () => {
      const wrapper = createWrapper({ show: true })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.props('min')).toBe(0)
      expect(slider.props('max')).toBe(1)
    })

    it('has correct slider step (0.01)', () => {
      const wrapper = createWrapper({ show: true })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.props('step')).toBe(0.01)
    })
  })

  describe('Error and Warning Messages', () => {
    it('displays error message when errors.efficiency is set', () => {
      const wrapper = createWrapper({
        show: true,
        errors: { efficiency: '效率值不能為空' },
      })
      const errorMsg = wrapper.find('#efficiency-error')
      expect(errorMsg.exists()).toBe(true)
      expect(errorMsg.text()).toBe('效率值不能為空')
    })

    it('displays warning message when warnings.efficiency is set', () => {
      const wrapper = createWrapper({
        show: true,
        warnings: { efficiency: '建議效率值在 0.4-0.8 之間' },
      })
      const warningMsg = wrapper.find('#efficiency-warning')
      expect(warningMsg.exists()).toBe(true)
      expect(warningMsg.text()).toContain('建議效率值在 0.4-0.8 之間')
    })

    it('does not display warning when error is present', () => {
      const wrapper = createWrapper({
        show: true,
        errors: { efficiency: '效率值不能為空' },
        warnings: { efficiency: '建議效率值在 0.4-0.8 之間' },
      })
      const errorMsg = wrapper.find('#efficiency-error')
      const warningMsg = wrapper.find('#efficiency-warning')
      expect(errorMsg.exists()).toBe(true)
      expect(warningMsg.exists()).toBe(false)
    })

    it('changes slider color to red when error is present', () => {
      const wrapper = createWrapper({
        show: true,
        errors: { efficiency: '效率值不能為空' },
      })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.props('activeColor')).toBe('#d4351c') // Red color
    })

    it('uses default color when no error', () => {
      const wrapper = createWrapper({
        show: true,
      })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.props('activeColor')).toBe('#1989fa') // Default blue color
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-labelledby attribute', () => {
      const wrapper = createWrapper({ show: true })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.attributes('aria-labelledby')).toBe('efficiency-label')
    })

    it('has aria-required attribute', () => {
      const wrapper = createWrapper({ show: true })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.attributes('aria-required')).toBe('true')
    })

    it('sets aria-invalid to true when error is present', () => {
      const wrapper = createWrapper({
        show: true,
        errors: { efficiency: '效率值不能為空' },
      })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.attributes('aria-invalid')).toBe('true')
    })

    it('sets aria-invalid to false when no error', () => {
      const wrapper = createWrapper({ show: true })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.attributes('aria-invalid')).toBe('false')
    })

    it('sets aria-describedby when error message exists', () => {
      const wrapper = createWrapper({
        show: true,
        errors: { efficiency: '效率值不能為空' },
      })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.attributes('aria-describedby')).toContain('efficiency-error')
    })

    it('sets aria-describedby when warning message exists', () => {
      const wrapper = createWrapper({
        show: true,
        warnings: { efficiency: '建議效率值在 0.4-0.8 之間' },
      })
      const slider = wrapper.findComponent({ name: 'van-slider' })
      expect(slider.attributes('aria-describedby')).toContain('efficiency-warning')
    })
  })

  describe('Toggle Functionality', () => {
    it('emits update:show event when toggle button is clicked', async () => {
      const wrapper = createWrapper({ show: false })
      const button = wrapper.find('button')

      await button.trigger('click')

      expect(wrapper.emitted('update:show')).toBeTruthy()
      expect(wrapper.emitted('update:show')[0]).toEqual([true])
    })

    it('emits update:show with false when collapsing', async () => {
      const wrapper = createWrapper({ show: true })
      const button = wrapper.find('button')

      await button.trigger('click')

      expect(wrapper.emitted('update:show')).toBeTruthy()
      expect(wrapper.emitted('update:show')[0]).toEqual([false])
    })
  })

  describe('Parameter Explanations', () => {
    it('renders parameter explanations when expanded', () => {
      const wrapper = createWrapper({ show: true })
      expect(wrapper.text()).toContain('抽水馬力 (HP)')
      expect(wrapper.text()).toContain('抽水效率')
      expect(wrapper.text()).toContain('水井深度 (公尺)')
    })

    it('does not render parameter explanations when collapsed', () => {
      const wrapper = createWrapper({ show: false })
      expect(wrapper.text()).not.toContain('抽水馬力 (HP)')
      expect(wrapper.text()).not.toContain('水井深度 (公尺)')
    })

    it('shows correct efficiency explanation', () => {
      const wrapper = createWrapper({ show: true })
      expect(wrapper.text()).toContain('抽水機將電能轉換為水力能的效率')
      expect(wrapper.text()).toContain('0.45 代表 45% 效率')
    })
  })
})

