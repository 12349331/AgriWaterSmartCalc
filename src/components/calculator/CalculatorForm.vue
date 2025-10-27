<template>
  <div class="result-card">
    <h2 class="govuk-heading-l">
      水資源估算
    </h2>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Bill Amount -->
      <div class="govuk-form-group">
        <label
          for="usage-input"
          class="govuk-label"
        >
          電費金額 (TWD) <span class="text-danger">*</span>
        </label>
        <p class="govuk-hint">
          請輸入您的電費帳單金額（新台幣）
        </p>
        <p
          v-if="errors.billAmount"
          id="bill-amount-error"
          class="govuk-error-message"
        >
          {{ errors.billAmount }}
        </p>
        <input
          id="usage-input"
          v-model.number="formData.billAmount"
          type="number"
          step="0.01"
          class="input-field w-full"
          :class="{ 'border-danger': errors.billAmount }"
          placeholder="請輸入電費金額"
          :disabled="disabled"
          :aria-describedby="errors.billAmount ? 'bill-amount-error' : undefined"
          data-testid="usage-input"
        >
      </div>

      <!-- User Story P1: Billing Period Selection (replaces single date picker) -->
      <div
        data-testid="billing-period-section"
        role="group"
        aria-labelledby="billing-period-label"
      >
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
          <span class="text-sm font-medium text-gray-700">主要季節：</span>
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
          <span class="text-xs text-gray-500">(混合計算,以天數較多者標示)</span>
        </div>

        <!-- Screen reader live region for season changes -->
        <div
          aria-live="polite"
          class="sr-only"
        >
          主要季節：{{ determinedSeason }}（系統將按天數比例混合計算夏月與非夏月費率）
        </div>
      </div>

      <!-- Electricity Type (User Story 1: Updated) -->
      <div class="govuk-form-group">
        <label
          for="electricity-type"
          class="govuk-label"
        >
          電價種類 <span class="text-danger">*</span>
        </label>
        <p class="govuk-hint">
          請選擇您的電價類型(依台電分類)
        </p>
        <select
          id="electricity-type"
          v-model="formData.electricityType"
          class="input-field w-full"
          :disabled="disabled"
          @change="handleElectricityTypeChange"
        >
          <option value="非營業用">
            非營業用
          </option>
          <option value="營業用">
            營業用
          </option>
          <option value="住宅用">
            住宅用
          </option>
        </select>
      </div>

      <!-- Time Pricing Category (User Story 2) -->
      <div class="govuk-form-group">
        <label
          for="time-pricing-category"
          class="govuk-label"
        >
          時間種類 <span class="text-danger">*</span>
        </label>
        <select
          id="time-pricing-category"
          v-model="formData.timePricingCategory"
          class="input-field w-full"
          :disabled="disabled"
        >
          <option value="非時間電價">
            非時間電價
          </option>
          <option
            value="契約內容電價"
            disabled
            :title="'此功能開發中'"
          >
            契約內容電價(暫未開發)
          </option>
        </select>
        <p
          v-if="formData.timePricingCategory === '契約內容電價'"
          class="govuk-hint text-yellow-700"
        >
          此功能開發中
        </p>
      </div>

      <!-- Billing Season - REMOVED (now auto-determined by DateRangePicker) -->
      <!-- User Story P1: Season is auto-determined from billing period, no manual selection -->

      <!-- Crop Type -->
      <div class="govuk-form-group">
        <label
          for="crop-type"
          class="govuk-label"
        >
          作物類型 <span class="text-danger">*</span>
        </label>
        <p
          v-if="errors.cropType"
          id="crop-type-error"
          class="govuk-error-message"
        >
          {{ errors.cropType }}
        </p>
        <select
          id="crop-type"
          v-model="formData.cropType"
          class="input-field w-full"
          :class="{ 'border-danger': errors.cropType }"
          :disabled="disabled"
          :aria-describedby="errors.cropType ? 'crop-type-error' : undefined"
        >
          <option value="">
            請選擇作物
          </option>
          <option
            v-for="crop in cropTypes"
            :key="crop.id"
            :value="crop.name"
          >
            {{ crop.name }} - {{ crop.description }}
          </option>
        </select>
      </div>

      <!-- Field Area -->
      <div class="govuk-form-group">
        <label
          for="field-area"
          class="govuk-label"
        >
          耕作面積 (分地) <span class="text-danger">*</span>
        </label>
        <p
          id="field-area-hint"
          class="govuk-hint"
        >
          1 分地 ≈ 0.0969 公頃 ≈ 969 平方公尺
        </p>
        <p
          v-if="errors.fieldArea"
          id="field-area-error"
          class="govuk-error-message"
        >
          {{ errors.fieldArea }}
        </p>
        <input
          id="field-area"
          v-model.number="formData.fieldArea"
          type="number"
          step="0.1"
          class="input-field w-full"
          :class="{ 'border-danger': errors.fieldArea }"
          placeholder="請輸入耕作面積"
          :disabled="disabled"
          :aria-describedby="errors.fieldArea ? 'field-area-error field-area-hint' : 'field-area-hint'"
        >
      </div>

      <!-- Region
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
      </div> -->

      <!-- User Story 004: Pump Parameters Section (moved from AdvancedParams) -->
      <div class="govuk-form-group mt-6 border-t pt-6">
        <h3 class="govuk-heading-m">
          抽水設備參數
        </h3>

        <!-- Horsepower -->
        <div class="govuk-form-group">
          <label
            for="horsepower"
            class="govuk-label"
          >
            抽水馬力 (HP) <span class="text-danger">*</span>
          </label>
          <p class="govuk-hint">
            預設值: 5.0 HP
          </p>
          <p
            v-if="errors.horsepower"
            id="horsepower-error"
            class="govuk-error-message"
          >
            {{ errors.horsepower }}
          </p>
          <input
            id="horsepower"
            v-model.number="localPumpParams.horsepower"
            type="number"
            step="0.1"
            min="1.0"
            max="50.0"
            required
            class="input-field w-full"
            :class="{ 'border-danger': errors.horsepower }"
            :disabled="disabled"
            aria-required="true"
            :aria-describedby="errors.horsepower ? 'horsepower-error' : undefined"
            data-testid="horsepower-input"
          >
        </div>

        <!-- Well Depth -->
        <div class="govuk-form-group">
          <label
            for="wellDepth"
            class="govuk-label"
          >
            水井深度 (公尺) <span class="text-danger">*</span>
          </label>
          <p class="govuk-hint">
            預設值: 30 公尺
          </p>
          <p
            v-if="errors.wellDepth"
            id="wellDepth-error"
            class="govuk-error-message"
          >
            {{ errors.wellDepth }}
          </p>
          <p
            v-if="!errors.wellDepth && warnings.wellDepth"
            id="wellDepth-warning"
            class="govuk-hint text-yellow-700"
          >
            ⚠️ {{ warnings.wellDepth }}
          </p>
          <input
            id="wellDepth"
            v-model.number="localPumpParams.wellDepth"
            type="number"
            step="1"
            min="0"
            required
            class="input-field w-full"
            :class="{
              'border-danger': errors.wellDepth,
              'border-yellow-500': !errors.wellDepth && warnings.wellDepth
            }"
            :disabled="disabled"
            aria-required="true"
            :aria-invalid="errors.wellDepth ? 'true' : 'false'"
            :aria-describedby="[
              errors.wellDepth ? 'wellDepth-error' : null,
              warnings.wellDepth ? 'wellDepth-warning' : null
            ].filter(Boolean).join(' ') || undefined"
            data-testid="wellDepth-input"
          >
        </div>
      </div>

      <!-- Advanced Parameters Section -->
      <AdvancedParams
        v-model:show="showAdvancedParams"
        v-model:efficiency="localPumpParams.efficiency"
        :errors="errors"
        :warnings="warnings"
        :efficiency-warning="efficiencyWarning"
        :disabled="disabled"
        @keydown="handleEfficiencyKeydown"
        @paste="handleEfficiencyPaste"
        @blur="handleEfficiencyBlur"
      />

      <!-- Dirty State Notification (User Story 1) -->
      <div
        v-if="showDirtyNotification"
        class="govuk-notification-banner"
        role="alert"
        aria-labelledby="dirty-state-heading"
      >
        <div class="govuk-notification-banner__header">
          <h2
            id="dirty-state-heading"
            class="govuk-notification-banner__title"
          >
            參數已變更
          </h2>
        </div>
        <div class="govuk-notification-banner__content">
          <p class="govuk-body">
            您已修改表單參數,點擊「重新計算」以更新結果。
          </p>
        </div>
      </div>

      <!-- T029: ARIA Live Region for Validation Announcements -->
      <div
        aria-live="assertive"
        aria-atomic="true"
        class="sr-only"
        role="status"
      >
        <span v-if="validationAnnouncement">{{ validationAnnouncement }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 pt-4">
        <!-- Recalculate Button (User Story 1: shown when dirty) -->
        <button
          v-if="showRecalculateButton"
          type="button"
          data-testid="recalculate-button"
          class="btn-primary flex-1"
          :disabled="disabled || hasErrors"
          @click="handleRecalculate"
        >
          重新計算
        </button>

        <!-- Regular Calculate Button -->
        <button
          v-else
          type="submit"
          data-testid="submit-button"
          class="btn-primary flex-1"
          :disabled="disabled || hasErrors"
        >
          計算用水量
        </button>

        <button
          type="button"
          class="btn-secondary"
          :disabled="disabled"
          @click="handleReset"
        >
          重設
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useCalculationStore } from '@/stores/calculation' // NEW: For dirty state tracking
import { useValidation } from '@/composables/useValidation'
import { useNumericInput } from '@/composables/useNumericInput' // NEW: User Story 4
import DateRangePicker from '@/components/calculator/DateRangePicker.vue'
import AdvancedParams from '@/components/calculator/AdvancedParams.vue'
import { useBillingPeriod } from '@/composables/useBillingPeriod'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  pumpParams: {
    type: Object,
    default: () => ({
      horsepower: 5.0,
      efficiency: 0.75,
      wellDepth: 30.0,
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'update:pumpParams', 'submit', 'reset'])

const configStore = useConfigStore()
const calculationStore = useCalculationStore() // NEW: For dirty state tracking
const { validateField } = useValidation()

// User Story 4: Numeric input handling for pump efficiency
const {
  warning: efficiencyWarning,
  handleKeydown: handleEfficiencyKeydown,
  handlePaste: handleEfficiencyPaste,
  handleBlur: handleEfficiencyBlur,
  clearWarning: clearEfficiencyWarning,
} = useNumericInput({
  min: 0.0,
  max: 1.0,
  step: 0.01,
  decimals: 2,
})

// User Story P1: Billing period management (replaces single date)
const {
  validatePeriod,
} = useBillingPeriod()

// Billing period state
const billingPeriodStart = ref(null)
const billingPeriodEnd = ref(null)
const determinedSeason = ref(null)
const periodValidationError = ref(null)
const hasCrossSeasonWarning = ref(false)

// User Story 004: Pump parameters state
const localPumpParams = ref({ ...props.pumpParams })

// Local form data
const formData = ref({
  billAmount: 0,
  electricityType: '非營業用', // UPDATED: New default
  timePricingCategory: '非時間電價', // NEW: User Story 2
  billingSeason: '夏月', // Will be overridden by auto-determination
  cropType: '',
  fieldArea: 0,
  region: 'south',
  ...props.modelValue,
})

// Validation errors and warnings
const errors = ref({
  horsepower: null,
  efficiency: null,
  wellDepth: null,
})

const warnings = ref({
  efficiency: null,
  wellDepth: null,
})

// Track if form has been submitted at least once
const hasBeenSubmitted = ref(false)

// Track advanced parameters visibility
const showAdvancedParams = ref(false)

// Event handlers for DateRangePicker
function handleSeasonChanged(season) {
  determinedSeason.value = season
  formData.value.billingSeason = season
}

function handleCrossSeasonWarning(isCross) {
  hasCrossSeasonWarning.value = isCross
}

function handleValidationError(result) {
  if (result.error) {
    periodValidationError.value = result.error
  } else {
    periodValidationError.value = null
  }
}

// Crop types from config
const cropTypes = computed(() => configStore.cropTypes)

// Check if form has errors
const hasErrors = computed(() => {
  // Check field validation errors
  const fieldErrors = Object.keys(errors.value).some((key) => errors.value[key] !== null)

  // Check billing period validation error
  const periodError = !!periodValidationError.value

  return fieldErrors || periodError
})

// NEW: Dirty state computed properties (User Story 1)
const showDirtyNotification = computed(() => {
  return calculationStore.needsRecalculation
})

const showRecalculateButton = computed(() => {
  return calculationStore.needsRecalculation
})

// T029: Validation announcement for screen readers
const validationAnnouncement = computed(() => {
  const messages = []

  // Collect all error messages
  Object.entries(errors.value).forEach(([field, error]) => {
    if (error) {
      const fieldLabel = {
        billAmount: '電費金額',
        fieldArea: '耕作面積',
        cropType: '作物類型',
        horsepower: '抽水馬力',
        efficiency: '抽水效率',
        wellDepth: '水井深度',
      }[field] || field

      messages.push(`${fieldLabel}: ${error}`)
    }
  })

  // Collect warning messages
  Object.entries(warnings.value).forEach(([field, warning]) => {
    if (warning) {
      const fieldLabel = {
        efficiency: '抽水效率',
        wellDepth: '水井深度',
      }[field] || field

      messages.push(`${fieldLabel}警告: ${warning}`)
    }
  })

  // Period validation error
  if (periodValidationError.value) {
    messages.push(`計費期間: ${periodValidationError.value}`)
  }

  return messages.length > 0 ? `表單驗證: ${messages.join('; ')}` : ''
})

// T032: LocalStorage persistence for form draft (24-hour expiry)
const FORM_DRAFT_KEY = 'aquametrics_form_draft'
const FORM_DRAFT_EXPIRY_KEY = 'aquametrics_form_draft_expiry'
const DRAFT_EXPIRY_HOURS = 24

// Save form draft to localStorage
function saveFormDraft() {
  const draft = {
    formData: formData.value,
    pumpParams: localPumpParams.value,
    billingPeriodStart: billingPeriodStart.value,
    billingPeriodEnd: billingPeriodEnd.value,
  }

  const expiryTime = Date.now() + (DRAFT_EXPIRY_HOURS * 60 * 60 * 1000)

  try {
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(draft))
    localStorage.setItem(FORM_DRAFT_EXPIRY_KEY, expiryTime.toString())
  } catch (error) {
    logger.warn('Failed to save form draft to localStorage:', error)
  }
}

// Restore form draft from localStorage
function restoreFormDraft() {
  try {
    const expiryTime = localStorage.getItem(FORM_DRAFT_EXPIRY_KEY)

    // Check if draft has expired
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      localStorage.removeItem(FORM_DRAFT_KEY)
      localStorage.removeItem(FORM_DRAFT_EXPIRY_KEY)
      return false
    }

    const draftString = localStorage.getItem(FORM_DRAFT_KEY)
    if (!draftString) return false

    const draft = JSON.parse(draftString)

    // Restore form data (but don't overwrite if user already started typing)
    if (draft.formData && formData.value.billAmount === 0 && !formData.value.cropType) {
      formData.value = { ...formData.value, ...draft.formData }
    }

    // Restore pump params
    if (draft.pumpParams) {
      localPumpParams.value = { ...localPumpParams.value, ...draft.pumpParams }
    }

    // Restore billing period
    if (draft.billingPeriodStart) {
      billingPeriodStart.value = draft.billingPeriodStart
    }
    if (draft.billingPeriodEnd) {
      billingPeriodEnd.value = draft.billingPeriodEnd
    }

    return true
  } catch (error) {
    logger.warn('Failed to restore form draft from localStorage:', error)
    return false
  }
}

// Clear form draft from localStorage
function clearFormDraft() {
  try {
    localStorage.removeItem(FORM_DRAFT_KEY)
    localStorage.removeItem(FORM_DRAFT_EXPIRY_KEY)
  } catch (error) {
    logger.warn('Failed to clear form draft from localStorage:', error)
  }
}

// Restore draft on component mount
restoreFormDraft()

// Watch form data and validate
watch(
  () => formData.value.billAmount,
  (value) => {
    const result = validateField('billAmount', value)
    if (typeof result === 'object') {
      errors.value.billAmount = result.error
    } else {
      errors.value.billAmount = result
    }
  },
)

watch(
  () => formData.value.fieldArea,
  (value) => {
    const result = validateField('fieldArea', value)
    if (typeof result === 'object') {
      errors.value.fieldArea = result.error
    } else {
      errors.value.fieldArea = result
    }
  },
)

watch(
  () => formData.value.cropType,
  (value) => {
    const result = validateField('cropType', value)
    if (typeof result === 'object') {
      errors.value.cropType = result.error
    } else {
      errors.value.cropType = result
    }
  },
)

// User Story 004: Watch and validate pump parameters
watch(
  () => localPumpParams.value.horsepower,
  (value) => {
    const result = validateField('pumpHorsepower', value)
    // Handle both error and warning (useValidation returns {error, warning})
    if (typeof result === 'object') {
      errors.value.horsepower = result.error
    } else {
      // Backward compatibility
      errors.value.horsepower = result
    }
  },
)

watch(
  () => localPumpParams.value.efficiency,
  (value) => {
    const result = validateField('pumpEfficiency', value)
    // Handle both error and warning (useValidation returns {error, warning})
    if (typeof result === 'object') {
      errors.value.efficiency = result.error
      warnings.value.efficiency = result.warning
    } else {
      // Backward compatibility
      errors.value.efficiency = result
      warnings.value.efficiency = null
    }
    // Clear numeric input warning when validation runs
    clearEfficiencyWarning()
  },
)

watch(
  () => localPumpParams.value.wellDepth,
  (value) => {
    const result = validateField('wellDepth', value)
    // Handle both error and warning (useValidation returns {error, warning})
    if (typeof result === 'object') {
      errors.value.wellDepth = result.error
      warnings.value.wellDepth = result.warning
    } else {
      // Backward compatibility
      errors.value.wellDepth = result
      warnings.value.wellDepth = null
    }
  },
)

// Emit updates
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', newValue)
    // T032: Save draft when form data changes
    saveFormDraft()
  },
  { deep: true },
)

// User Story 004: Emit pump params updates
watch(
  localPumpParams,
  (newValue) => {
    emit('update:pumpParams', newValue)
    // T032: Save draft when pump params change
    saveFormDraft()
  },
  { deep: true },
)

// T032: Save draft when billing period changes
watch(
  [billingPeriodStart, billingPeriodEnd],
  () => {
    saveFormDraft()
  },
)

// Watch for billing period changes and auto-recalculate if form was previously submitted
watch(
  [billingPeriodStart, billingPeriodEnd],
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    // Only auto-recalculate if:
    // 1. Form has been submitted before
    // 2. Both dates are set
    // 3. Dates actually changed
    // 4. No validation errors
    // 5. All required fields are filled
    if (
      hasBeenSubmitted.value &&
      newStart &&
      newEnd &&
      (newStart !== oldStart || newEnd !== oldEnd) &&
      !hasErrors.value &&
      formData.value.billAmount > 0 &&
      formData.value.cropType &&
      formData.value.fieldArea > 0
    ) {
      // Validate period before auto-submit
      const periodValidation = validatePeriod(newStart, newEnd)
      if (periodValidation.valid) {
        // Auto-submit the form
        handleSubmit()
      }
    }
  },
)

// NEW: Handle electricity type change (User Story 1)
function handleElectricityTypeChange() {
  // Mark field as dirty if form has been calculated before
  if (calculationStore.hasCalculated) {
    calculationStore.markFieldDirty('electricityType')
  }
}

// NEW: Handle recalculate button click (User Story 1)
function handleRecalculate() {
  // Same as submit, but explicitly for recalculation
  handleSubmit()
}

function handleSubmit() {
  // User Story P1: Validate billing period first
  const periodValidation = validatePeriod(billingPeriodStart.value, billingPeriodEnd.value)

  if (!periodValidation.valid) {
    periodValidationError.value = periodValidation.error
    return
  }

  // User Story 004: Validate all fields including pump parameters
  const billAmountResult = validateField('billAmount', formData.value.billAmount)
  const fieldAreaResult = validateField('fieldArea', formData.value.fieldArea)
  const cropTypeResult = validateField('cropType', formData.value.cropType)
  const horsepowerResult = validateField('pumpHorsepower', localPumpParams.value.horsepower)
  const efficiencyResult = validateField('pumpEfficiency', localPumpParams.value.efficiency)
  const wellDepthResult = validateField('wellDepth', localPumpParams.value.wellDepth)

  errors.value = {
    billAmount: typeof billAmountResult === 'object' ? billAmountResult.error : billAmountResult,
    fieldArea: typeof fieldAreaResult === 'object' ? fieldAreaResult.error : fieldAreaResult,
    cropType: typeof cropTypeResult === 'object' ? cropTypeResult.error : cropTypeResult,
    horsepower: typeof horsepowerResult === 'object' ? horsepowerResult.error : horsepowerResult,
    efficiency: typeof efficiencyResult === 'object' ? efficiencyResult.error : efficiencyResult,
    wellDepth: typeof wellDepthResult === 'object' ? wellDepthResult.error : wellDepthResult,
  }

  warnings.value = {
    efficiency: typeof efficiencyResult === 'object' ? efficiencyResult.warning : null,
    wellDepth: typeof wellDepthResult === 'object' ? wellDepthResult.warning : null,
  }

  // Check for errors
  if (hasErrors.value) {
    return
  }

  // User Story 004: Include billing period and pump parameters in submission
  const submissionData = {
    ...formData.value,
    billingPeriodStart: billingPeriodStart.value,
    billingPeriodEnd: billingPeriodEnd.value,
    billingSeason: determinedSeason.value,
    pumpParams: localPumpParams.value,
  }

  // Mark as submitted for auto-recalculation on date changes
  hasBeenSubmitted.value = true

  // T032: Clear draft on successful submission
  clearFormDraft()

  emit('submit', submissionData)
}

function handleReset() {
  formData.value = {
    billAmount: 0,
    electricityType: '非營業用', // UPDATED: New default
    timePricingCategory: '非時間電價', // NEW: User Story 2
    billingSeason: '夏月',
    cropType: '',
    fieldArea: 0,
    region: 'south',
  }
  errors.value = {
    horsepower: null,
    efficiency: null,
    wellDepth: null,
  }

  // User Story 004 & 005: Reset pump parameters to updated defaults
  localPumpParams.value = {
    horsepower: 5.0,
    efficiency: 0.75, // Already correct
    wellDepth: 30.0, // UPDATED: Changed from 20 to 30
  }

  // User Story P1: Reset billing period
  billingPeriodStart.value = null
  billingPeriodEnd.value = null
  determinedSeason.value = null
  periodValidationError.value = null
  hasCrossSeasonWarning.value = false

  // Reset submission tracking
  hasBeenSubmitted.value = false

  // T032: Clear draft on reset
  clearFormDraft()

  emit('reset')
}
</script>
