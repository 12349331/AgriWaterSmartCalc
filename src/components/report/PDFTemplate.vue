<template>
  <div
    ref="pdfTemplateRef"
    class="pdf-template"
  >
    <!-- 報告頁首 -->
    <ReportHeader />

    <!-- 輸入參數區塊 -->
    <ReportParameters />

    <!-- 統計摘要區塊 -->
    <ReportStats />

    <!-- 圖表視覺化區塊 -->
    <ReportCharts />

    <!-- 數據洞察區塊 -->
    <ReportInsights />

    <!-- 頁尾（頁碼由 html2pdf.js 自動處理） -->
    <div class="report-footer">
      <p class="footer-text">
        © {{ currentYear }} 水資源查詢與估算平台
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ReportHeader from './ReportHeader.vue'
import ReportParameters from './ReportParameters.vue'
import ReportStats from './ReportStats.vue'
import ReportCharts from './ReportCharts.vue'
import ReportInsights from './ReportInsights.vue'

const pdfTemplateRef = ref(null)

const currentYear = computed(() => new Date().getFullYear())

// 暴露 template ref 給父元件使用
defineExpose({
  pdfTemplateRef,
})
</script>

<style scoped>
.pdf-template {
  width: 210mm; /* A4 寬度 */
  max-width: 210mm;
  margin: 0 auto;
  padding: 20mm;
  background-color: white;
  font-family: 'Microsoft JhengHei', 'Noto Sans TC', sans-serif;
  color: #333;
  box-sizing: border-box;
}

.report-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 列印樣式 */
@media print {
  .pdf-template {
    margin: 0;
    padding: 15mm;
  }
}
</style>
