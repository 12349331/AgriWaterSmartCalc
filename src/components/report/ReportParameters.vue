<template>
  <div class="report-section">
    <h2 class="section-title">
      輸入參數
    </h2>
    <div class="parameters-list">
      <div
        v-for="param in parameters"
        :key="param.label"
        class="parameter-item"
      >
        <span class="param-label">{{ param.label }}：</span>
        <span class="param-value">{{ param.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalculationStore } from '@/stores/calculation'

const calculationStore = useCalculationStore()

const parameters = computed(() => {
  const billingPeriod = calculationStore.billingPeriodStart && calculationStore.billingPeriodEnd
    ? `${calculationStore.billingPeriodStart} ~ ${calculationStore.billingPeriodEnd}`
    : calculationStore.billingDate || '未設定'

  return [
    { label: '電費金額', value: `${calculationStore.billAmount || 0} 元` },
    { label: '計費期間', value: billingPeriod },
    { label: '電價種類', value: `${calculationStore.electricityType}-${calculationStore.timePricingCategory || '標準'}` },
    { label: '作物類型', value: calculationStore.cropType || '未選擇' },
    { label: '耕地面積', value: `${calculationStore.fieldArea || 0} m²` },
    { label: '抽水馬力', value: `${calculationStore.pumpHorsepower || 0} HP` },
    { label: '抽水效率', value: `${((calculationStore.pumpEfficiency || 0) * 100).toFixed(0)}%` },
    { label: '水井深度', value: `${calculationStore.wellDepth || 0} m` },
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

.parameters-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.parameter-item {
  display: flex;
  padding: 8px 12px;
  background-color: #f9f9f9;
  border-left: 3px solid #4A90E2;
}

.param-label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
}

.param-value {
  color: #333;
}
</style>
