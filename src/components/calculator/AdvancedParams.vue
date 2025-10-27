<template>
  <div class="result-card mt-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">
        進階參數
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
      class="space-y-6"
    >
      <!-- Pump Efficiency Slider -->
      <div class="govuk-form-group">
        <label
          id="efficiency-label"
          class="govuk-label"
        >
          抽水效率 <span class="text-danger">*</span>
        </label>
        <p class="govuk-hint">
          預設值: 0.45 (45%)，範圍: 0.0-1.0
        </p>
        <p
          v-if="errors.efficiency"
          id="efficiency-error"
          class="govuk-error-message"
        >
          {{ errors.efficiency }}
        </p>
        <p
          v-if="!errors.efficiency && warnings.efficiency"
          id="efficiency-warning"
          class="govuk-hint text-yellow-700"
        >
          ⚠️ {{ warnings.efficiency }}
        </p>
        <p
          v-if="efficiencyWarning"
          id="efficiency-input-warning"
          class="govuk-hint text-yellow-700"
        >
          ⚠️ {{ efficiencyWarning }}
        </p>

        <!-- Slider with percentage input -->
        <div class="flex items-center gap-4 mt-2">
          <van-slider
            :model-value="efficiency"
            :min="0"
            :max="1"
            :step="0.01"
            :disabled="disabled"
            :active-color="errors.efficiency ? '#d4351c' : '#1989fa'"
            :bar-height="6"
            :button-size="28"
            class="flex-1"
            aria-labelledby="efficiency-label"
            aria-required="true"
            :aria-invalid="errors.efficiency ? 'true' : 'false'"
            :aria-describedby="[
              errors.efficiency ? 'efficiency-error' : null,
              warnings.efficiency ? 'efficiency-warning' : null,
              efficiencyWarning ? 'efficiency-input-warning' : null
            ].filter(Boolean).join(' ') || undefined"
            data-testid="efficiency-slider"
            @update:model-value="emit('update:efficiency', $event)"
          />
          <div class="flex items-center gap-2 min-w-[6rem]">
            <input
              :value="Math.round(efficiency * 100)"
              type="number"
              min="0"
              max="100"
              step="1"
              :disabled="disabled"
              class="w-16 text-center text-xl font-semibold border border-gray-300 rounded px-2 py-1 bg-white"
              :class="{
                'border-red-500': errors.efficiency,
                'border-yellow-500': !errors.efficiency && (warnings.efficiency || efficiencyWarning)
              }"
              data-testid="efficiency-percentage-input"
              @input="handlePercentageInput"
            >
            <span class="text-xl font-semibold text-gray-700">%</span>
          </div>
        </div>
      </div>

      <!-- Parameter Explanations -->
      <dl class="space-y-4 pt-4 border-t">
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
            抽水機將電能轉換為水力能的效率，以小數表示（例如 0.45 代表 45% 效率）。效率越高，相同用電下可抽取更多水量。
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
  efficiency: {
    type: Number,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  warnings: {
    type: Object,
    default: () => ({}),
  },
  efficiencyWarning: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:show', 'update:efficiency'])

// Handle percentage input (convert from 0-100 to 0-1)
function handlePercentageInput(event) {
  const percentage = parseFloat(event.target.value)
  if (!isNaN(percentage)) {
    // Clamp between 0 and 100, then convert to 0-1 range
    const clampedPercentage = Math.max(0, Math.min(100, percentage))
    const efficiency = clampedPercentage / 100
    emit('update:efficiency', efficiency)
  }
}
</script>
