<template>
  <div
    v-if="show && record"
    class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h3 class="text-xl font-semibold">
          {{ isEditMode ? "編輯紀錄" : "紀錄詳情" }}
        </h3>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="emit('close')"
        >
          <svg
            class="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- Date -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              建立日期
            </label>
            <p class="text-gray-900">
              {{ formatDateTime(record.timestamp) }}
            </p>
          </div>
          <div v-if="record.updatedAt">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              最後更新
            </label>
            <p class="text-gray-900">
              {{ formatDateTime(record.updatedAt) }}
            </p>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              作物類型
            </label>
            <input
              v-if="isEditMode"
              v-model="localRecord.cropType"
              type="text"
              class="input-field w-full"
            >
            <p
              v-else
              class="text-gray-900"
            >
              {{ record.cropType }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              地區
            </label>
            <input
              v-if="isEditMode"
              v-model="localRecord.region"
              type="text"
              class="input-field w-full"
            >
            <p
              v-else
              class="text-gray-900"
            >
              {{ record.region }}
            </p>
          </div>
        </div>

        <!-- Field Area & Bill -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              耕作面積
            </label>
            <input
              v-if="isEditMode"
              v-model.number="localRecord.fieldArea"
              type="number"
              step="0.1"
              class="input-field w-full"
            >
            <p
              v-else
              class="text-gray-900"
            >
              {{ record.fieldArea }} 分地
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              電費金額
            </label>
            <input
              v-if="isEditMode"
              v-model.number="localRecord.billAmount"
              type="number"
              step="0.01"
              class="input-field w-full"
            >
            <p
              v-else
              class="text-gray-900"
            >
              {{ formatCurrency(record.billAmount) }}
            </p>
          </div>
        </div>

        <!-- Calculation Results -->
        <div class="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 class="font-medium text-gray-900">
            計算結果
          </h4>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-sm text-gray-600">
                用電度數
              </div>
              <div class="text-lg font-semibold text-primary">
                {{ formatKwh(record.calculatedKwh) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">
                水流量
              </div>
              <div class="text-lg font-semibold text-green-600">
                {{ formatFlowRate(record.waterFlowRate) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">
                月用水量
              </div>
              <div
                class="text-lg font-semibold"
                :class="
                  record.monthlyVolume > 2000
                    ? 'text-orange-600'
                    : 'text-indigo-600'
                "
              >
                {{ formatVolume(record.monthlyVolume) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Params -->
        <div class="border-t pt-4">
          <h4 class="font-medium text-gray-900 mb-3">
            進階參數
          </h4>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">抽水馬力:</span>
              <span class="ml-2 text-gray-900">{{ record.pumpHorsepower }} HP</span>
            </div>
            <div>
              <span class="text-gray-600">抽水效率:</span>
              <span class="ml-2 text-gray-900">{{ (record.pumpEfficiency * 100).toFixed(0) }}%</span>
            </div>
            <div>
              <span class="text-gray-600">水井深度:</span>
              <span class="ml-2 text-gray-900">{{ record.wellDepth }} m</span>
            </div>
          </div>
        </div>

        <!-- Notes (if edit mode) -->
        <div v-if="isEditMode">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            備註 (選填)
          </label>
          <textarea
            v-model="localRecord.notes"
            class="input-field w-full"
            rows="3"
            placeholder="可記錄額外資訊..."
          />
        </div>
        <div v-else-if="record.notes">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            備註
          </label>
          <p class="text-gray-900">
            {{ record.notes }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t bg-gray-50">
        <button
          v-if="!isEditMode"
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          @click="handleEdit"
        >
          編輯
        </button>
        <button
          v-if="isEditMode"
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          v-if="isEditMode"
          class="btn-primary"
          @click="handleSave"
        >
          儲存變更
        </button>
        <button
          v-else
          class="btn-primary"
          @click="emit('close')"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  formatDateTime,
  formatCurrency,
  formatKwh,
  formatFlowRate,
  formatVolume,
} from '@/utils/formatters'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  record: {
    type: Object,
    default: null,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

const isEditMode = ref(props.editMode)
const localRecord = ref({ ...props.record })

// Watch for record changes
watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      localRecord.value = { ...newRecord }
    }
  },
  { deep: true },
)

watch(
  () => props.editMode,
  (newMode) => {
    isEditMode.value = newMode
  },
)

function handleEdit() {
  isEditMode.value = true
}

function handleCancel() {
  isEditMode.value = false
  localRecord.value = { ...props.record }
}

function handleSave() {
  emit('save', localRecord.value)
  isEditMode.value = false
}
</script>
