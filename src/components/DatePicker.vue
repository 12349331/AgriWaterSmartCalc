<script setup>
import { ref, computed, watch } from 'vue'
import { determineBillingSeason, isBoundaryDate } from '@/utils/billing-seasons'
import { isFutureDate, isWithinRange, MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'

const props = defineProps({
  modelValue: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
})

const emit = defineEmits(['update:modelValue', 'season-change'])

// Local state
const selectedDate = ref(props.modelValue)
const previousSeason = ref(null)

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

const maxDate = computed(() => getMaxAllowedDate())

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
const handleDateChange = (event) => {
  const newDate = event.target.value
  
  if (!newDate) {
    return
  }
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return
  }
  
  selectedDate.value = newDate
  emit('update:modelValue', newDate)
}

const getBoundaryInfo = () => {
  if (!selectedDate.value) return ''
  
  const month = new Date(selectedDate.value).getMonth() + 1
  const day = new Date(selectedDate.value).getDate()
  
  if (month === 6 && day === 1) return '夏月開始'
  if (month === 9 && day === 30) return '夏月結束'
  if (month === 10 && day === 1) return '非夏月開始'
  if (month === 5 && day === 31) return '非夏月結束'
  
  return ''
}
</script>

<template>
  <div
    class="space-y-2"
    data-testid="date-picker-container"
  >
    <!-- Date Input with Label -->
    <div class="flex flex-col">
      <label 
        id="billing-date-label"
        for="billing-date-input"
        class="text-sm font-medium text-gray-700 mb-1"
      >
        用電日期
      </label>
      
      <div class="relative">
        <input
          id="billing-date-input"
          type="date"
          :value="selectedDate"
          :min="MIN_ALLOWED_DATE"
          :max="maxDate"
          aria-labelledby="billing-date-label"
          :aria-describedby="isFuture ? 'future-date-warning' : undefined"
          data-testid="billing-date-input"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @change="handleDateChange"
        >
        
        <!-- Boundary Date Indicator -->
        <div
          v-if="isBoundary"
          data-testid="boundary-indicator"
          class="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <div class="relative group">
            <svg 
              class="w-5 h-5 text-amber-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fill-rule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clip-rule="evenodd"
              />
            </svg>
            
            <!-- Tooltip -->
            <div
              data-testid="boundary-tooltip"
              class="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            >
              <div class="font-semibold">
                計價季節轉換日
              </div>
              <div class="mt-1">
                {{ getBoundaryInfo() }}
              </div>
              <div class="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>

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
