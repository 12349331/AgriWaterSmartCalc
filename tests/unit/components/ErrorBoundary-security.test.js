import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import { nextTick } from 'vue'

// 有錯誤的測試元件
const ErrorComponent = {
  name: 'ErrorComponent',
  template: '<div>{{ throwError() }}</div>',
  methods: {
    throwError() {
      throw new Error('測試錯誤訊息')
    },
  },
}

describe('ErrorBoundary - 安全性測試', () => {
  beforeEach(() => {
    // 清除 console.error 的 mock
    vi.clearAllMocks()
    // 抑制 Vue 的錯誤警告
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('開發環境', () => {
    it('應該顯示詳細的錯誤訊息', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: true, // 強制開發模式
        },
        slots: {
          default: ErrorComponent,
        },
        global: {
          stubs: {
            ErrorComponent,
          },
        },
      })

      await nextTick()
      await nextTick()

      // 檢查是否顯示錯誤頁面
      expect(wrapper.text()).toContain('糟糕！發生錯誤')

      // 檢查是否包含"開發模式"標記
      expect(wrapper.text()).toContain('開發模式')

      // 檢查是否有詳細錯誤訊息的摺疊區塊
      const details = wrapper.find('details')
      expect(details.exists()).toBe(true)
    })

    it('應該顯示錯誤堆疊追蹤', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: true, // 強制開發模式
        },
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      const pre = wrapper.find('pre')
      expect(pre.exists()).toBe(true)

      // 應該包含錯誤訊息
      expect(wrapper.text()).toContain('測試錯誤訊息')
    })
  })

  describe('正式環境', () => {
    it('不應該顯示詳細的錯誤訊息', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: false, // 強制正式模式
        },
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      // 應該顯示錯誤頁面
      expect(wrapper.text()).toContain('糟糕！發生錯誤')

      // 不應該顯示"開發模式"
      expect(wrapper.text()).not.toContain('開發模式')

      // 不應該有詳細錯誤訊息的摺疊區塊
      const details = wrapper.find('details')
      expect(details.exists()).toBe(false)
    })

    it('不應該顯示錯誤堆疊追蹤', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: false, // 強制正式模式
        },
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      // 不應該有 pre 標籤（堆疊追蹤）
      const pre = wrapper.find('pre')
      expect(pre.exists()).toBe(false)

      // 不應該顯示詳細的錯誤訊息
      expect(wrapper.text()).not.toContain('Stack:')
      expect(wrapper.text()).not.toContain('測試錯誤訊息')
    })

    it('應該顯示錯誤代碼供技術支援使用', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: false, // 強制正式模式
        },
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      // 應該顯示錯誤代碼
      expect(wrapper.text()).toContain('錯誤代碼')
      expect(wrapper.text()).toMatch(/ERR-[A-Z0-9]+-[A-Z0-9]+/)
    })

    it('錯誤代碼應該是唯一的', async () => {
      const wrapper1 = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: false, // 強制正式模式
        },
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      const errorId1 = wrapper1.text().match(/ERR-[A-Z0-9]+-[A-Z0-9]+/)?.[0]

      // 建立第二個錯誤實例
      const wrapper2 = mount(ErrorBoundary, {
        props: {
          forceDevelopmentMode: false, // 強制正式模式
        },
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      const errorId2 = wrapper2.text().match(/ERR-[A-Z0-9]+-[A-Z0-9]+/)?.[0]

      // 兩個錯誤 ID 應該不同
      expect(errorId1).toBeTruthy()
      expect(errorId2).toBeTruthy()
      expect(errorId1).not.toBe(errorId2)
    })
  })

  describe('通用功能', () => {
    it('應該顯示友善的錯誤訊息', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('糟糕！發生錯誤')
      expect(wrapper.text()).toContain('應用程式遇到了意外錯誤')
      expect(wrapper.text()).toContain('重新整理頁面')
    })

    it('應該提供重新整理按鈕', async () => {
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      const reloadButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重新整理頁面') && !btn.text().includes('清除'),
      )

      expect(reloadButton).toBeTruthy()

      await reloadButton.trigger('click')
      expect(reloadSpy).toHaveBeenCalled()

      reloadSpy.mockRestore()
    })

    it('應該提供清除資料並重新整理的選項', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      const clearButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('清除資料並重新整理'),
      )

      expect(clearButton).toBeTruthy()
    })

    it('應該顯示技術支援聯絡訊息', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ErrorComponent,
        },
      })

      await nextTick()
      await nextTick()

      expect(wrapper.text()).toContain('若問題持續發生，請聯繫技術支援')
    })
  })

  describe('無錯誤時', () => {
    it('應該正常顯示子元件', () => {
      const NormalComponent = {
        name: 'NormalComponent',
        template: '<div>正常內容</div>',
      }

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: NormalComponent,
        },
      })

      expect(wrapper.text()).toContain('正常內容')
      expect(wrapper.text()).not.toContain('糟糕！發生錯誤')
    })
  })
})

