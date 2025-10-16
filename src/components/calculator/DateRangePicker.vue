<template>
  <div
    data-testid="date-range-container"
    class="date-range-picker"
  >
    <!-- Date Range Inputs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Start Date -->
      <div>
        <label
          for="start-date"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          電費計費起始日 <span class="text-red-500">*</span>
        </label>
        <DateScrollPicker
          :model-value="startDate"
          :min-date="minDate"
          :max-date="maxDate"
          :disabled="disabled"
          :label="i18n.billingPeriod.startDate"
          @update:model-value="handleStartDateChange"
        />
      </div>

      <!-- End Date -->
      <div>
        <label
          for="end-date"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          電費計費結束日 <span class="text-red-500">*</span>
        </label>
        <DateScrollPicker
          :model-value="endDate"
          :min-date="minDate"
          :max-date="maxDate"
          :disabled="disabled"
          :label="i18n.billingPeriod.endDate"
          @update:model-value="handleEndDateChange"
        />
      </div>
    </div>

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
      <span>此計費期間橫跨夏月與非夏月邊界，系統已自動判定為「{{ determinedSeason }}」（以天數較多者為準）。</span>
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
import { computed, watch } from 'vue'
import { useBillingPeriod } from '@/composables/useBillingPeriod'
import { MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'
import DateScrollPicker from '@/components/calculator/DateScrollPicker.vue'

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

// Use billing period composable
const {
  validatePeriod,
  determineSeason,
  checkCrossSeason,
} = useBillingPeriod()

// i18n (inline for now, will integrate with i18n store later)
const i18n = {
  billingPeriod: {
    startDate: '電費計費起始日',
    endDate: '電費計費結束日',
  },
}

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

// Computed: has error
const hasError = computed(() => {
  return !!validationResult.value.error
})

// Event handlers
function handleStartDateChange(newValue) {
  emit('update:startDate', newValue)
}

function handleEndDateChange(newValue) {
  emit('update:endDate', newValue)
}

// Watch for validation changes and emit events
watch([() => props.startDate, () => props.endDate], () => {
  const result = validationResult.value

  // Always emit validation result (even if no error/warning)
  if (result.error || result.warning) {
    emit('validation-error', result)
  }

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
@reference "../../assets/styles/main.css";

.date-range-picker {
  @apply space-y-2;
}

.input-field {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm;
  @apply focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
}
</style>
