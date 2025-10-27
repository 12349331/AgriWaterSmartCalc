<template>
  <div class="report-section">
    <h2 class="section-title">
      統計摘要
    </h2>
    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
      >
        <div class="stat-label">
          {{ stat.label }}
        </div>
        <div class="stat-value">
          {{ stat.value }}
        </div>
        <div class="stat-unit">
          {{ stat.unit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'

const historyStore = useHistoryStore()

const stats = computed(() => {
  const allRecords = historyStore.records
  const summary = historyStore.statsSummary(allRecords)

  return [
    {
      label: '總抽水次數',
      value: summary.recordCount || 0,
      unit: '次',
    },
    {
      label: '平均月用水量',
      value: summary.avgWaterVolume ? summary.avgWaterVolume.toFixed(1) : '0.0',
      unit: 'm³',
    },
    {
      label: '總用電度數',
      value: summary.totalKwh ? summary.totalKwh.toFixed(1) : '0.0',
      unit: 'kWh',
    },
  ]
})
</script>

<style scoped>
.report-section {
  margin-bottom: 30px;
  page-break-inside: avoid;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-card {
  background-color: #f0f8ff;
  border: 1px solid #d0e8ff;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 5px;
}

.stat-unit {
  font-size: 12px;
  color: #999;
}
</style>
