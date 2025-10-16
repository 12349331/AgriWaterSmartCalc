/**
 * Accessibility utility functions
 */

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' | 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Focus trap for modals
 * @param {HTMLElement} element - Modal element
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }

  element.addEventListener('keydown', handleTabKey)

  // Focus first element
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Handle keyboard navigation
 * @param {Event} event - Keyboard event
 * @param {Function} onEnter - Callback for Enter key
 * @param {Function} onEscape - Callback for Escape key
 */
export function handleKeyboardNav(event, { onEnter, onEscape }) {
  if (event.key === 'Enter' && onEnter) {
    onEnter(event)
  } else if (event.key === 'Escape' && onEscape) {
    onEscape(event)
  }
}
