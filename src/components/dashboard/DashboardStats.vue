<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Total Records -->
      <div class="bg-blue-50 p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              總記錄數
            </p>
            <p class="text-3xl font-bold text-primary mt-2">
              {{ stats.totalRecords }}
            </p>
          </div>
          <svg
            class="h-12 w-12 text-blue-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fill-rule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Average Water Volume -->
      <div class="bg-green-50 p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              平均用水量
            </p>
            <p class="text-3xl font-bold text-green-700 mt-2">
              {{ stats.avgVolume.toFixed(1) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              m³/月
            </p>
          </div>
          <svg
            class="h-12 w-12 text-green-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5.5 2a.5.5 0 00-.5.5v15a.5.5 0 001 0V2.5a.5.5 0 00-.5-.5zm5 0a.5.5 0 00-.5.5v15a.5.5 0 001 0V2.5a.5.5 0 00-.5-.5zm5 0a.5.5 0 00-.5.5v15a.5.5 0 001 0V2.5a.5.5 0 00-.5-.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Over-extraction Count -->
      <div class="bg-orange-50 p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              超抽次數
            </p>
            <p class="text-3xl font-bold text-orange-600 mt-2">
              {{ stats.overExtractionCount }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              超過 2000 m³
            </p>
          </div>
          <svg
            class="h-12 w-12 text-orange-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Max Volume -->
      <div class="bg-indigo-50 p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              最大用水量
            </p>
            <p class="text-3xl font-bold text-indigo-700 mt-2">
              {{ stats.maxVolume.toFixed(1) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              m³
            </p>
          </div>
          <svg
            class="h-12 w-12 text-indigo-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
      </div>

      <!-- Min Volume -->
      <div class="bg-purple-50 p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              最小用水量
            </p>
            <p class="text-3xl font-bold text-purple-700 mt-2">
              {{ stats.minVolume.toFixed(1) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              m³
            </p>
          </div>
          <svg
            class="h-12 w-12 text-purple-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7z"
            />
          </svg>
        </div>
      </div>

      <!-- Average kWh -->
      <div class="bg-yellow-50 p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              平均用電
            </p>
            <p class="text-3xl font-bold text-yellow-700 mt-2">
              {{ stats.avgKwh.toFixed(1) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              kWh
            </p>
          </div>
          <svg
            class="h-12 w-12 text-yellow-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Additional Insights -->
    <div class="bg-gray-50 p-6 rounded-lg">
      <h4 class="font-semibold text-gray-900 mb-4">
        數據洞察
      </h4>
      <div class="space-y-3">
        <div class="flex items-start">
          <span
            class="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"
          />
          <p class="text-sm text-gray-700">
            <span
              v-if="stats.overExtractionCount > 0"
              class="text-orange-600 font-medium"
            >
              有 {{ stats.overExtractionCount }} 次記錄超過建議用水量
            </span>
            <span
              v-else
              class="text-green-600 font-medium"
            >
              所有記錄均在建議用水量範圍內
            </span>
          </p>
        </div>
        <div class="flex items-start">
          <span
            class="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"
          />
          <p class="text-sm text-gray-700">
            用水量變化範圍：{{ stats.minVolume.toFixed(1) }} -
            {{ stats.maxVolume.toFixed(1) }} m³ (差異
            {{ (stats.maxVolume - stats.minVolume).toFixed(1) }} m³)
          </p>
        </div>
        <div class="flex items-start">
          <span
            class="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3"
          />
          <p class="text-sm text-gray-700">
            建議定期檢視用水數據，優化灌溉策略以達到節水目標
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
  },
})
</script>
