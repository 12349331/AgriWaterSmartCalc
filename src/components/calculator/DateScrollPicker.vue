<template>
  <div class="date-scroll-picker">
    <!-- Desktop: Native date input -->
    <input
      v-if="!isMobile"
      type="date"
      :value="modelValue"
      :min="minDate"
      :max="maxDate"
      :disabled="disabled"
      :aria-label="label"
      class="govuk-input w-full"
      @input="handleNativeInput"
    >

    <!-- Mobile: Simple date selector (using native for now, can be enhanced with scroll picker later) -->
    <input
      v-else
      type="date"
      :value="modelValue"
      :min="minDate"
      :max="maxDate"
      :disabled="disabled"
      :aria-label="label"
      class="govuk-input w-full"
      @input="handleNativeInput"
    >
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String, // YYYY-MM-DD format
    required: true,
  },
  minDate: {
    type: String,
    default: '1900-01-01'
  },
  maxDate: {
    type: String,
    default: '2100-12-31'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: '選擇日期'
  },
})

const emit = defineEmits(['update:modelValue'])

// Mobile detection
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
})

// Helpers
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function validateAndAdjustDate(dateString) {
  if (!dateString) return dateString

  const parts = dateString.split('-')
  if (parts.length !== 3) return dateString

  let year = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10)
  let day = parseInt(parts[2], 10)

  // Auto-adjust invalid dates
  const maxDay = getDaysInMonth(year, month)
  if (day > maxDay) {
    day = maxDay
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function handleNativeInput(event) {
  const inputValue = event.target.value
  const adjustedValue = validateAndAdjustDate(inputValue)

  // If date was adjusted, update input value
  if (adjustedValue !== inputValue) {
    event.target.value = adjustedValue
  }

  emit('update:modelValue', adjustedValue)
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  const adjusted = validateAndAdjustDate(newVal)
  if (adjusted !== newVal) {
    emit('update:modelValue', adjusted)
  }
})
</script>

<style scoped>
.date-scroll-picker {
  width: 100%;
}
</style>
