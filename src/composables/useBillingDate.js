import { ref, computed, watch } from 'vue'
import { determineBillingSeason, isBoundaryDate } from '@/utils/billing-seasons'
import { isFutureDate, isWithinRange, MIN_ALLOWED_DATE, getMaxAllowedDate } from '@/utils/date-validators'

/**
 * Composable for managing billing date state and validation
 * Encapsulates all billing date logic for reuse across components
 */
export function useBillingDate(initialDate = null) {
  // State
  const billingDate = ref(initialDate || new Date().toISOString().split('T')[0])
  const showFutureConfirmation = ref(false)
  const validationError = ref(null)

  // Computed properties
  const billingSeason = computed(() => {
    if (!billingDate.value) return null
    
    try {
      return determineBillingSeason(billingDate.value)
    } catch (error) {
      console.error('[useBillingDate] Failed to determine season:', error)
      return null
    }
  })

  const isFuture = computed(() => {
    if (!billingDate.value) return false
    return isFutureDate(billingDate.value)
  })

  const isBoundary = computed(() => {
    if (!billingDate.value) return false
    return isBoundaryDate(billingDate.value)
  })

  const isValid = computed(() => {
    if (!billingDate.value) return false
    
    // Check date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(billingDate.value)) {
      return false
    }
    
    // Check date range
    if (!isWithinRange(billingDate.value, MIN_ALLOWED_DATE, getMaxAllowedDate())) {
      return false
    }
    
    return true
  })

  const maxAllowedDate = computed(() => getMaxAllowedDate())

  // Methods
  const setBillingDate = (newDate) => {
    validationError.value = null
    
    if (!newDate) {
      validationError.value = '請選擇用電日期'
      return false
    }
    
    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      validationError.value = '日期格式錯誤'
      return false
    }
    
    // Validate range
    if (!isWithinRange(newDate, MIN_ALLOWED_DATE, getMaxAllowedDate())) {
      validationError.value = '日期超出允許範圍（2020-01-01 至未來一年）'
      return false
    }
    
    // Check if valid date
    const dateObj = new Date(newDate)
    if (isNaN(dateObj.getTime())) {
      validationError.value = '無效的日期'
      return false
    }
    
    billingDate.value = newDate
    return true
  }

  const validateForSubmission = () => {
    validationError.value = null
    
    if (!billingDate.value) {
      validationError.value = '請選擇用電日期'
      return false
    }
    
    if (!isValid.value) {
      validationError.value = '日期超出允許範圍'
      return false
    }
    
    // If future date, require confirmation
    if (isFuture.value && !showFutureConfirmation.value) {
      showFutureConfirmation.value = true
      return false
    }
    
    return true
  }

  const confirmFutureDate = () => {
    showFutureConfirmation.value = false
    return true
  }

  const cancelFutureDate = () => {
    showFutureConfirmation.value = false
    return false
  }

  const getBoundaryInfo = () => {
    if (!isBoundary.value) return null
    
    const dateObj = new Date(billingDate.value)
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    
    if (month === 6 && day === 1) return { type: 'start', season: '夏月', description: '夏月開始' }
    if (month === 9 && day === 30) return { type: 'end', season: '夏月', description: '夏月結束' }
    if (month === 10 && day === 1) return { type: 'start', season: '非夏月', description: '非夏月開始' }
    if (month === 5 && day === 31) return { type: 'end', season: '非夏月', description: '非夏月結束' }
    
    return null
  }

  const reset = () => {
    billingDate.value = new Date().toISOString().split('T')[0]
    validationError.value = null
    showFutureConfirmation.value = false
  }

  // Season change tracking
  const previousSeason = ref(billingSeason.value)
  
  watch(billingSeason, (newSeason, oldSeason) => {
    if (oldSeason !== null && newSeason !== oldSeason) {
      previousSeason.value = oldSeason
    }
  })

  return {
    // State
    billingDate,
    validationError,
    showFutureConfirmation,
    
    // Computed
    billingSeason,
    isFuture,
    isBoundary,
    isValid,
    maxAllowedDate,
    previousSeason,
    
    // Methods
    setBillingDate,
    validateForSubmission,
    confirmFutureDate,
    cancelFutureDate,
    getBoundaryInfo,
    reset,
    
    // Constants
    MIN_ALLOWED_DATE
  }
}
