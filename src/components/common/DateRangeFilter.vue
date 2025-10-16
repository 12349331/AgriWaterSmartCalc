<template>
  <div class="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
    <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
      <div class="flex-1 w-full">
        <label
          for="start-date"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >開始日期</label>
        <input
          id="start-date"
          type="date"
          :value="modelStartDate"
          data-test="start-date-input"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-aqua-500 focus:border-aqua-500"
          @input="updateStartDate($event.target.value)"
        >
      </div>
      <div class="flex-1 w-full">
        <label
          for="end-date"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >結束日期</label>
        <input
          id="end-date"
          type="date"
          :value="modelEndDate"
          data-test="end-date-input"
          class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-aqua-500 focus:border-aqua-500"
          @input="updateEndDate($event.target.value)"
        >
      </div>
    </div>

    <div class="flex items-center space-x-4">
      <button
        data-test="apply-filter-button"
        class="px-4 py-2 bg-aqua-600 text-white rounded-md hover:bg-aqua-700 focus:outline-hidden focus:ring-2 focus:ring-aqua-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        @click="emitApply"
      >
        套用篩選
      </button>
      <button
        data-test="clear-filter-button"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        @click="emitClear"
      >
        清除篩選
      </button>
    </div>

    <div
      v-if="isFilterActive"
      class="mt-4 text-sm text-gray-600 dark:text-gray-400"
    >
      目前篩選: <span class="font-medium">{{ displayFilterRange }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
})

const emit = defineEmits(['update:startDate', 'update:endDate', 'apply', 'clear'])

const modelStartDate = computed(() => props.startDate)
const modelEndDate = computed(() => props.endDate)

const updateStartDate = (value) => {
  emit('update:startDate', value)
}

const updateEndDate = (value) => {
  emit('update:endDate', value)
}

const emitApply = () => {
  emit('apply')
}

const emitClear = () => {
  emit('clear')
}

const isFilterActive = computed(() => {
  return !!props.startDate || !!props.endDate
})

const displayFilterRange = computed(() => {
  const start = props.startDate || '最早'
  const end = props.endDate || '最晚'
  return `${start} ~ ${end}`
})
</script>
