/**
 * E2E Tests for User Story 1 - Calculate Water Usage from Current Data (Priority: P1)
 * Tests the complete MVP user flow: enter data → calculate → view results
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 1 - Calculate Water Usage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173')

    // Wait for app to load
    await page.waitForSelector('h1:has-text("智慧農業水資源管理平台")')
  })

  test('P1-1: Complete calculation with valid inputs and view results', async ({ page }) => {
    // Fill in bill amount
    await page.fill('input[name="billAmount"]', '1250')

    // Select crop type (水稻 - Rice)
    await page.selectOption('select[name="cropType"]', '水稻')

    // Fill in field area
    await page.fill('input[name="fieldArea"]', '10.5')

    // Select region (南部 - South)
    await page.selectOption('select[name="region"]', 'south')

    // Click calculate button
    await page.click('button:has-text("計算")')

    // Wait for results to appear
    await page.waitForSelector('.result-card', { timeout: 5000 })

    // Verify results are displayed
    const kwhResult = await page.textContent('[data-testid="calculated-kwh"]')
    const flowRateResult = await page.textContent('[data-testid="water-flow-rate"]')
    const volumeResult = await page.textContent('[data-testid="monthly-volume"]')

    // Check that values are numbers and greater than 0
    expect(parseFloat(kwhResult)).toBeGreaterThan(0)
    expect(parseFloat(flowRateResult)).toBeGreaterThan(0)
    expect(parseFloat(volumeResult)).toBeGreaterThan(0)

    // Verify results display precision per FR-007
    // Q: 2 decimal places, V: 1 decimal place, kWh: 0 decimal places
    expect(flowRateResult).toMatch(/\d+\.\d{2}/) // e.g., "0.70"
    expect(volumeResult).toMatch(/\d+\.\d{1}/) // e.g., "126.7"
    expect(kwhResult).toMatch(/^\d+$/) // e.g., "357" (no decimals)
  })

  test('P1-2: Display error for invalid inputs (negative numbers)', async ({ page }) => {
    // Fill in negative bill amount
    await page.fill('input[name="billAmount"]', '-100')

    // Try to calculate
    await page.click('button:has-text("計算")')

    // Verify error message appears in Traditional Chinese
    const errorMessage = await page.textContent('.error-message')
    expect(errorMessage).toContain('電費金額必須大於 0')
  })

  test('P1-3: Display error for out-of-range inputs (per FR-006)', async ({ page }) => {
    // Fill in bill amount that exceeds 5000 kWh equivalent (~17,500 TWD)
    await page.fill('input[name="billAmount"]', '20000')

    // Fill in field area that exceeds 50 hectares (~516 fen)
    await page.fill('input[name="fieldArea"]', '600')

    // Try to calculate
    await page.click('button:has-text("計算")')

    // Verify validation error appears
    const errorMessage = await page.textContent('.error-message')
    expect(errorMessage).toBeTruthy()
    expect(errorMessage).toMatch(/(超過|範圍)/) // Contains "exceeds" or "range"
  })

  test('P1-4: Prevent calculation with missing required fields', async ({ page }) => {
    // Fill in only bill amount, leave crop type and field area empty
    await page.fill('input[name="billAmount"]', '1000')

    // Try to calculate
    await page.click('button:has-text("計算")')

    // Verify that required field indicators appear
    const cropTypeError = await page.isVisible('select[name="cropType"][aria-invalid="true"]')
    const fieldAreaError = await page.isVisible('input[name="fieldArea"][aria-invalid="true"]')

    expect(cropTypeError || fieldAreaError).toBeTruthy()
  })

  test('P1-5: Reset form while preserving crop type selection', async ({ page }) => {
    // Fill in all fields
    await page.fill('input[name="billAmount"]', '1500')
    await page.selectOption('select[name="cropType"]', '葉菜類')
    await page.fill('input[name="fieldArea"]', '8')

    // Click calculate
    await page.click('button:has-text("計算")')
    await page.waitForSelector('.result-card')

    // Click reset button
    await page.click('button:has-text("重設")')

    // Verify form fields are reset
    const billAmount = await page.inputValue('input[name="billAmount"]')
    const fieldArea = await page.inputValue('input[name="fieldArea"]')

    expect(billAmount).toBe('')
    expect(fieldArea).toBe('')

    // Verify crop type is preserved
    const cropType = await page.inputValue('select[name="cropType"]')
    expect(cropType).toBe('葉菜類')
  })

  test('P1-6: Calculate with minimum valid inputs (boundary test)', async ({ page }) => {
    // Minimum: 10 kWh (約 35 TWD), 0.5 hectares (~5.16 fen)
    await page.fill('input[name="billAmount"]', '35')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '5.16')

    await page.click('button:has-text("計算")')

    // Should successfully calculate without errors
    await page.waitForSelector('.result-card', { timeout: 5000 })
    const volumeResult = await page.textContent('[data-testid="monthly-volume"]')
    expect(parseFloat(volumeResult)).toBeGreaterThan(0)
  })

  test('P1-7: Calculate with maximum valid inputs (boundary test)', async ({ page }) => {
    // Maximum: 5000 kWh (約 17,500 TWD), 50 hectares (~516 fen)
    await page.fill('input[name="billAmount"]', '17500')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '516')

    await page.click('button:has-text("計算")')

    // Should successfully calculate without errors
    await page.waitForSelector('.result-card', { timeout: 5000 })
    const volumeResult = await page.textContent('[data-testid="monthly-volume"]')
    expect(parseFloat(volumeResult)).toBeGreaterThan(0)
  })

  test('P1-8: Display Traditional Chinese error messages (FR-014)', async ({ page }) => {
    // Trigger validation error
    await page.fill('input[name="billAmount"]', '-50')
    await page.click('button:has-text("計算")')

    // Verify error is in Traditional Chinese
    const errorMessage = await page.textContent('.error-message')
    expect(errorMessage).toMatch(/[一-龥]/) // Contains Chinese characters
    expect(errorMessage).not.toContain('error') // Not English
  })

  test('P1-9: Results display within 1 second (SC-002)', async ({ page }) => {
    await page.fill('input[name="billAmount"]', '1000')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '10')

    const startTime = Date.now()
    await page.click('button:has-text("計算")')
    await page.waitForSelector('.result-card')
    const endTime = Date.now()

    const calculationTime = endTime - startTime
    expect(calculationTime).toBeLessThan(1000) // < 1 second per SC-002
  })

  test('P1-10: Use advanced parameters (pump settings)', async ({ page }) => {
    // Expand advanced parameters section
    await page.click('button:has-text("進階參數")')

    // Verify advanced fields are visible
    await expect(page.locator('input[name="pumpHorsepower"]')).toBeVisible()
    await expect(page.locator('input[name="pumpEfficiency"]')).toBeVisible()
    await expect(page.locator('input[name="wellDepth"]')).toBeVisible()

    // Modify pump parameters
    await page.fill('input[name="pumpHorsepower"]', '7')
    await page.fill('input[name="pumpEfficiency"]', '0.80')
    await page.fill('input[name="wellDepth"]', '30')

    // Fill in main form
    await page.fill('input[name="billAmount"]', '1500')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '12')

    // Calculate
    await page.click('button:has-text("計算")')
    await page.waitForSelector('.result-card')

    // Verify results reflect custom pump parameters
    const flowRate = parseFloat(await page.textContent('[data-testid="water-flow-rate"]'))
    expect(flowRate).toBeGreaterThan(0)
  })

  test('P1-11: Regional preset selection updates pump parameters', async ({ page }) => {
    // Select North Taiwan region (80m well depth)
    await page.selectOption('select[name="region"]', 'north')

    // Expand advanced parameters to verify
    await page.click('button:has-text("進階參數")')

    // Verify well depth matches regional preset (North: 80m)
    const wellDepth = await page.inputValue('input[name="wellDepth"]')
    expect(parseFloat(wellDepth)).toBe(80)
  })

  test('P1-12: Handle over-extraction warning (>2000 m³)', async ({ page }) => {
    // Set up scenario for high water usage
    await page.fill('input[name="billAmount"]', '10000')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '5') // Small area => high per-area usage

    await page.click('button:has-text("計算")')
    await page.waitForSelector('.result-card')

    // Check if over-extraction warning appears
    const hasWarning = await page.isVisible('.result-card.warning, .result-card.over-extraction')

    // If volume > 2000, warning should be visible
    const volume = parseFloat(await page.textContent('[data-testid="monthly-volume"]'))
    if (volume > 2000) {
      expect(hasWarning).toBeTruthy()
    }
  })

  test('P1-13: Summer vs Non-Summer billing season calculation', async ({ page }) => {
    // Calculate with Summer season
    await page.check('input[name="billingSeason"][value="夏月"]')
    await page.fill('input[name="billAmount"]', '1000')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '10')

    await page.click('button:has-text("計算")')
    await page.waitForSelector('.result-card')
    const summerKwh = parseFloat(await page.textContent('[data-testid="calculated-kwh"]'))

    // Reset and calculate with Non-Summer season
    await page.click('button:has-text("重設")')
    await page.check('input[name="billingSeason"][value="非夏月"]')
    await page.fill('input[name="billAmount"]', '1000')
    await page.selectOption('select[name="cropType"]', '水稻')
    await page.fill('input[name="fieldArea"]', '10')

    await page.click('button:has-text("計算")')
    await page.waitForSelector('.result-card')
    const nonSummerKwh = parseFloat(await page.textContent('[data-testid="calculated-kwh"]'))

    // Non-summer rates are cheaper, so same bill should yield MORE kWh
    expect(nonSummerKwh).toBeGreaterThan(summerKwh)
  })

  test('P1-14: Verify page loads within 2 seconds (SC-001 partial)', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('http://localhost:5173')
    await page.waitForSelector('h1:has-text("智慧農業水資源管理平台")')
    const endTime = Date.now()

    const loadTime = endTime - startTime
    expect(loadTime).toBeLessThan(2000) // < 2 seconds per performance goals
  })
})

test.describe('User Story 1 - Offline Behavior (FR-017)', () => {
  test('P1-15: Display offline notice when network unavailable', async ({ page, context }) => {
    // Simulate offline status
    await context.setOffline(true)

    await page.goto('http://localhost:5173')

    // Wait for offline notice to appear
    await page.waitForSelector('.offline-notice', { timeout: 5000 })

    // Verify Traditional Chinese message
    const offlineMessage = await page.textContent('.offline-notice')
    expect(offlineMessage).toContain('無法連線')

    // Verify all functionality is disabled
    const calculateButton = await page.locator('button:has-text("計算")')
    expect(await calculateButton.isDisabled()).toBeTruthy()
  })

  test('P1-16: Restore functionality when online', async ({ page, context }) => {
    // Start offline
    await context.setOffline(true)
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.offline-notice')

    // Go back online
    await context.setOffline(false)

    // Wait for offline notice to disappear
    await page.waitForSelector('.offline-notice', { state: 'hidden', timeout: 5000 })

    // Verify functionality is restored
    const calculateButton = await page.locator('button:has-text("計算")')
    expect(await calculateButton.isDisabled()).toBeFalsy()
  })
})
