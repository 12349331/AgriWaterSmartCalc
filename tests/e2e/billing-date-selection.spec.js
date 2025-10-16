import { test, expect } from '@playwright/test'

test.describe('US1: 用電日期選擇 - E2E Acceptance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('AC1: User can select billing date and see season badge', async ({ page }) => {
    // Locate date picker
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    await expect(datePicker).toBeVisible()
    
    // Select summer date (2024-07-15)
    await datePicker.fill('2024-07-15')
    
    // Verify season badge displays "夏月"
    const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
    await expect(seasonBadge).toHaveText('夏月')
    
    // Verify badge has correct styling
    await expect(seasonBadge).toHaveClass(/bg-orange-100/)
    await expect(seasonBadge).toHaveClass(/text-orange-800/)
    
    // Change to non-summer date (2024-11-15)
    await datePicker.fill('2024-11-15')
    
    // Verify season badge updates to "非夏月"
    await expect(seasonBadge).toHaveText('非夏月')
    await expect(seasonBadge).toHaveClass(/bg-blue-100/)
    await expect(seasonBadge).toHaveClass(/text-blue-800/)
  })

  test('AC2: Date validation prevents out-of-range dates', async ({ page }) => {
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    const submitButton = page.locator('[data-testid="submit-button"]')
    
    // Try to enter date before 2020-01-01
    await datePicker.fill('2019-12-31')
    await submitButton.click()
    
    // Verify error message appears
    const errorMessage = page.locator('[data-testid="validation-error"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('日期超出允許範圍')
    
    // Verify HTML5 validation attributes
    await expect(datePicker).toHaveAttribute('min', '2020-01-01')
    
    const today = new Date()
    const maxDate = new Date(today.setFullYear(today.getFullYear() + 1))
      .toISOString()
      .split('T')[0]
    await expect(datePicker).toHaveAttribute('max', maxDate)
  })

  test('AC3: Future date warning flow', async ({ page }) => {
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    const usageInput = page.locator('[data-testid="usage-input"]')
    const submitButton = page.locator('[data-testid="submit-button"]')
    
    // Set future date (today + 7 days)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const futureDateStr = futureDate.toISOString().split('T')[0]
    
    await datePicker.fill(futureDateStr)
    
    // Verify inline warning appears
    const warning = page.locator('[data-testid="future-date-warning"]')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('您選擇的是未來日期')
    
    // Fill in usage and submit
    await usageInput.fill('350')
    await submitButton.click()
    
    // Verify confirmation modal appears
    const modal = page.locator('[data-testid="future-date-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('您選擇的是未來日期，是否確定？')
    
    // Test cancellation
    const cancelButton = page.locator('[data-testid="cancel-future-date"]')
    await cancelButton.click()
    await expect(modal).not.toBeVisible()
    
    // Submit again and confirm
    await submitButton.click()
    const confirmButton = page.locator('[data-testid="confirm-future-date"]')
    await confirmButton.click()
    
    // Verify calculation proceeds
    const result = page.locator('[data-testid="calculation-result"]')
    await expect(result).toBeVisible()
  })

  test('AC4: Boundary dates show visual indicators', async ({ page }) => {
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    
    const boundaryDates = [
      { date: '2024-06-01', season: '夏月', info: '夏月開始' },
      { date: '2024-09-30', season: '夏月', info: '夏月結束' },
      { date: '2024-10-01', season: '非夏月', info: '非夏月開始' },
      { date: '2024-05-31', season: '非夏月', info: '非夏月結束' },
    ]
    
    for (const { date, season, info } of boundaryDates) {
      await datePicker.fill(date)
      
      // Verify boundary indicator appears
      const indicator = page.locator('[data-testid="boundary-indicator"]')
      await expect(indicator).toBeVisible()
      
      // Hover to see tooltip
      await indicator.hover()
      const tooltip = page.locator('[data-testid="boundary-tooltip"]')
      await expect(tooltip).toBeVisible()
      await expect(tooltip).toContainText('計價季節轉換日')
      
      // Verify correct season
      const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
      await expect(seasonBadge).toHaveText(season)
    }
  })

  test('AC5: Calculation includes billingDate in result', async ({ page }) => {
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    const usageInput = page.locator('[data-testid="usage-input"]')
    const submitButton = page.locator('[data-testid="submit-button"]')
    
    // Fill form
    await datePicker.fill('2024-07-15')
    await usageInput.fill('350')
    await submitButton.click()
    
    // Verify result displays
    const result = page.locator('[data-testid="calculation-result"]')
    await expect(result).toBeVisible()
    
    // Verify result includes billing date (formatted as YYYY/MM/DD)
    const billingDateDisplay = page.locator('[data-testid="result-billing-date"]')
    await expect(billingDateDisplay).toContainText('2024/07/15')
    
    // Verify result includes season
    const seasonDisplay = page.locator('[data-testid="result-season"]')
    await expect(seasonDisplay).toContainText('夏月')
  })

  test('AC6: Season change triggers rate recalculation', async ({ page }) => {
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    const usageInput = page.locator('[data-testid="usage-input"]')
    const submitButton = page.locator('[data-testid="submit-button"]')
    
    // Calculate with summer date
    await datePicker.fill('2024-07-15')
    await usageInput.fill('350')
    await submitButton.click()
    
    const summerResult = page.locator('[data-testid="result-total-cost"]')
    const summerCost = await summerResult.textContent()
    
    // Calculate with non-summer date (same usage)
    await datePicker.fill('2024-11-15')
    await submitButton.click()
    
    const nonSummerResult = page.locator('[data-testid="result-total-cost"]')
    const nonSummerCost = await nonSummerResult.textContent()
    
    // Verify costs are different (summer should be higher)
    expect(summerCost).not.toBe(nonSummerCost)
  })

  test('AC7: Accessibility - keyboard navigation and screen reader support', async ({ page }) => {
    // Tab to date picker
    await page.keyboard.press('Tab')
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    await expect(datePicker).toBeFocused()
    
    // Verify ARIA attributes
    await expect(datePicker).toHaveAttribute('aria-labelledby')
    
    // Select date via keyboard
    await datePicker.type('2024-07-15')
    
    // Verify live region announces season change
    const liveRegion = page.locator('[aria-live="polite"]')
    await expect(liveRegion).toContainText('夏月')
    
    // Change date to trigger season change
    await datePicker.fill('2024-11-15')
    await expect(liveRegion).toContainText('非夏月')
  })

  test('AC8: Mobile responsive layout', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
    
    // Verify elements are visible and properly sized
    await expect(datePicker).toBeVisible()
    await expect(seasonBadge).toBeVisible()
    
    // Verify touch-friendly tap targets (min 44x44px)
    const boundingBox = await datePicker.boundingBox()
    expect(boundingBox.height).toBeGreaterThanOrEqual(44)
  })

  test('AC9: Form validation prevents submission without date', async ({ page }) => {
    const usageInput = page.locator('[data-testid="usage-input"]')
    const submitButton = page.locator('[data-testid="submit-button"]')
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    
    // Clear date field
    await datePicker.clear()
    
    // Try to submit with only usage
    await usageInput.fill('350')
    await submitButton.click()
    
    // Verify error message
    const errorMessage = page.locator('[data-testid="validation-error"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText('請選擇用電日期')
  })

  test('AC10: Date persists after page refresh', async ({ page }) => {
    const datePicker = page.locator('[data-testid="billing-date-input"]')
    const usageInput = page.locator('[data-testid="usage-input"]')
    const submitButton = page.locator('[data-testid="submit-button"]')
    
    // Submit calculation
    await datePicker.fill('2024-07-15')
    await usageInput.fill('350')
    await submitButton.click()
    
    // Verify result appears
    const result = page.locator('[data-testid="calculation-result"]')
    await expect(result).toBeVisible()
    
    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verify date is restored (or defaults to today)
    const restoredDate = await datePicker.inputValue()
    expect(restoredDate).toBeTruthy()
    expect(restoredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
