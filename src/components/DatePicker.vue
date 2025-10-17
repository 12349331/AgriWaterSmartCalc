<template>
  <div
    class="space-y-2"
    data-testid="date-picker-container"
  >
    <!-- Date Field with Picker Trigger -->
    <div class="flex flex-col">
      <label
        id="billing-date-label"
        for="billing-date-input"
        class="text-sm font-medium text-gray-700 mb-1"
      >
        用電日期
      </label>

      <van-field
        id="billing-date-input"
        v-model="displayDate"
        readonly
        is-link
        placeholder="請選擇日期"
        aria-labelledby="billing-date-label"
        :aria-describedby="isFuture ? 'future-date-warning' : undefined"
        data-testid="billing-date-input"
        class="date-picker-field"
        @click="showPicker = true"
      />
    </div>

    <!-- Vant DatePicker (Roller Style) -->
    <van-popup
      v-model:show="showPicker"
      position="bottom"
      :style="{ height: '50%' }"
    >
      <van-date-picker
        v-model="currentDate"
        :min-date="minDate"
        :max-date="maxDate"
        title="選擇用電日期"
        :columns-type="['year', 'month', 'day']"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>

    <!-- Future Date Warning -->
    <div
      v-if="isFuture"
      id="future-date-warning"
      data-testid="future-date-warning"
      class="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
      role="alert"
    >
      <svg
        class="w-5 h-5 text-yellow-600 mt-0.5 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <div class="flex-1 text-sm text-yellow-800">
        您選擇的是未來日期，系統將在提交時進行確認
      </div>
    </div>

    <!-- Boundary Date Info -->
    <div
      v-if="isBoundary"
      data-testid="boundary-date-info"
      class="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
    >
      <svg
        class="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      <div class="flex-1 text-sm text-blue-800">
        這是計價季節轉換的邊界日期（{{ getBoundaryInfo() }}）
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { determineBillingSeason, isBoundaryDate } from '@/utils/billing-seasons'
import { isFutureDate, MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'

const props = defineProps({
  modelValue: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
})

const emit = defineEmits(['update:modelValue', 'season-change'])

// Picker visibility
const showPicker = ref(false)

// Local state
const selectedDate = ref(props.modelValue)

// Min/Max dates for picker
const minDate = computed(() => new Date(MIN_ALLOWED_DATE))
const maxDate = computed(() => new Date(getMaxAllowedDate()))

// Current date for picker (array format: [year, month, day])
const currentDate = computed({
  get() {
    if (!selectedDate.value) return [new Date().getFullYear().toString(), '01', '01']
    const date = new Date(selectedDate.value)
    return [
      date.getFullYear().toString(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ]
  },
  set(value) {
    // This setter is needed for v-model but actual update happens in onConfirm
  }
})

// Display date format
const displayDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
})

// Computed properties
const currentSeason = computed(() => {
  if (!selectedDate.value) return null
  try {
    return determineBillingSeason(selectedDate.value)
  } catch (error) {
    return null
  }
})

const isFuture = computed(() => {
  if (!selectedDate.value) return false
  return isFutureDate(selectedDate.value)
})

const isBoundary = computed(() => {
  if (!selectedDate.value) return false
  return isBoundaryDate(selectedDate.value)
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue
})

watch(currentSeason, (newSeason, oldSeason) => {
  if (oldSeason !== null && newSeason !== oldSeason) {
    emit('season-change', newSeason)
  }
})

// Methods
const onConfirm = ({ selectedValues }) => {
  const [year, month, day] = selectedValues
  const dateString = `${year}-${month}-${day}`

  selectedDate.value = dateString
  emit('update:modelValue', dateString)
  showPicker.value = false
}

const getBoundaryInfo = () => {
  if (!selectedDate.value) return ''

  const date = new Date(selectedDate.value)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (month === 6 && day === 1) return '夏月開始'
  if (month === 9 && day === 30) return '夏月結束'
  if (month === 10 && day === 1) return '非夏月開始'
  if (month === 5 && day === 31) return '非夏月結束'

  return ''
}
</script>

<style scoped>
.date-picker-field {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.date-picker-field :deep(.van-field__control) {
  color: #111827;
}

.date-picker-field :deep(.van-field__control:disabled) {
  color: #6b7280;
}
</style>
