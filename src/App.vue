<template>
  <ErrorBoundary>
    <div
      id="app"
      class="min-h-screen bg-background"
    >
      <!-- Offline Notice -->
      <OfflineNotice :show="uiStore.isOffline" />

      <!-- Main Content -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <header class="mb-8 sm:mb-12">
          <h1 class="govuk-heading-xl text-center">
            💧 水資源查詢與估算平台
          </h1>
          <p class="govuk-body-l text-center text-text-secondary">
            以電推水 - 農業用水量估算工具
          </p>
        </header>

        <!-- Error Message -->
        <ErrorMessage
          v-if="uiStore.error"
          :message="uiStore.error"
          type="error"
          dismissible
          @dismiss="uiStore.error = null"
        />

        <!-- Success Message -->
        <ErrorMessage
          v-if="uiStore.successMessage"
          :message="uiStore.successMessage"
          type="success"
          dismissible
          auto-dismiss
          @dismiss="uiStore.successMessage = null"
        />

        <!-- Calculator Form -->
        <section class="mb-8 sm:mb-10">
          <CalculatorForm
            v-model="formData"
            v-model:pump-params="pumpParams"
            :disabled="uiStore.isOffline || uiStore.isLoading"
            @submit="handleCalculate"
          />
        </section>

        <!-- Results -->
        <section
          v-if="calculationStore.hasCalculated"
          class="mb-8 sm:mb-10"
        >
          <ResultCard
            :water-flow-rate="calculationStore.waterFlowRate"
            :monthly-volume="calculationStore.monthlyVolume"
            :calculated-kwh="calculationStore.calculatedKwh"
            :is-over-extraction="calculationStore.isOverExtraction"
            :loading="uiStore.isLoading"
            :data-source="calculationStore.pricingDataSource"
            @save="handleSaveRecord"
            @share="handleShare"
          />
        </section>

        <!-- History Table -->
        <section class="mb-8 sm:mb-10">
          <HistoryTable
            @view="handleViewRecord"
            @edit="handleEditRecord"
            @delete="handleDeleteRecord"
            @clear-all="handleClearAllRecords"
            @export="handleExport"
          />
        </section>

        <!-- Dashboard Charts -->
        <section
          v-if="historyStore.recordCount > 0"
          class="mb-8 sm:mb-10"
        >
          <DashboardTabs v-model:active-tab="activeTab">
            <template #seasonal>
              <SeasonalChart :records="historyStore.records" />
            </template>
            <template #crop>
              <CropComparisonChart :records="historyStore.records" />
            </template>
            <template #annual>
              <AnnualTrendChart :records="historyStore.records" />
            </template>
            <template #stats>
              <DashboardStats :stats="dashboardStats" />
            </template>
          </DashboardTabs>
        </section>
      </div>

      <!-- Record Detail/Edit Modal -->
      <RecordCard
        :show="showRecordCard"
        :record="selectedRecord"
        :edit-mode="recordEditMode"
        @close="handleCloseRecordCard"
        @save="handleSaveRecordEdit"
      />

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
          <h3
            id="delete-dialog-title"
            class="govuk-heading-m"
          >
            確認刪除
          </h3>
          <p class="govuk-body">
            確定要刪除此紀錄嗎？此操作無法復原。
          </p>
          <div class="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <button
              class="btn-secondary"
              @click="showDeleteConfirm = false"
            >
              取消
            </button>
            <button
              class="btn-warning"
              @click="confirmDelete"
            >
              確定刪除
            </button>
          </div>
        </div>
      </div>

      <!-- Clear All Confirmation Modal -->
      <div
        v-if="showClearAllConfirm"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-all-dialog-title"
        @click.self="showClearAllConfirm = false"
      >
        <div class="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
          <h3
            id="clear-all-dialog-title"
            class="govuk-heading-m"
          >
            確認清除全部
          </h3>
          <p class="govuk-body">
            確定要清除所有歷史紀錄嗎？此操作無法復原。
          </p>
          <div class="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <button
              class="btn-secondary"
              @click="showClearAllConfirm = false"
            >
              取消
            </button>
            <button
              class="btn-warning"
              @click="confirmClearAll"
            >
              確定清除
            </button>
          </div>
        </div>
      </div>
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useCalculationStore } from '@/stores/calculation'
import { useHistoryStore } from '@/stores/history'
import { useUiStore } from '@/stores/ui'
import { calculateStats } from '@/utils/chartHelpers'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import OfflineNotice from '@/components/common/OfflineNotice.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import CalculatorForm from '@/components/calculator/CalculatorForm.vue'
import AdvancedParams from '@/components/calculator/AdvancedParams.vue'
import ResultCard from '@/components/calculator/ResultCard.vue'

// Lazy load heavy components
const HistoryTable = defineAsyncComponent(
  () => import('@/components/history/HistoryTable.vue'),
)
const RecordCard = defineAsyncComponent(
  () => import('@/components/history/RecordCard.vue'),
)
const DashboardTabs = defineAsyncComponent(
  () => import('@/components/dashboard/DashboardTabs.vue'),
)
const DashboardStats = defineAsyncComponent(
  () => import('@/components/dashboard/DashboardStats.vue'),
)
const SeasonalChart = defineAsyncComponent(
  () => import('@/components/charts/SeasonalChart.vue'),
)
const CropComparisonChart = defineAsyncComponent(
  () => import('@/components/charts/CropComparisonChart.vue'),
)
const AnnualTrendChart = defineAsyncComponent(
  () => import('@/components/charts/AnnualTrendChart.vue'),
)

// Stores
const calculationStore = useCalculationStore()
const historyStore = useHistoryStore()
const uiStore = useUiStore()

// State
const formData = ref({})
const pumpParams = ref({
  horsepower: 5.0,
  efficiency: 0.75,
  wellDepth: 30.0,
})

// History state
const showRecordCard = ref(false)
const selectedRecord = ref(null)
const recordEditMode = ref(false)
const showDeleteConfirm = ref(false)
const showClearAllConfirm = ref(false)
const recordToDelete = ref(null)

// Dashboard state
const activeTab = ref('annual')  // User Story 004: Changed default from "seasonal" to "annual"

// Computed
const dashboardStats = computed(() => {
  return calculateStats(historyStore.records)
})

// Methods
const handleCalculate = async (data) => {
  try {
    uiStore.setLoading(true)

    // Fetch Taipower pricing (with automatic fallback)
    await calculationStore.fetchTaipowerPricing()

    // Update form data in store
    calculationStore.setFormData(data)

    // Update pump params
    calculationStore.setPumpParams(pumpParams.value)

    uiStore.setSuccess('計算完成')
  } catch (error) {
    uiStore.setError(error.message || '計算失敗，請稍後再試')
  } finally {
    uiStore.setLoading(false)
  }
}

const handleSaveRecord = () => {
  try {
    const recordData = {
      billAmount: calculationStore.billAmount,
      electricityType: calculationStore.electricityType,
      billingSeason: calculationStore.billingSeason,
      cropType: calculationStore.cropType,
      fieldArea: calculationStore.fieldArea,
      region: calculationStore.region,
      pumpHorsepower: calculationStore.pumpHorsepower,
      pumpEfficiency: calculationStore.pumpEfficiency,
      wellDepth: calculationStore.wellDepth,
      calculatedKwh: calculationStore.calculatedKwh,
      waterFlowRate: calculationStore.waterFlowRate,
      monthlyVolume: calculationStore.monthlyVolume,
      billingPeriodStart: calculationStore.billingPeriodStart,
      billingPeriodEnd: calculationStore.billingPeriodEnd,
    }

    historyStore.addRecord(recordData)
    uiStore.setSuccess('紀錄已儲存')
  } catch (error) {
    uiStore.setError(error.message || '儲存失敗')
  }
}

const handleShare = () => {
  // Share functionality
  const shareData = {
    title: '農業用水量估算結果',
    text: `推算用電: ${calculationStore.calculatedKwh.toFixed(1)} kWh\n每分鐘抽水量: ${calculationStore.waterFlowRate.toFixed(2)} L/s\n每月用水量: ${calculationStore.monthlyVolume.toFixed(2)} m³`,
  }

  if (navigator.share) {
    navigator.share(shareData).catch(() => {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text)
      uiStore.setSuccess('結果已複製到剪貼簿')
    })
  } else {
    navigator.clipboard.writeText(shareData.text)
    uiStore.setSuccess('結果已複製到剪貼簿')
  }
}

// History methods
const handleViewRecord = (record) => {
  selectedRecord.value = record
  recordEditMode.value = false
  showRecordCard.value = true
}

const handleEditRecord = (record) => {
  selectedRecord.value = record
  recordEditMode.value = true
  showRecordCard.value = true
}

const handleDeleteRecord = (recordId) => {
  recordToDelete.value = recordId
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  try {
    historyStore.deleteRecord(recordToDelete.value)
    uiStore.setSuccess('紀錄已刪除')
  } catch (error) {
    uiStore.setError(error.message || '刪除失敗')
  } finally {
    showDeleteConfirm.value = false
    recordToDelete.value = null
  }
}

const handleClearAllRecords = () => {
  showClearAllConfirm.value = true
}

const confirmClearAll = () => {
  try {
    historyStore.clearAllRecords()
    uiStore.setSuccess('所有紀錄已清除')
  } catch (error) {
    uiStore.setError(error.message || '清除失敗')
  } finally {
    showClearAllConfirm.value = false
  }
}

const handleCloseRecordCard = () => {
  showRecordCard.value = false
  selectedRecord.value = null
  recordEditMode.value = false
}

const handleSaveRecordEdit = (updatedRecord) => {
  try {
    historyStore.updateRecord(updatedRecord.id, updatedRecord)
    uiStore.setSuccess('紀錄已更新')
    handleCloseRecordCard()
  } catch (error) {
    uiStore.setError(error.message || '更新失敗')
  }
}

const handleExport = (format) => {
  try {
    if (format === 'csv') {
      historyStore.downloadCSV()
      uiStore.setSuccess('CSV 檔案已下載')
    } else if (format === 'json') {
      historyStore.downloadJSON()
      uiStore.setSuccess('JSON 檔案已下載')
    }
  } catch (error) {
    uiStore.setError(error.message || '匯出失敗')
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Check online status
    uiStore.checkOnlineStatus()

    // Try to fetch Taipower pricing (non-blocking)
    calculationStore.fetchTaipowerPricing().catch(() => {
      // Silently fail - will use fallback calculation
    })
  } catch (error) {
    console.error('Initialization error:', error)
  }
})
</script>
