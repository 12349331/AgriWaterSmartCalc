import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // State
  const isLoading = ref(false)
  const error = ref(null)
  const successMessage = ref(null)
  const isOffline = ref(false)
  const activeTab = ref('seasonal')
  const showClearConfirm = ref(false)
  const showAdvancedParams = ref(false)

  // Actions
  function setLoading(value) {
    isLoading.value = value
  }

  function setError(message) {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000) // Auto-dismiss after 5s
  }

  function setSuccess(message) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = null
    }, 3000) // Auto-dismiss after 3s
  }

  function checkOnlineStatus() {
    // 初始檢查：優先相信瀏覽器是 online 的，避免誤報
    // 在開發環境中，navigator.onLine 可能不準確
    isOffline.value = false

    // 監聽實際的網路狀態變化
    window.addEventListener('online', () => {
      isOffline.value = false
    })

    window.addEventListener('offline', () => {
      isOffline.value = true
    })

    // 僅在明確檢測到離線時才設為 true
    if (!navigator.onLine) {
      // 嘗試發送一個簡單的請求來驗證
      fetch('/favicon.svg', { method: 'HEAD', cache: 'no-cache' })
        .then(() => {
          isOffline.value = false // 可以連線，覆蓋 navigator.onLine 的結果
        })
        .catch(() => {
          isOffline.value = true // 確實無法連線
        })
    }
  }

  function setActiveTab(tab) {
    activeTab.value = tab
  }

  function toggleAdvancedParams() {
    showAdvancedParams.value = !showAdvancedParams.value
  }

  return {
    // State
    isLoading,
    error,
    successMessage,
    isOffline,
    activeTab,
    showClearConfirm,
    showAdvancedParams,
    // Actions
    setLoading,
    setError,
    setSuccess,
    checkOnlineStatus,
    setActiveTab,
    toggleAdvancedParams,
  }
})
