<template>
  <div class="stats-summary-container">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      統計摘要
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 記錄筆數卡片 -->
      <div class="stat-card stat-card-primary group">
        <div class="stat-card-icon-wrapper">
          <svg class="stat-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="stat-card-content">
          <p class="stat-label">記錄筆數</p>
          <transition name="stats-number" mode="out-in">
            <p :key="formattedRecordCount"
               class="stat-value"
               data-test="stats-record-count"
               :aria-label="`共 ${formattedRecordCount} 筆記錄`">
              {{ formattedRecordCount }}
            </p>
          </transition>
          <p class="stat-unit">筆</p>
        </div>
      </div>

      <!-- 平均月用水量卡片 -->
      <div class="stat-card stat-card-info group">
        <div class="stat-card-icon-wrapper">
          <svg class="stat-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>
        <div class="stat-card-content">
          <p class="stat-label">平均月用水量</p>
          <transition name="stats-number" mode="out-in">
            <p :key="formattedAvgWaterVolume"
               class="stat-value"
               data-test="stats-avg-water-volume"
               :aria-label="`平均 ${formattedAvgWaterVolume} 立方公尺`">
              {{ formattedAvgWaterVolume }}
            </p>
          </transition>
          <p class="stat-unit">m³</p>
        </div>
      </div>

      <!-- 總用電度數卡片 -->
      <div class="stat-card stat-card-accent group">
        <div class="stat-card-icon-wrapper">
          <svg class="stat-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div class="stat-card-content">
          <p class="stat-label">總用電度數</p>
          <transition name="stats-number" mode="out-in">
            <p :key="formattedTotalKwh"
               class="stat-value"
               data-test="stats-total-kwh"
               :aria-label="`總計 ${formattedTotalKwh} 千瓦小時`">
              {{ formattedTotalKwh }}
            </p>
          </transition>
          <p class="stat-unit">kWh</p>
        </div>
      </div>
    </div>

    <!-- 空狀態提示 -->
    <div v-if="statsSummaryData.recordCount === 0"
         class="empty-state-hint">
      <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>完成首次計算並儲存記錄後，這裡將顯示統計數據</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  records: { type: Array, default: () => [] },
  showAlways: { type: Boolean, default: true },
  statsSummaryData: {
    type: Object,
    default: () => ({ recordCount: 0, avgWaterVolume: 0, totalKwh: 0 })
  }
});

const formattedRecordCount = computed(() => {
  return props.statsSummaryData.recordCount.toLocaleString('zh-TW');
});

const formattedAvgWaterVolume = computed(() => {
  return props.statsSummaryData.avgWaterVolume.toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

const formattedTotalKwh = computed(() => {
  return props.statsSummaryData.totalKwh.toLocaleString('zh-TW', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
});
</script>

<style scoped>
/* Fluent Design System - 統計摘要容器 */
.stats-summary-container {
  @apply p-6 mb-6 rounded-xl;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 1.6px 3.6px rgba(0, 0, 0, 0.013),
    0 4px 10px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.03);
}

/* 統計卡片基礎樣式 - Fluent Acrylic Effect */
.stat-card {
  @apply relative p-5 rounded-lg overflow-hidden;
  @apply transition-all duration-300 ease-out;
  @apply cursor-default;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 1.6px 3.6px rgba(0, 0, 0, 0.01),
    0 4px 10px rgba(0, 0, 0, 0.015);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.04),
    0 16px 48px rgba(0, 0, 0, 0.06);
}

/* 統計卡片顏色變體 */
.stat-card-primary {
  color: #0078D4; /* Fluent Blue */
}

.stat-card-primary:hover {
  background: rgba(0, 120, 212, 0.05);
}

.stat-card-info {
  color: #00B7C3; /* Fluent Teal */
}

.stat-card-info:hover {
  background: rgba(0, 183, 195, 0.05);
}

.stat-card-accent {
  color: #8764B8; /* Fluent Purple */
}

.stat-card-accent:hover {
  background: rgba(135, 100, 184, 0.05);
}

/* 圖示容器 */
.stat-card-icon-wrapper {
  @apply absolute top-3 right-3 opacity-10;
  @apply transition-all duration-300;
}

.group:hover .stat-card-icon-wrapper {
  @apply opacity-20 scale-110;
}

.stat-card-icon {
  @apply w-12 h-12;
}

/* 統計內容 */
.stat-card-content {
  @apply relative z-10;
}

.stat-label {
  @apply text-xs font-medium uppercase tracking-wide;
  @apply mb-2;
  color: rgba(0, 0, 0, 0.6);
}

.stat-value {
  @apply text-3xl font-bold mb-1;
  @apply transition-all duration-300;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.stat-unit {
  @apply text-xs font-medium;
  color: rgba(0, 0, 0, 0.5);
}

/* 數字更新動畫 */
.stats-number-enter-active,
.stats-number-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.stats-number-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.stats-number-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

/* 空狀態提示 */
.empty-state-hint {
  @apply mt-4 p-4 rounded-lg;
  @apply flex items-center gap-3;
  @apply text-sm text-gray-600;
  background: rgba(0, 120, 212, 0.05);
  border: 1px dashed rgba(0, 120, 212, 0.2);
}

.empty-state-hint svg {
  @apply flex-shrink-0;
}

/* 響應式調整 */
@media (max-width: 640px) {
  .stat-value {
    @apply text-2xl;
  }

  .stat-card {
    @apply p-4;
  }

  .stat-card-icon {
    @apply w-10 h-10;
  }
}
</style>
