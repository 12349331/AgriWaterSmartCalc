<template>
  <div class="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">統計摘要</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-aqua-50 dark:bg-aqua-900 p-3 rounded-md">
        <p class="text-sm font-medium text-aqua-700 dark:text-aqua-300">記錄筆數</p>
        <p class="text-2xl font-bold text-aqua-800 dark:text-aqua-100" data-test="stats-record-count">{{ formattedRecordCount }}</p>
      </div>
      <div class="bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
        <p class="text-sm font-medium text-blue-700 dark:text-blue-300">平均月用水量 (m³)</p>
        <p class="text-2xl font-bold text-blue-800 dark:text-blue-100" data-test="stats-avg-water-volume">{{ formattedAvgWaterVolume }}</p>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900 p-3 rounded-md">
        <p class="text-sm font-medium text-purple-700 dark:text-purple-300">總用電度數 (kWh)</p>
        <p class="text-2xl font-bold text-purple-800 dark:text-purple-100" data-test="stats-total-kwh">{{ formattedTotalKwh }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  records: { type: Array, default: () => [] },
  showAlways: { type: Boolean, default: true }, // FR-014: Stats summary is always visible
  statsSummaryData: { type: Object, default: () => ({ recordCount: 0, avgWaterVolume: 0, totalKwh: 0 }) }
});

const formattedRecordCount = computed(() => {
  return props.statsSummaryData.recordCount.toLocaleString();
});

const formattedAvgWaterVolume = computed(() => {
  return props.statsSummaryData.avgWaterVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const formattedTotalKwh = computed(() => {
  return props.statsSummaryData.totalKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
});

// The showAlways prop ensures the component itself is always rendered,
// but the content within might be dynamic based on records or statsSummaryData.
</script>
