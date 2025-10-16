import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('should render error message', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '發生錯誤',
        type: 'error',
      },
    })

    expect(wrapper.text()).toContain('發生錯誤')
  })

  it('should apply error styling', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '錯誤訊息',
        type: 'error',
      },
    })

    expect(wrapper.find('.bg-red-50').exists()).toBe(true)
  })

  it('should apply success styling', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '成功訊息',
        type: 'success',
      },
    })

    expect(wrapper.find('.bg-green-50').exists()).toBe(true)
  })

  it('should apply warning styling', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '警告訊息',
        type: 'warning',
      },
    })

    expect(wrapper.find('.bg-yellow-50').exists()).toBe(true)
  })

  it('should show dismiss button when dismissible', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '訊息',
        dismissible: true,
      },
    })

    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('should emit dismiss event when dismissed', async () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '訊息',
        dismissible: true,
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('dismiss')).toBeTruthy()
  })

  it('should not render when message is empty', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: '',
      },
    })

    expect(wrapper.find('.message-container').exists()).toBe(false)
  })
})
