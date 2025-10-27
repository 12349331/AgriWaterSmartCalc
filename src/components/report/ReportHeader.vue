<template>
  <div class="report-header">
    <h1 class="report-title">
      水資源查詢與估算平台 - 數據報告
    </h1>
    <p class="export-time">
      匯出時間：{{ exportTime }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatTaiwanDateTime } from '@/utils/report-generator'

const exportTime = computed(() => formatTaiwanDateTime())
</script>

<style scoped>
.report-header {
  padding: 20px 0;
  border-bottom: 2px solid #333;
  margin-bottom: 20px;
}

.report-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
  text-align: center;
}

.export-time {
  font-size: 14px;
  color: #666;
  margin: 0;
  text-align: center;
}
</style>
