<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
    role="alert"
    aria-live="assertive"
  >
    <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
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
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
        />
      </svg>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        無法連線
      </h2>
      <p class="text-gray-600 mb-4">
        偵測到您目前處於離線狀態。<br>
        請檢查網路連線後重新整理頁面。
      </p>
      <p class="text-sm text-gray-500">
        本系統需要連線至台電 API 以取得電費資料
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})
</script>
