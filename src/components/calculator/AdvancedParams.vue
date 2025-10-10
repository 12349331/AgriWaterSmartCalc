<template>
  <div class="result-card mt-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">進階參數</h3>
      <button
        type="button"
        @click="emit('update:show', !show)"
        class="text-primary hover:text-blue-700"
      >
        {{ show ? "收合" : "展開" }}
      </button>
    </div>

    <div v-if="show" class="space-y-4">
      <!-- Pump Horsepower -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          抽水馬力 (HP)
        </label>
        <input
          v-model.number="localParams.horsepower"
          type="number"
          step="0.1"
          class="input-field w-full"
          placeholder="例如: 5.0"
        />
        <p class="text-gray-500 text-sm mt-1">預設值: 5.0 HP</p>
      </div>

      <!-- Pump Efficiency -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          抽水效率 (0-1.0)
        </label>
        <input
          v-model.number="localParams.efficiency"
          type="number"
          step="0.01"
          min="0"
          max="1"
          class="input-field w-full"
          :class="{ 'border-red-500': errors.efficiency }"
          placeholder="例如: 0.75"
        />
        <p v-if="errors.efficiency" class="text-red-500 text-sm mt-1">
          {{ errors.efficiency }}
        </p>
        <p class="text-gray-500 text-sm mt-1">
          預設值: 0.75 (75%)，範圍: 0.0-1.0
        </p>
      </div>

      <!-- Well Depth -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          水井深度 (公尺)
        </label>
        <input
          v-model.number="localParams.wellDepth"
          type="number"
          step="1"
          class="input-field w-full"
          :class="{ 'border-red-500': errors.wellDepth }"
          placeholder="例如: 20"
        />
        <p v-if="errors.wellDepth" class="text-red-500 text-sm mt-1">
          {{ errors.wellDepth }}
        </p>
        <p class="text-gray-500 text-sm mt-1">預設值: 20 公尺</p>
      </div>

      <!-- Reset Button -->
      <button
        type="button"
        @click="resetToDefaults"
        class="text-sm text-gray-600 hover:text-gray-800 underline"
      >
        重設為預設值
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useValidation } from "@/composables/useValidation";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      horsepower: 5.0,
      efficiency: 0.75,
      wellDepth: 20.0,
    }),
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "update:show", "reset"]);

const { validateField } = useValidation();

// Local params
const localParams = ref({ ...props.modelValue });

// Validation errors
const errors = ref({});

// Watch and validate
watch(
  () => localParams.value.efficiency,
  (value) => {
    errors.value.efficiency = validateField("pumpEfficiency", value);
  }
);

watch(
  () => localParams.value.wellDepth,
  (value) => {
    errors.value.wellDepth = validateField("wellDepth", value);
  }
);

// Emit updates
watch(
  localParams,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

function resetToDefaults() {
  localParams.value = {
    horsepower: 5.0,
    efficiency: 0.75,
    wellDepth: 20.0,
  };
  errors.value = {};
  emit("reset");
}
</script>
