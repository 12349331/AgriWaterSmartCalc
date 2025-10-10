<template>
  <div class="result-card">
    <h2 class="text-xl font-semibold mb-4">水資源估算</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Bill Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          電費金額 (TWD) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="formData.billAmount"
          type="number"
          step="0.01"
          class="input-field w-full"
          :class="{ 'border-red-500': errors.billAmount }"
          placeholder="請輸入電費金額"
          :disabled="disabled"
          data-testid="usage-input"
        />
        <p v-if="errors.billAmount" class="text-red-500 text-sm mt-1">
          {{ errors.billAmount }}
        </p>
      </div>

      <!-- User Story P1: Billing Period Selection (replaces single date picker) -->
      <div data-testid="billing-period-section" role="group" aria-labelledby="billing-period-label">
        <DateRangePicker
          v-model:start-date="billingPeriodStart"
          v-model:end-date="billingPeriodEnd"
          :disabled="disabled"
          @season-changed="handleSeasonChanged"
          @cross-season-warning="handleCrossSeasonWarning"
          @validation-error="handleValidationError"
        />

        <!-- Billing Season Badge (readonly, auto-determined) -->
        <div
          v-if="billingPeriodStart && billingPeriodEnd && !periodValidationError"
          class="mt-2 flex items-center gap-2"
        >
          <span class="text-sm font-medium text-gray-700">計價季節：</span>
          <span
            data-testid="billing-season-badge"
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              determinedSeason === '夏月'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-blue-100 text-blue-800'
            ]"
          >
            {{ determinedSeason }}
          </span>
          <span class="text-xs text-gray-500">(自動判定)</span>
        </div>

        <!-- Screen reader live region for season changes -->
        <div aria-live="polite" class="sr-only">
          當前計價季節：{{ determinedSeason }}
        </div>
      </div>

      <!-- Electricity Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          用電種類
        </label>
        <select
          v-model="formData.electricityType"
          class="input-field w-full"
          :disabled="disabled"
        >
          <option value="表燈非營業用">表燈非營業用</option>
          <option value="表燈營業用">表燈營業用</option>
        </select>
      </div>

      <!-- Billing Season - REMOVED (now auto-determined by DateRangePicker) -->
      <!-- User Story P1: Season is auto-determined from billing period, no manual selection -->

      <!-- Crop Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          作物類型 <span class="text-red-500">*</span>
        </label>
        <select
          v-model="formData.cropType"
          class="input-field w-full"
          :class="{ 'border-red-500': errors.cropType }"
          :disabled="disabled"
        >
          <option value="">請選擇作物</option>
          <option v-for="crop in cropTypes" :key="crop.id" :value="crop.name">
            {{ crop.name }} - {{ crop.description }}
          </option>
        </select>
        <p v-if="errors.cropType" class="text-red-500 text-sm mt-1">
          {{ errors.cropType }}
        </p>
      </div>

      <!-- Field Area -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          耕作面積 (分地) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="formData.fieldArea"
          type="number"
          step="0.1"
          class="input-field w-full"
          :class="{ 'border-red-500': errors.fieldArea }"
          placeholder="請輸入耕作面積"
          :disabled="disabled"
        />
        <p v-if="errors.fieldArea" class="text-red-500 text-sm mt-1">
          {{ errors.fieldArea }}
        </p>
        <p class="text-gray-500 text-sm mt-1">
          1 分地 ≈ 0.0969 公頃 ≈ 969 平方公尺
        </p>
      </div>

      <!-- Region -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          地區
        </label>
        <div class="flex space-x-4">
          <label class="flex items-center">
            <input
              v-model="formData.region"
              type="radio"
              value="north"
              class="mr-2"
              :disabled="disabled"
            />
            北部
          </label>
          <label class="flex items-center">
            <input
              v-model="formData.region"
              type="radio"
              value="central"
              class="mr-2"
              :disabled="disabled"
            />
            中部
          </label>
          <label class="flex items-center">
            <input
              v-model="formData.region"
              type="radio"
              value="south"
              class="mr-2"
              :disabled="disabled"
            />
            南部
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 pt-4">
        <button
          type="submit"
          data-testid="submit-button"
          class="btn-primary flex-1"
          :disabled="disabled || hasErrors"
        >
          計算用水量
        </button>
        <button
          type="button"
          @click="handleReset"
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          :disabled="disabled"
        >
          重設
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useConfigStore } from "@/stores/config";
import { useValidation } from "@/composables/useValidation";
import DateRangePicker from "@/components/calculator/DateRangePicker.vue";
import { useBillingPeriod } from "@/composables/useBillingPeriod";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "submit", "reset"]);

const configStore = useConfigStore();
const { validateField } = useValidation();

// User Story P1: Billing period management (replaces single date)
const {
  validatePeriod,
  determineSeason,
  checkCrossSeason
} = useBillingPeriod();

// Billing period state
const billingPeriodStart = ref(null);
const billingPeriodEnd = ref(null);
const determinedSeason = ref(null);
const periodValidationError = ref(null);
const hasCrossSeasonWarning = ref(false);

// Local form data
const formData = ref({
  billAmount: 0,
  electricityType: "表燈非營業用",
  billingSeason: "夏月", // Will be overridden by auto-determination
  cropType: "",
  fieldArea: 0,
  region: "south",
  ...props.modelValue,
});

// Validation errors
const errors = ref({});

// Event handlers for DateRangePicker
function handleSeasonChanged(season) {
  determinedSeason.value = season;
  formData.value.billingSeason = season;
}

function handleCrossSeasonWarning(isCross) {
  hasCrossSeasonWarning.value = isCross;
}

function handleValidationError(result) {
  if (result.error) {
    periodValidationError.value = result.error;
  } else {
    periodValidationError.value = null;
  }
}

// Crop types from config
const cropTypes = computed(() => configStore.cropTypes);

// Check if form has errors
const hasErrors = computed(() => {
  // Check field validation errors
  const fieldErrors = Object.keys(errors.value).some((key) => errors.value[key] !== null);

  // Check billing period validation error
  const periodError = !!periodValidationError.value;

  return fieldErrors || periodError;
});

// Watch form data and validate
watch(
  () => formData.value.billAmount,
  (value) => {
    errors.value.billAmount = validateField("billAmount", value);
  }
);

watch(
  () => formData.value.fieldArea,
  (value) => {
    errors.value.fieldArea = validateField("fieldArea", value);
  }
);

watch(
  () => formData.value.cropType,
  (value) => {
    errors.value.cropType = validateField("cropType", value);
  }
);

// Emit updates
watch(
  formData,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

function handleSubmit() {
  // User Story P1: Validate billing period first
  const periodValidation = validatePeriod(billingPeriodStart.value, billingPeriodEnd.value);

  if (!periodValidation.valid) {
    periodValidationError.value = periodValidation.error;
    return;
  }

  // Validate all fields
  errors.value = {
    billAmount: validateField("billAmount", formData.value.billAmount),
    fieldArea: validateField("fieldArea", formData.value.fieldArea),
    cropType: validateField("cropType", formData.value.cropType),
  };

  // Check for errors
  if (hasErrors.value) {
    return;
  }

  // User Story P1: Include billing period in submission
  const submissionData = {
    ...formData.value,
    billingPeriodStart: billingPeriodStart.value,
    billingPeriodEnd: billingPeriodEnd.value,
    billingSeason: determinedSeason.value,
  };

  emit("submit", submissionData);
}

function handleReset() {
  formData.value = {
    billAmount: 0,
    electricityType: "表燈非營業用",
    billingSeason: "夏月",
    cropType: "",
    fieldArea: 0,
    region: "south",
  };
  errors.value = {};

  // User Story P1: Reset billing period
  billingPeriodStart.value = null;
  billingPeriodEnd.value = null;
  determinedSeason.value = null;
  periodValidationError.value = null;
  hasCrossSeasonWarning.value = false;

  emit("reset");
}
</script>
