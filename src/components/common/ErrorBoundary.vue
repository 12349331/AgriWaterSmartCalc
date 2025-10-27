<template>
  <div
    v-if="hasError"
    class="min-h-screen bg-gray-50 flex items-center justify-center p-4"
  >
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <svg
        class="mx-auto h-16 w-16 text-red-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        糟糕！發生錯誤
      </h2>
      <p class="text-gray-600 mb-6">
        應用程式遇到了意外錯誤，請嘗試重新整理頁面。
      </p>

      <details
        v-if="errorDetails && isDevelopment"
        class="mb-6 text-left"
      >
        <summary
          class="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
        >
          查看錯誤詳情（開發模式）
        </summary>
        <pre class="mt-2 p-4 bg-gray-100 rounded-sm text-xs overflow-auto">{{
          errorDetails
        }}</pre>
      </details>

      <!-- Production-friendly error ID for support -->
      <div
        v-if="!isDevelopment && errorId"
        class="mb-6 text-sm text-gray-500"
      >
        錯誤代碼：{{ errorId }}
      </div>

      <div class="space-y-3">
        <button
          class="w-full btn-primary"
          @click="reload"
        >
          重新整理頁面
        </button>
        <button
          class="w-full px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50"
          @click="clearAndReload"
        >
          清除資料並重新整理
        </button>
      </div>

      <p class="mt-6 text-xs text-gray-500">
        若問題持續發生，請聯繫技術支援
      </p>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, onErrorCaptured, computed } from 'vue'

const hasError = ref(false)
const errorDetails = ref('')
const errorId = ref('')

// 判斷是否為開發環境
// 可透過 props 覆寫（主要用於測試）
const props = defineProps({
  forceDevelopmentMode: {
    type: Boolean,
    default: undefined,
  },
})

const isDevelopment = computed(() => {
  // 如果有明確指定，則使用指定值（用於測試）
  if (props.forceDevelopmentMode !== undefined) {
    return props.forceDevelopmentMode
  }
  // 否則根據環境變數判斷
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
})

// 生成錯誤 ID（用於正式環境的錯誤追蹤）
function generateErrorId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 7)
  return `ERR-${timestamp}-${randomStr}`.toUpperCase()
}

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  
  // 生成唯一的錯誤 ID
  const currentErrorId = generateErrorId()
  errorId.value = currentErrorId
  
  // 在開發環境顯示完整錯誤訊息
  if (isDevelopment.value) {
    errorDetails.value = `Error: ${err.message}\nInfo: ${info}\nStack: ${err.stack}`
  }

  // 記錄完整錯誤到 logger（包含錯誤 ID）
  logger.error(`[${currentErrorId}] Error boundary caught:`, {
    error: err,
    message: err.message,
    stack: err.stack,
    info,
    component: instance,
  })

  // 防止錯誤繼續傳播
  return false
})

function reload() {
  window.location.reload()
}

function clearAndReload() {
  // Clear localStorage
  localStorage.clear()

  // Clear sessionStorage
  sessionStorage.clear()

  // Reload
  window.location.reload()
}
</script>
