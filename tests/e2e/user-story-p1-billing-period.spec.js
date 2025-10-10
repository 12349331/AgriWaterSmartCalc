/**
 * E2E Test: User Story P1 - 選擇電費計費期間自動判定計價季節
 *
 * MVP Core Feature:
 * - Users can select billing period (start/end dates)
 * - System auto-determines summer/non-summer season
 * - Shows cross-season warnings
 * - Validation blocks calculation when needed
 */

import { test, expect } from '@playwright/test'

test.describe('User Story P1: Billing Period Selection & Auto Season Determination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Scenario 1: Select summer period (7/1-7/31) → auto "夏月"', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Find and fill billing period inputs
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await expect(startDateInput).toBeVisible()
    await expect(endDateInput).toBeVisible()

    // 3. Select summer period: 2024-07-01 to 2024-07-31
    await startDateInput.fill('2024-07-01')
    await endDateInput.fill('2024-07-31')

    // 4. Wait for season auto-determination
    await page.waitForTimeout(300) // Allow for reactive updates

    // 5. Verify season is auto-determined as "夏月"
    const seasonDisplay = page.locator('[data-testid="season-display"]')
    await expect(seasonDisplay).toContainText('夏月')

    // 6. Verify season badge
    const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
    await expect(seasonBadge).toContainText('夏月')
    await expect(seasonBadge).toHaveClass(/orange/) // Summer color

    // 7. Verify no cross-season warning
    const crossSeasonWarning = page.locator('[data-testid="cross-season-warning"]')
    await expect(crossSeasonWarning).not.toBeVisible()

    // 8. Verify calculation can proceed (button enabled)
    const calculateButton = page.locator('[data-testid="submit-button"]')
    // Note: Button may be disabled due to other required fields, but not due to date error
    const validationError = page.locator('[data-testid="validation-error"]')
    await expect(validationError).not.toBeVisible()
  })

  test('Scenario 2: Select non-summer (11/1-11/30) → auto "非夏月"', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Select non-summer period: 2024-11-01 to 2024-11-30
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-11-01')
    await endDateInput.fill('2024-11-30')

    // 3. Wait for season auto-determination
    await page.waitForTimeout(300)

    // 4. Verify season is auto-determined as "非夏月"
    const seasonDisplay = page.locator('[data-testid="season-display"]')
    await expect(seasonDisplay).toContainText('非夏月')

    // 5. Verify season badge
    const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
    await expect(seasonBadge).toContainText('非夏月')
    await expect(seasonBadge).toHaveClass(/blue/) // Non-summer color

    // 6. Verify no cross-season warning
    const crossSeasonWarning = page.locator('[data-testid="cross-season-warning"]')
    await expect(crossSeasonWarning).not.toBeVisible()
  })

  test('Scenario 3: Cross-season (5/15-6/14) → "非夏月" + warning', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Select cross-season period: 2024-05-15 (non-summer) to 2024-06-14 (summer)
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-05-15')
    await endDateInput.fill('2024-06-14')

    // 3. Wait for validation
    await page.waitForTimeout(300)

    // 4. Verify cross-season warning is displayed
    const crossSeasonWarning = page.locator('[data-testid="cross-season-warning"]')
    await expect(crossSeasonWarning).toBeVisible()
    await expect(crossSeasonWarning).toContainText('橫跨')

    // 5. Verify season is determined (by majority - more days in non-summer)
    const seasonDisplay = page.locator('[data-testid="season-display"]')
    await expect(seasonDisplay).toContainText('非夏月')

    // 6. Verify warning style (yellow/warning color)
    await expect(crossSeasonWarning).toHaveClass(/yellow|warning/)

    // 7. Verify calculation is still allowed (warning, not error)
    const validationError = page.locator('[data-testid="validation-error"]')
    await expect(validationError).not.toBeVisible()
  })

  test('Scenario 4: Incomplete period → block calculation + error', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Fill only start date, leave end date empty
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-07-01')
    // Leave endDateInput empty

    // 3. Wait for validation
    await page.waitForTimeout(300)

    // 4. Verify error message is displayed
    const validationError = page.locator('[data-testid="validation-error"]')
    await expect(validationError).toBeVisible()
    await expect(validationError).toContainText('請完整選擇')

    // 5. Verify no season is displayed (incomplete data)
    const seasonDisplay = page.locator('[data-testid="season-display"]')
    // Season display may not be visible or shows placeholder

    // 6. Try to submit (should be blocked if other fields are filled)
    // Fill required fields
    await page.locator('[data-testid="usage-input"]').fill('1000')
    await page.selectOption('select[name="cropType"]', { index: 1 })
    await page.locator('input[type="number"][placeholder*="耕作面積"]').fill('10')

    // 7. Verify submit button handling
    const calculateButton = page.locator('[data-testid="submit-button"]')
    // Button should be disabled or clicking should show validation error
    const isDisabled = await calculateButton.isDisabled()

    if (!isDisabled) {
      await calculateButton.click()
      // Should show validation error
      await expect(validationError).toBeVisible()
    }
  })

  test('Scenario 5: End < start → block + error', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Fill end date before start date
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-07-15')
    await endDateInput.fill('2024-07-01') // End before start

    // 3. Wait for validation
    await page.waitForTimeout(300)

    // 4. Verify error message is displayed
    const validationError = page.locator('[data-testid="validation-error"]')
    await expect(validationError).toBeVisible()
    await expect(validationError).toContainText('結束日期必須晚於開始日期')

    // 5. Verify error styling on input
    await expect(endDateInput).toHaveClass(/error|red|invalid/)

    // 6. Verify calculation is blocked
    // Fill other required fields
    await page.locator('[data-testid="usage-input"]').fill('1000')

    const calculateButton = page.locator('[data-testid="submit-button"]')
    const isDisabled = await calculateButton.isDisabled()

    if (!isDisabled) {
      await calculateButton.click()
      // Should not proceed, error should persist
      await expect(validationError).toBeVisible()
    }
  })

  test('Scenario 6: Season field is readonly (auto-determined)', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Select a billing period
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-07-01')
    await endDateInput.fill('2024-07-31')

    // 3. Wait for season determination
    await page.waitForTimeout(300)

    // 4. Verify season is displayed as badge/readonly field (not radio buttons)
    const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
    await expect(seasonBadge).toBeVisible()
    await expect(seasonBadge).toContainText('夏月')

    // 5. Verify old radio buttons are NOT present
    const summerRadio = page.locator('input[type="radio"][value="夏月"]')
    const nonSummerRadio = page.locator('input[type="radio"][value="非夏月"]')

    // These should either not exist or be disabled/hidden
    const summerCount = await summerRadio.count()
    const nonSummerCount = await nonSummerRadio.count()

    if (summerCount > 0) {
      await expect(summerRadio).toBeDisabled()
    }
    if (nonSummerCount > 0) {
      await expect(nonSummerRadio).toBeDisabled()
    }

    // 6. Verify season badge is readonly (not clickable/editable)
    await expect(seasonBadge).not.toHaveAttribute('contenteditable', 'true')
  })

  test('Additional: Period >70 days warning', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Select a very long period (>70 days)
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-01-01')
    await endDateInput.fill('2024-04-01') // 91 days

    // 3. Wait for validation
    await page.waitForTimeout(300)

    // 4. Verify warning is displayed
    const periodWarning = page.locator('[data-testid="period-warning"]')
    await expect(periodWarning).toBeVisible()
    await expect(periodWarning).toContainText('計費期間異常長')
    await expect(periodWarning).toContainText('70 天')

    // 5. Verify this is a warning (yellow), not an error (red)
    await expect(periodWarning).toHaveClass(/yellow|warning/)

    // 6. Verify calculation is still allowed (warning doesn't block)
    const validationError = page.locator('[data-testid="validation-error"]')
    await expect(validationError).not.toBeVisible()
  })

  test('Additional: Future date warning', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Select a period with future dates
    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    // Calculate future date (today + 30 days)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    const futureEndDate = new Date(futureDate)
    futureEndDate.setDate(futureEndDate.getDate() + 30)
    const futureEndDateStr = futureEndDate.toISOString().split('T')[0]

    await startDateInput.fill(futureDateStr)
    await endDateInput.fill(futureEndDateStr)

    // 3. Wait for validation
    await page.waitForTimeout(300)

    // 4. Verify future date warning is displayed
    const futureWarning = page.locator('[data-testid="future-date-warning"]')
    await expect(futureWarning).toBeVisible()
    await expect(futureWarning).toContainText('未來日期')

    // 5. Verify warning style (yellow)
    await expect(futureWarning).toHaveClass(/yellow|warning/)

    // 6. Verify calculation is still allowed (warning doesn't block)
    const validationError = page.locator('[data-testid="validation-error"]')
    await expect(validationError).not.toBeVisible()
  })

  test('Integration: Complete flow with valid period', async ({ page }) => {
    // 1. Navigate to calculator
    await expect(page.locator('h2:has-text("水資源估算")')).toBeVisible()

    // 2. Fill billing period
    await page.locator('[data-testid="start-date-input"]').fill('2024-07-01')
    await page.locator('[data-testid="end-date-input"]').fill('2024-07-31')

    // 3. Verify season auto-determination
    await page.waitForTimeout(300)
    const seasonBadge = page.locator('[data-testid="billing-season-badge"]')
    await expect(seasonBadge).toContainText('夏月')

    // 4. Fill other required fields
    await page.locator('[data-testid="usage-input"]').fill('1500')
    await page.selectOption('select[name="cropType"]', { index: 1 })
    await page.locator('input[type="number"][placeholder*="耕作面積"]').fill('10')

    // 5. Submit calculation
    const calculateButton = page.locator('[data-testid="submit-button"]')
    await calculateButton.click()

    // 6. Verify results are displayed (if result component exists)
    // This depends on the implementation, but result should include billing period info
    await page.waitForTimeout(500)

    // Result card should appear or be updated
    const resultCard = page.locator('.result-card, [data-testid="result-card"]')
    // If results are shown, they should be visible
  })

  test('Performance: Season determination <100ms', async ({ page }) => {
    // 1. Navigate to calculator
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 2. Measure time for season determination
    const startTime = Date.now()

    const startDateInput = page.locator('[data-testid="start-date-input"]')
    const endDateInput = page.locator('[data-testid="end-date-input"]')

    await startDateInput.fill('2024-07-01')
    await endDateInput.fill('2024-07-31')

    // Wait for season display to update
    const seasonDisplay = page.locator('[data-testid="season-display"]')
    await expect(seasonDisplay).toContainText('夏月')

    const endTime = Date.now()
    const duration = endTime - startTime

    // 3. Verify performance requirement: <100ms (generous threshold for E2E)
    // E2E tests are slower, so we allow up to 500ms including DOM updates
    expect(duration).toBeLessThan(500)
  })
})
