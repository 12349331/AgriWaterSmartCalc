import { ref } from 'vue'

/**
 * Composable for handling numeric input with range restrictions
 * Implements real-time keystroke blocking for invalid values
 *
 * @param {Object} options - Configuration options
 * @param {number} options.min - Minimum value (inclusive)
 * @param {number} options.max - Maximum value (inclusive)
 * @param {number} options.step - Step increment
 * @param {number} options.decimals - Number of decimal places allowed
 * @returns {Object} Input handlers and state
 */
export function useNumericInput(options = {}) {
  const {
    min = 0,
    max = Infinity,
    step = 1,
    decimals = 2,
  } = options

  const warning = ref(null)

  // Allow list of control keys
  const ALLOWED_KEYS = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ]

  /**
   * Prevent invalid keystrokes before they enter the input
   */
  function handleKeydown(event) {
    const key = event.key

    // Allow control keys and keyboard shortcuts
    if (ALLOWED_KEYS.includes(key) || event.ctrlKey || event.metaKey) {
      return
    }

    // Allow decimal point (only once)
    if (key === '.' && decimals > 0) {
      if (!event.target.value.includes('.')) {
        return
      }
      event.preventDefault()
      return
    }

    // Allow digits 0-9
    if (/^[0-9]$/.test(key)) {
      const input = event.target
      const currentValue = input.value
      const cursorPosition = input.selectionStart
      const selectionEnd = input.selectionEnd

      // Simulate what the value would be after keystroke
      const newValue =
        currentValue.slice(0, cursorPosition) +
        key +
        currentValue.slice(selectionEnd)

      const numValue = parseFloat(newValue)

      // Check range
      if (!isNaN(numValue) && numValue > max) {
        event.preventDefault()
        warning.value = `值不能超過 ${max}`
        return
      }

      // Check decimal places
      if (newValue.includes('.')) {
        const decimalPart = newValue.split('.')[1]
        if (decimalPart && decimalPart.length > decimals) {
          event.preventDefault()
          return
        }
      }

      // Allow the keystroke
      return
    }

    // Block any other key
    event.preventDefault()
  }

  /**
   * Handle paste event with validation
   */
  function handlePaste(event) {
    event.preventDefault()
    const pastedText = (event.clipboardData || window.clipboardData).getData('text')
    const numValue = parseFloat(pastedText)

    if (isNaN(numValue)) {
      warning.value = '貼上的內容必須是數字'
      return
    }

    if (numValue < min || numValue > max) {
      warning.value = `值必須在 ${min} 到 ${max} 之間`
      return
    }

    // Set value and trigger input event
    event.target.value = numValue.toFixed(decimals)
    event.target.dispatchEvent(new Event('input', { bubbles: true }))
    clearWarning()
  }

  /**
   * Clamp value on blur to ensure it's within range
   */
  function handleBlur(event) {
    const value = parseFloat(event.target.value)

    if (isNaN(value)) {
      return
    }

    // Clamp to range
    const clampedValue = Math.max(min, Math.min(max, value))
    event.target.value = clampedValue.toFixed(decimals)

    if (value !== clampedValue) {
      warning.value = `值已調整至範圍內 (${min}-${max})`
      event.target.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  /**
   * Clear warning message
   */
  function clearWarning() {
    warning.value = null
  }

  return {
    warning,
    handleKeydown,
    handlePaste,
    handleBlur,
    clearWarning,
  }
}
