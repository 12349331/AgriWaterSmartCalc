<template>
  <div class="result-card">
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="emit('update:activeTab', tab.id)"
          :class="[
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <div class="tab-content">
      <slot :name="activeTab" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activeTab: {
    type: String,
    default: "seasonal",
  },
});

const emit = defineEmits(["update:activeTab"]);

const tabs = [
  { id: "seasonal", name: "季節性趨勢" },
  { id: "crop", name: "作物比較" },
  { id: "annual", name: "年度趨勢" },
  { id: "stats", name: "統計摘要" },
];
</script>
