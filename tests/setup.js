import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

// Create a fresh Pinia instance before each test
beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)

  // Reset localStorage before each test
  localStorage.clear()
})

// Mock global properties
config.global.mocks = {
  $t: (key) => key, // Mock i18n if needed
}

// Stub ECharts globally for non-chart component tests
config.global.stubs = {
  'v-chart': true,
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

global.localStorage = localStorageMock
