<template>
  <div
    class="result-card"
    :class="{ 'border-2 border-warning': isOverExtraction }"
  >
    <h2 class="text-xl font-semibold mb-4">
      計算結果
    </h2>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="text-center py-8"
    >
      <LoadingSpinner size="md" />
      <p class="text-gray-600 mt-2">
        計算中...
      </p>
    </div>

    <!-- Results -->
    <div
      v-else
      class="space-y-4"
    >
      <!-- Calculated kWh -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600">
          推算用電度數
        </div>
        <div class="text-2xl font-bold text-primary">
          {{ formatKwh(calculatedKwh) }}
        </div>
      </div>

      <!-- Water Flow Rate (Q) -->
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-sm text-gray-600">
          每分鐘抽水量 (Q)
        </div>
        <div class="text-2xl font-bold text-green-700">
          {{ formatFlowRate(waterFlowRate) }}
        </div>
      </div>

      <!-- Monthly Volume (V) -->
      <div
        class="p-4 rounded-lg"
        :class="isOverExtraction ? 'bg-orange-50' : 'bg-indigo-50'"
      >
        <div class="text-sm text-gray-600">
          每月用水量 (V)
        </div>
        <div
          class="text-2xl font-bold"
          :class="isOverExtraction ? 'text-orange-600' : 'text-indigo-700'"
        >
          {{ formatVolume(monthlyVolume) }}
        </div>
        <div
          v-if="isOverExtraction"
          class="mt-2 text-sm text-orange-700 flex items-start"
        >
          <svg
            class="h-5 w-5 mr-1 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span> 用水量超過建議閾值 (2000 m³)，請確認計算參數是否正確 </span>
        </div>
      </div>

      <!-- Pricing Version Information -->
      <div
        v-if="currentPricingVersion || isCrossVersion"
        class="mt-3 p-3 bg-blue-50 rounded-sm text-sm space-y-2"
      >
        <div class="flex items-start">
          <svg
            class="h-4 w-4 mr-2 shrink-0 text-blue-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="flex-1">
            <div
              v-if="!isCrossVersion"
              class="text-gray-700"
            >
              電價版本：<span class="font-medium">{{ currentPricingVersion }}</span>
            </div>
            <div
              v-else
              class="text-gray-700"
            >
              <div class="font-medium mb-2">
                ⚡ 計費期間橫跨多個電價版本（已按比例拆分）
              </div>
              <div
                v-for="(period, index) in crossVersionBreakdown"
                :key="index"
                class="ml-4 mt-1 text-xs space-y-1"
              >
                <div class="flex items-center space-x-2">
                  <span class="font-mono bg-blue-100 px-2 py-0.5 rounded">
                    {{ period.version }}
                  </span>
                  <span class="text-gray-600">
                    {{ formatDate(period.start) }} ~ {{ formatDate(period.end) }}
                  </span>
                  <span class="text-gray-500">({{ period.days }} 天)</span>
                </div>
                <div class="ml-2 text-gray-600">
                  電費：{{ formatCurrency(period.bill) }} → 用電：{{ formatKwh(period.kwh) }}
                  ({{ period.season }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Source Notice -->
      <div
        v-if="dataSource && dataSource !== 'api'"
        class="mt-3 p-3 bg-gray-50 rounded-sm text-sm"
      >
        <div class="flex items-start">
          <svg
            class="h-4 w-4 mr-2 shrink-0 text-gray-500 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-gray-600">
            <span v-if="dataSource === 'local'"> ℹ️ 使用本地完整電價資料 </span>
            <span v-else-if="dataSource === 'cache'">
              ℹ️ 使用快取電價資料（24 小時內有效）
            </span>
            <span v-else-if="dataSource === 'fallback'">
              ⚠️ 使用簡化電價資料（台電 API 無法連線）
            </span>
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 pt-2">
        <button
          type="button"
          class="btn-primary flex-1"
          @click="emit('save')"
        >
          儲存紀錄
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50"
          @click="emit('share')"
        >
          分享
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatKwh, formatFlowRate, formatVolume } from '@/utils/formatters'

defineProps({
  waterFlowRate: {
    type: Number,
    default: 0,
  },
  monthlyVolume: {
    type: Number,
    default: 0,
  },
  calculatedKwh: {
    type: Number,
    default: 0,
  },
  isOverExtraction: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: String,
    default: '',
  },
  currentPricingVersion: {
    type: String,
    default: null,
  },
  isCrossVersion: {
    type: Boolean,
    default: false,
  },
  crossVersionBreakdown: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['save', 'share'])

// Helper functions for formatting
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') return '0 元'
  return `${amount.toFixed(0)} 元`
}
</script>
