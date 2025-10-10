<template>
  <div class="result-card">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">歷史記錄</h2>
      <div class="flex space-x-2">
        <button
          v-if="historyStore.recordCount > 0"
          @click="emit('export', 'csv')"
          class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          匯出 CSV
        </button>
        <button
          v-if="historyStore.recordCount > 0"
          @click="emit('export', 'json')"
          class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          匯出 JSON
        </button>
        <button
          v-if="historyStore.recordCount > 0"
          @click="emit('clear-all')"
          class="text-sm px-3 py-1 text-red-600 hover:text-red-800"
        >
          清除全部
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="historyStore.recordCount === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="mt-2 text-gray-600">尚無歷史記錄</p>
      <p class="text-sm text-gray-500">完成計算後點選「儲存紀錄」即可保存</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              日期
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              作物
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              面積
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              用電
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              用水量
            </th>
            <th
              class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="record in historyStore.sortedRecords"
            :key="record.id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(record.timestamp) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ record.cropType }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ record.fieldArea }} 分
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ formatKwh(record.calculatedKwh) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span
                :class="
                  record.monthlyVolume > 2000
                    ? 'text-orange-600 font-semibold'
                    : 'text-gray-900'
                "
              >
                {{ formatVolume(record.monthlyVolume) }}
              </span>
            </td>
            <td
              class="px-4 py-3 whitespace-nowrap text-right text-sm space-x-2"
            >
              <button
                @click="emit('view', record)"
                class="text-primary hover:text-blue-700"
              >
                查看
              </button>
              <button
                @click="emit('edit', record)"
                class="text-gray-600 hover:text-gray-800"
              >
                編輯
              </button>
              <button
                @click="emit('delete', record.id)"
                class="text-red-600 hover:text-red-800"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination (future enhancement) -->
    <div
      v-if="historyStore.recordCount > 10"
      class="mt-4 text-center text-sm text-gray-500"
    >
      共 {{ historyStore.recordCount }} 筆記錄
    </div>
  </div>
</template>

<script setup>
import { useHistoryStore } from "@/stores/history";
import { formatDate, formatKwh, formatVolume } from "@/utils/formatters";

const historyStore = useHistoryStore();

const emit = defineEmits(["view", "edit", "delete", "clear-all", "export"]);
</script>
