<template>
  <div class="report-section">
    <h2 class="section-title">
      數據洞察
    </h2>

    <!-- 統計數值 -->
    <div class="insights-stats">
      <div class="stat-row">
        <span class="stat-label">總紀錄次數：</span>
        <span class="stat-value">{{ stats.recordCount }} 次</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">平均用水量：</span>
        <span class="stat-value">{{ stats.avgWaterUsage.toFixed(1) }} m³</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">最大用水量：</span>
        <span class="stat-value">{{ stats.maxWaterUsage.toFixed(1) }} m³</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">最小用水量：</span>
        <span class="stat-value">{{ stats.minWaterUsage.toFixed(1) }} m³</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">平均用電：</span>
        <span class="stat-value">{{ stats.avgKwh.toFixed(1) }} kWh</span>
      </div>
    </div>

    <!-- 洞察文字 -->
    <div class="insights-text">
      <h3 class="insights-subtitle">
        分析洞察：
      </h3>
      <ul class="insights-list">
        <li
          v-for="(insight, index) in insights"
          :key="index"
          class="insight-item"
        >
          {{ insight }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { generateInsights } from '@/utils/insights-generator'

const historyStore = useHistoryStore()

const stats = computed(() => {
  const allRecords = historyStore.records

  if (allRecords.length === 0) {
    return {
      recordCount: 0,
      avgWaterUsage: 0,
      maxWaterUsage: 0,
      minWaterUsage: 0,
      avgKwh: 0,
    }
  }

  const waterUsages = allRecords.map(r => r.monthlyVolume || 0)
  const kwhValues = allRecords.map(r => r.calculatedKwh || 0)

  const avgWaterUsage = waterUsages.reduce((sum, val) => sum + val, 0) / waterUsages.length
  const maxWaterUsage = Math.max(...waterUsages)
  const minWaterUsage = Math.min(...waterUsages)
  const avgKwh = kwhValues.reduce((sum, val) => sum + val, 0) / kwhValues.length

  return {
    recordCount: allRecords.length,
    avgWaterUsage,
    maxWaterUsage,
    minWaterUsage,
    avgKwh,
  }
})

const insights = computed(() => {
  return generateInsights({
    avgWaterUsage: stats.value.avgWaterUsage,
    maxWaterUsage: stats.value.maxWaterUsage,
    minWaterUsage: stats.value.minWaterUsage,
  })
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

.insights-stats {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.insights-text {
  margin-top: 20px;
}

.insights-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #555;
  margin: 0 0 15px 0;
}

.insights-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insight-item {
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  color: #555;
  line-height: 1.6;
}

.insight-item:last-child {
  margin-bottom: 0;
}
</style>
