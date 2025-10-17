<template>
  <div class="result-card">
    <div class="tabs-wrapper">
      <nav
        class="tabs-nav"
        aria-label="Tabs"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'tab-button',
          ]"
          @click="emit('update:activeTab', tab.id)"
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
defineProps({
  activeTab: {
    type: String,
    default: 'annual',  // User Story 004: Changed default from "seasonal" to "annual"
  },
})

const emit = defineEmits(['update:activeTab'])

// User Story 004: Reordered tabs - Annual first, Seasonal second
const tabs = [
  { id: 'annual', name: '年度趨勢' },
  { id: 'seasonal', name: '季節性趨勢' },
  { id: 'crop', name: '作物比較' },
  { id: 'stats', name: '統計摘要' },
]
</script>

<style scoped>
.result-card {
  overflow: hidden;
}

.tabs-wrapper {
  border-b: 1px solid rgb(229, 231, 235);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.tabs-nav {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  min-width: min-content;
}

.tab-button {
  white-space: nowrap;
  padding: 1rem 0.5rem;
  border-bottom: 2px solid;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.tab-content {
  overflow: auto;
  width: 100%;
}

/* 响应式調整 */
@media (min-width: 640px) {
  .tabs-nav {
    gap: 1rem;
  }

  .tab-button {
    padding: 1rem 0.75rem;
  }
}

@media (min-width: 1024px) {
  .tabs-nav {
    gap: 2rem;
  }

  .tab-button {
    padding: 1rem 1rem;
    font-size: 1rem;
  }
}

/* 超小屏幕（< 360px） */
@media (max-width: 359px) {
  .tab-button {
    padding: 0.75rem 0.375rem;
    font-size: 0.75rem;
  }

  .tabs-nav {
    gap: 0.25rem;
  }
}
</style>
