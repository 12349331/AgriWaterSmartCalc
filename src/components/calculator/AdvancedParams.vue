<template>
  <div class="result-card mt-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        參數說明
      </h3>
      <button
        type="button"
        class="text-primary hover:text-blue-700"
        :aria-expanded="show"
        @click="emit('update:show', !show)"
      >
        {{ show ? "收合" : "展開" }}
      </button>
    </div>

    <div
      v-if="show"
      class="space-y-4"
    >
      <dl class="space-y-4">
        <div>
          <dt class="font-semibold text-gray-800">
            抽水馬力 (HP)
          </dt>
          <dd class="text-gray-600 mt-1">
            馬達的動力輸出，單位為馬力 (HP)。較高的馬力可以產生更大的抽水量，適用於深井或大流量需求。
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-gray-800">
            抽水效率
          </dt>
          <dd class="text-gray-600 mt-1">
            抽水機將電能轉換為水力能的效率，以小數表示（例如 0.75 代表 75% 效率）。效率越高，相同用電下可抽取更多水量。
          </dd>
        </div>

        <div>
          <dt class="font-semibold text-gray-800">
            水井深度 (公尺)
          </dt>
          <dd class="text-gray-600 mt-1">
            地面到地下水位的垂直距離，以公尺為單位。深度影響抽水所需的動力和能源消耗。
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:show'])
</script>
