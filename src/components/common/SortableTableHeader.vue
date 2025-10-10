<template>
  <th
    class="px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer select-none"
    :class="{ 'bg-gray-100': currentSortKey === sortKey }"
    @click="handleClick"
    :title="tooltip"
  >
    <div class="flex items-center justify-between">
      <span>{{ label }}</span>
      <span v-if="currentSortKey === sortKey" class="ml-2">
        <svg
          v-if="currentSortDirection === 'asc'"
          class="h-4 w-4 text-gray-600 inline"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          ></path>
        </svg>
        <svg
          v-else
          class="h-4 w-4 text-gray-600 inline"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          ></path>
        </svg>
      </span>
    </div>
  </th>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  sortKey: {
    type: String,
    required: true,
  },
  currentSortKey: {
    type: String,
    default: '',
  },
  currentSortDirection: {
    type: String,
    default: 'desc', // 'asc' or 'desc'
  },
  tooltip: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['sort']);

const handleClick = () => {
  let newDirection = 'desc'; // Default for a new sort key
  if (props.currentSortKey === props.sortKey) {
    // Toggle direction if the same key is clicked
    newDirection = props.currentSortDirection === 'asc' ? 'desc' : 'asc';
  }
  emit('sort', props.sortKey, newDirection);
};
</script>

<style scoped>
/* No specific styles needed if using Tailwind classes directly */
</style>