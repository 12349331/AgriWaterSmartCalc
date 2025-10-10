<template>
  <div class="result-card">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">歷史記錄</h2>
      <div class="flex space-x-2">
        <button
          v-if="recordsToDisplay.length > 0"
          @click="emit('export', 'csv')"
          class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          匯出 CSV
        </button>
        <button
          v-if="recordsToDisplay.length > 0"
          @click="emit('export', 'json')"
          class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          匯出 JSON
        </button>
        <button
          v-if="recordsToDisplay.length > 0"
          @click="emit('clear-all')"
          class="text-sm px-3 py-1 text-red-600 hover:text-red-800"
        >
          清除全部
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <DateRangeFilter
      v-model:startDate="filterStartDate"
      v-model:endDate="filterEndDate"
      @apply="applyFilter"
      @clear="clearFilter"
    />

    <!-- Stats Summary (Always Visible FR-014) -->
    <StatsSummary :statsSummaryData="currentStatsSummary" :showAlways="true" />

    <!-- Empty State -->
    <div v-if="recordsToDisplay.length === 0" class="text-center py-12">
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
    <div v-else class="overflow-x-auto" data-test="history-table">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <SortableTableHeader
              label="計費期間"
              sortKey="billingPeriodStart"
              :currentSortKey="historyStore.currentSortKey"
              :currentSortDirection="historyStore.sortDirection"
              @sort="historyStore.setSort"
              tooltip="電費單上的計費期間"
            />
            <SortableTableHeader
              label="創建時間"
              sortKey="timestamp"
              :currentSortKey="historyStore.currentSortKey"
              :currentSortDirection="historyStore.sortDirection"
              @sort="historyStore.setSort"
              tooltip="紀錄建立的系統時間"
            />
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
            v-for="record in recordsToDisplay"
            :key="record.id"
            class="hover:bg-gray-50"
          >
            <td
              class="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
              data-test="billing-period-start"
            >
              {{ formatBillingPeriod(record.billingPeriodStart, record.billingPeriodEnd) }}
            </td>
            <td
              class="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
              data-test="created-time"
            >
              {{ formatCreatedTime(record.timestamp) }}
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
      v-if="recordsToDisplay.length > 10" <!-- Use recordsToDisplay.length -->
      class="mt-4 text-center text-sm text-gray-500"
    >
      共 {{ recordsToDisplay.length }} 筆記錄
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'; // Import ref and computed
import { useHistoryStore } from "@/stores/history";
import { useDateRangeFilter } from "@/composables/useDateRangeFilter"; // Import composable
import { formatKwh, formatVolume, formatCreatedTime, formatBillingPeriod } from "@/utils/formatters";
import SortableTableHeader from "../common/SortableTableHeader.vue"; // Adjusted path
import DateRangeFilter from "../common/DateRangeFilter.vue"; // Import DateRangeFilter
import StatsSummary from "../common/StatsSummary.vue"; // Import StatsSummary

const historyStore = useHistoryStore();

// Integrate useDateRangeFilter
const recordsForFilter = computed(() => historyStore.sortedRecords); // Use sorted records as base
const {
  filterStartDate,
  filterEndDate,
  applyFilter,
  clearFilter,
  filteredRecords,
} = useDateRangeFilter(recordsForFilter, 'billingPeriodStart');

// Computed property for records to display in the table, now reflecting date filter
const recordsToDisplay = computed(() => {
  // If no date filter is active, display sorted records.
  // Otherwise, display filtered and then sorted records.
  // The useDateRangeFilter already filters based on billingPeriodStart,
  // and the history store's sortedRecords is already sorted.
  // To combine them, we need to apply sorting on the filtered list.
  // However, useDateRangeFilter already receives sortedRecords, so it handles this implicitly.
  // If we wanted to re-sort after filtering, we would do it here.
  // For now, `filteredRecords` from the composable should be sufficient.
  // The records passed to the composable `recordsForFilter` are already sorted.
  return filteredRecords.value;
});

// Computed property for stats summary data
const currentStatsSummary = computed(() => {
  return historyStore.statsSummary(recordsToDisplay.value);
});

const emit = defineEmits(["view", "edit", "delete", "clear-all", "export"]);
</script>
