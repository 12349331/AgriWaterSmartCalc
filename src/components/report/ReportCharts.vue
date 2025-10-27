<template>
  <div class="report-section">
    <h2 class="section-title">
      圖表視覺化
    </h2>

    <!-- 季節性用水趨勢圖 -->
    <div class="chart-container">
      <h3 class="chart-title">
        季節性用水趨勢
      </h3>
      <SeasonalChart
        v-if="hasRecords"
        :records="historyStore.records"
      />
      <p
        v-else
        class="no-data"
      >
        暫無數據
      </p>
    </div>

    <!-- 作物用水量比較圖 -->
    <div class="chart-container">
      <h3 class="chart-title">
        作物用水量比較
      </h3>
      <CropComparisonChart
        v-if="hasRecords"
        :records="historyStore.records"
      />
      <p
        v-else
        class="no-data"
      >
        暫無數據
      </p>
    </div>

    <!-- 年度用水趨勢圖 -->
    <div class="chart-container">
      <h3 class="chart-title">
        年度用水趨勢
      </h3>
      <AnnualTrendChart
        v-if="hasRecords"
        :records="historyStore.records"
      />
      <p
        v-else
        class="no-data"
      >
        暫無數據
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import SeasonalChart from '@/components/charts/SeasonalChart.vue'
import CropComparisonChart from '@/components/charts/CropComparisonChart.vue'
import AnnualTrendChart from '@/components/charts/AnnualTrendChart.vue'

const historyStore = useHistoryStore()

const hasRecords = computed(() => historyStore.recordCount > 0)
</script>

<style scoped>
.report-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.chart-container {
  margin-bottom: 40px;
  page-break-inside: avoid;
  min-height: 300px;
  width: 100%;
}

.chart-container :deep(.echarts) {
  width: 100% !important;
  height: 300px !important;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #555;
  margin: 0 0 15px 0;
  padding-left: 10px;
  border-left: 4px solid #4A90E2;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}
</style>
