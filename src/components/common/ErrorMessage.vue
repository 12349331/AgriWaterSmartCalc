<template>
  <div
    v-if="message"
    class="message-container"
    :class="typeClass"
    role="alert"
  >
    <div class="flex items-start">
      <div class="flex-1">
        <p class="font-medium">
          {{ message }}
        </p>
      </div>
      <button
        v-if="dismissible"
        class="ml-4 flex-shrink-0"
        aria-label="關閉訊息"
        @click="handleDismiss"
      >
        <svg
          class="h-5 w-5"
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
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) =>
      ['error', 'warning', 'info', 'success'].includes(value),
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
  autoDismiss: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['dismiss'])

const typeClass = computed(() => {
  const classes = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }
  return classes[props.type]
})

function handleDismiss() {
  emit('dismiss')
}

onMounted(() => {
  if (props.autoDismiss) {
    setTimeout(() => {
      handleDismiss()
    }, 3000)
  }
})
</script>

<style scoped>
.message-container {
  @apply p-4 mb-4 border rounded-lg;
}
</style>
