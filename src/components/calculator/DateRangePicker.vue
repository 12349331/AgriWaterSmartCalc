<template>
  <div
    data-testid="date-range-container"
    class="date-range-picker"
  >
    <!-- Date Range Field -->
    <div class="flex flex-col">
      <label
        id="date-range-label"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        電費計費期間 <span class="text-red-500">*</span>
      </label>

      <van-field
        v-model="displayRange"
        readonly
        is-link
        placeholder="請選擇起訖日期"
        aria-labelledby="date-range-label"
        data-testid="date-range-field"
        class="date-range-field"
        @click="showPicker = true"
      />
    </div>

    <!-- Vant PickerGroup with DatePickers (Roller Style) -->
    <van-popup
      v-model:show="showPicker"
      position="bottom"
      :style="{ height: '50%' }"
    >
      <van-picker-group
        title="選擇計費期間"
        :tabs="['起始日期', '結束日期']"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      >
        <van-date-picker
          v-model="startDateArray"
          :min-date="minDate"
          :max-date="maxDate"
          :columns-type="['year', 'month', 'day']"
        />
        <van-date-picker
          v-model="endDateArray"
          :min-date="computedEndMinDate"
          :max-date="maxDate"
          :columns-type="['year', 'month', 'day']"
        />
      </van-picker-group>
    </van-popup>

    <!-- Season Display -->
    <div
      v-if="startDate && endDate && !validationResult.error"
      class="mt-3 flex items-center gap-2"
    >
      <span class="text-sm font-medium text-gray-700">計價季節：</span>
      <span
        data-testid="season-display"
        :class="[
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          determinedSeason === '夏月'
            ? 'bg-orange-100 text-orange-800'
            : 'bg-blue-100 text-blue-800'
        ]"
      >
        {{ determinedSeason }}
      </span>
      <span class="text-xs text-gray-500">(自動判定)</span>
    </div>

    <!-- Validation Error -->
    <div
      v-if="validationResult.error"
      data-testid="validation-error"
      class="mt-2 text-sm text-red-600 flex items-start gap-2"
    >
      <svg
        class="w-5 h-5 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ validationResult.error }}</span>
    </div>

    <!-- Cross-Season Warning -->
    <div
      v-if="isCrossSeason && !validationResult.error"
      data-testid="cross-season-warning"
      class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-start gap-2"
    >
      <svg
        class="w-5 h-5 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>此計費期間橫跨夏月與非夏月邊界，系統將按天數比例混合計算兩個季節的費率。顯示季節「{{ determinedSeason }}」僅供參考（以天數較多者為準）。</span>
    </div>

    <!-- Long Period Warning -->
    <div
      v-if="validationResult.warning && validationResult.warning.includes('異常長')"
      data-testid="period-warning"
      class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-start gap-2"
    >
      <svg
        class="w-5 h-5 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ validationResult.warning }}</span>
    </div>

    <!-- Future Date Warning -->
    <div
      v-if="validationResult.warning && validationResult.warning.includes('未來日期')"
      data-testid="future-date-warning"
      class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-start gap-2"
    >
      <svg
        class="w-5 h-5 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ validationResult.warning }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBillingPeriod } from '@/composables/useBillingPeriod'
import { MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'

const props = defineProps({
  startDate: {
    type: String,
    default: null,
  },
  endDate: {
    type: String,
    default: null,
  },
  minDate: {
    type: String,
    default: MIN_ALLOWED_DATE,
  },
  maxDate: {
    type: String,
    default: () => getMaxAllowedDate(),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:startDate',
  'update:endDate',
  'season-changed',
  'cross-season-warning',
  'validation-error',
])

// Picker visibility
const showPicker = ref(false)

// Use billing period composable
const {
  validatePeriod,
  determineSeason,
  checkCrossSeason,
} = useBillingPeriod()

// Min/Max dates for picker
const minDate = computed(() => new Date(props.minDate))
const maxDate = computed(() => new Date(props.maxDate))

// Date arrays for pickers (format: [year, month, day])
const startDateArray = ref(
  props.startDate
    ? [
        new Date(props.startDate).getFullYear().toString(),
        String(new Date(props.startDate).getMonth() + 1).padStart(2, '0'),
        String(new Date(props.startDate).getDate()).padStart(2, '0')
      ]
    : [new Date().getFullYear().toString(), '01', '01']
)

const endDateArray = ref(
  props.endDate
    ? [
        new Date(props.endDate).getFullYear().toString(),
        String(new Date(props.endDate).getMonth() + 1).padStart(2, '0'),
        String(new Date(props.endDate).getDate()).padStart(2, '0')
      ]
    : [new Date().getFullYear().toString(), '01', '01']
)

// Computed end min date (should be after start date)
const computedEndMinDate = computed(() => {
  if (!startDateArray.value || startDateArray.value.length < 3) {
    return minDate.value
  }
  const [year, month, day] = startDateArray.value
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
})

// Display range format
const displayRange = computed(() => {
  if (!props.startDate || !props.endDate) return ''

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}`
  }

  return `${formatDate(props.startDate)} - ${formatDate(props.endDate)}`
})

// Computed: validation result
const validationResult = computed(() => {
  return validatePeriod(props.startDate, props.endDate)
})

// Computed: determined season
const determinedSeason = computed(() => {
  if (!props.startDate || !props.endDate || validationResult.value.error) {
    return null
  }
  return determineSeason(props.startDate, props.endDate)
})

// Computed: cross-season check
const isCrossSeason = computed(() => {
  if (!props.startDate || !props.endDate || validationResult.value.error) {
    return false
  }
  return checkCrossSeason(props.startDate, props.endDate)
})

// Watch props to update arrays
watch(() => props.startDate, (newVal) => {
  if (newVal) {
    const date = new Date(newVal)
    startDateArray.value = [
      date.getFullYear().toString(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ]
  }
})

watch(() => props.endDate, (newVal) => {
  if (newVal) {
    const date = new Date(newVal)
    endDateArray.value = [
      date.getFullYear().toString(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ]
  }
})

// Handle confirmation
const onConfirm = () => {
  const [startYear, startMonth, startDay] = startDateArray.value
  const [endYear, endMonth, endDay] = endDateArray.value

  const startDateStr = `${startYear}-${startMonth}-${startDay}`
  const endDateStr = `${endYear}-${endMonth}-${endDay}`

  emit('update:startDate', startDateStr)
  emit('update:endDate', endDateStr)
  showPicker.value = false
}

// Watch for validation changes and emit events
watch([() => props.startDate, () => props.endDate], () => {
  const result = validationResult.value

  // BUG FIX: Always emit validation result to clear errors when corrected
  // Previously only emitted when there was an error, leaving stale error state
  emit('validation-error', result)

  // Emit season changed if valid period
  const season = determinedSeason.value
  if (season) {
    emit('season-changed', season)
  }

  // Emit cross-season warning
  const crossSeason = isCrossSeason.value
  emit('cross-season-warning', crossSeason)
}, { immediate: true })
</script>

<style scoped>
.date-range-field {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.date-range-field :deep(.van-field__control) {
  color: #111827;
}

.date-range-field :deep(.van-field__control:disabled) {
  color: #6b7280;
}
</style>
