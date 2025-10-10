/**
 * E2E Tests for User Story 2 - Dual Timestamp Architecture (Priority: P2)
 * Tests the display of billing period AND created time separately with independent sorting
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 2 - Dual Timestamps Display and Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Wait for app to load
    await page.waitForSelector('h1:has-text("智慧農業水資源管理平台")');

    // Clear any existing history
    const clearButton = page.locator('button:has-text("清除全部")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      // Confirm if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("確認")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    }
  });

  test('P2-1: Save record and display both billing period and created time separately', async ({ page }) => {
    // Fill in form with billing period dates
    await page.fill('input[name="billAmount"]', '1250');
    await page.selectOption('select[name="cropType"]', '水稻');
    await page.fill('input[name="fieldArea"]', '10.5');
    await page.selectOption('select[name="region"]', 'south');

    // Select billing period: 2024/07/01 - 2024/07/31
    await page.fill('input[name="billingPeriodStart"]', '2024-07-01');
    await page.fill('input[name="billingPeriodEnd"]', '2024-07-31');

    // Calculate
    await page.click('button:has-text("計算")');
    await page.waitForSelector('.result-card', { timeout: 5000 });

    // Save the record
    await page.click('button:has-text("儲存紀錄")');

    // Wait for history table to update
    await page.waitForTimeout(500);

    // Navigate to history view if not already visible
    const historySection = page.locator('.result-card:has-text("歷史記錄")');
    await expect(historySection).toBeVisible();

    // Verify billing period column exists and displays correctly
    const billingPeriodHeader = page.locator('th:has-text("計費期間")');
    await expect(billingPeriodHeader).toBeVisible();

    // Verify billing period format: YYYY/MM/DD - YYYY/MM/DD
    const billingPeriodCell = page.locator('td[data-testid="billing-period"]').first();
    await expect(billingPeriodCell).toBeVisible();
    const billingPeriodText = await billingPeriodCell.textContent();
    expect(billingPeriodText).toMatch(/\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}/);
    expect(billingPeriodText).toContain('2024/07/01 - 2024/07/31');

    // Verify created time column exists and displays correctly
    const createdTimeHeader = page.locator('th:has-text("創建時間")');
    await expect(createdTimeHeader).toBeVisible();

    // Verify created time format: YYYY/MM/DD HH:mm
    const createdTimeCell = page.locator('td[data-testid="created-time"]').first();
    await expect(createdTimeCell).toBeVisible();
    const createdTimeText = await createdTimeCell.textContent();
    expect(createdTimeText).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);

    // Verify created time is current (today's date)
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    expect(createdTimeText).toContain(today.replace(/\//g, '/'));
  });

  test('P2-2: Default sort by created time descending (newest first)', async ({ page }) => {
    // Create multiple records with different billing periods and timestamps
    const records = [
      { billAmount: '1000', billingPeriodStart: '2024-06-01', billingPeriodEnd: '2024-06-30' },
      { billAmount: '1200', billingPeriodStart: '2024-05-01', billingPeriodEnd: '2024-05-31' },
      { billAmount: '1100', billingPeriodStart: '2024-07-01', billingPeriodEnd: '2024-07-31' },
    ];

    for (const record of records) {
      await page.fill('input[name="billAmount"]', record.billAmount);
      await page.selectOption('select[name="cropType"]', '水稻');
      await page.fill('input[name="fieldArea"]', '10');
      await page.fill('input[name="billingPeriodStart"]', record.billingPeriodStart);
      await page.fill('input[name="billingPeriodEnd"]', record.billingPeriodEnd);
      await page.click('button:has-text("計算")');
      await page.waitForSelector('.result-card');
      await page.click('button:has-text("儲存紀錄")');
      await page.waitForTimeout(100); // Ensure timestamps are different
    }

    // Verify records are sorted by created time descending (newest first)
    const createdTimeCells = page.locator('td[data-testid="created-time"]');
    const createdTimes = await createdTimeCells.allTextContents();

    // The last saved record (July) should appear first
    expect(createdTimes.length).toBe(3);

    // Verify descending order by parsing timestamps
    for (let i = 0; i < createdTimes.length - 1; i++) {
      const currentTime = new Date(createdTimes[i].replace(/\//g, '-'));
      const nextTime = new Date(createdTimes[i + 1].replace(/\//g, '-'));
      expect(currentTime.getTime()).toBeGreaterThanOrEqual(nextTime.getTime());
    }
  });

  test('P2-3: Click billing period header to sort by billing period', async ({ page }) => {
    // Create records with different billing periods
    const records = [
      { billAmount: '1000', billingPeriodStart: '2024-07-01', billingPeriodEnd: '2024-07-31' },
      { billAmount: '1200', billingPeriodStart: '2024-05-01', billingPeriodEnd: '2024-05-31' },
      { billAmount: '1100', billingPeriodStart: '2024-06-01', billingPeriodEnd: '2024-06-30' },
    ];

    for (const record of records) {
      await page.fill('input[name="billAmount"]', record.billAmount);
      await page.selectOption('select[name="cropType"]', '水稻');
      await page.fill('input[name="fieldArea"]', '10');
      await page.fill('input[name="billingPeriodStart"]', record.billingPeriodStart);
      await page.fill('input[name="billingPeriodEnd"]', record.billingPeriodEnd);
      await page.click('button:has-text("計算")');
      await page.waitForSelector('.result-card');
      await page.click('button:has-text("儲存紀錄")');
      await page.waitForTimeout(100);
    }

    // Click billing period header to sort
    const billingPeriodHeader = page.locator('th:has-text("計費期間")');
    await billingPeriodHeader.click();

    // Wait for sort to apply
    await page.waitForTimeout(300);

    // Verify records are sorted by billing period (ascending by default)
    const billingPeriodCells = page.locator('td[data-testid="billing-period"]');
    const billingPeriods = await billingPeriodCells.allTextContents();

    // Extract start dates and verify ascending order
    expect(billingPeriods[0]).toContain('2024/05/01'); // May first
    expect(billingPeriods[1]).toContain('2024/06/01'); // June second
    expect(billingPeriods[2]).toContain('2024/07/01'); // July third

    // Verify sort indicator is visible (ascending arrow)
    const sortIcon = page.locator('th:has-text("計費期間") .sort-icon-asc');
    await expect(sortIcon).toBeVisible();
  });

  test('P2-4: Click created time header to sort by created time (toggle direction)', async ({ page }) => {
    // Create records
    const records = [
      { billAmount: '1000', billingPeriodStart: '2024-06-01', billingPeriodEnd: '2024-06-30' },
      { billAmount: '1200', billingPeriodStart: '2024-07-01', billingPeriodEnd: '2024-07-31' },
      { billAmount: '1100', billingPeriodStart: '2024-05-01', billingPeriodEnd: '2024-05-31' },
    ];

    for (const record of records) {
      await page.fill('input[name="billAmount"]', record.billAmount);
      await page.selectOption('select[name="cropType"]', '水稻');
      await page.fill('input[name="fieldArea"]', '10');
      await page.fill('input[name="billingPeriodStart"]', record.billingPeriodStart);
      await page.fill('input[name="billingPeriodEnd"]', record.billingPeriodEnd);
      await page.click('button:has-text("計算")');
      await page.waitForSelector('.result-card');
      await page.click('button:has-text("儲存紀錄")');
      await page.waitForTimeout(100);
    }

    // Default is descending (newest first) - verify
    let createdTimeCells = page.locator('td[data-testid="created-time"]');
    let createdTimes = await createdTimeCells.allTextContents();
    expect(createdTimes.length).toBe(3);

    // Click created time header to toggle to ascending
    const createdTimeHeader = page.locator('th:has-text("創建時間")');
    await createdTimeHeader.click();
    await page.waitForTimeout(300);

    // Verify ascending order (oldest first)
    createdTimeCells = page.locator('td[data-testid="created-time"]');
    createdTimes = await createdTimeCells.allTextContents();

    for (let i = 0; i < createdTimes.length - 1; i++) {
      const currentTime = new Date(createdTimes[i].replace(/\//g, '-'));
      const nextTime = new Date(createdTimes[i + 1].replace(/\//g, '-'));
      expect(currentTime.getTime()).toBeLessThanOrEqual(nextTime.getTime());
    }

    // Verify sort indicator is visible (ascending arrow)
    const sortIconAsc = page.locator('th:has-text("創建時間") .sort-icon-asc');
    await expect(sortIconAsc).toBeVisible();

    // Click again to toggle back to descending
    await createdTimeHeader.click();
    await page.waitForTimeout(300);

    // Verify descending order (newest first)
    createdTimeCells = page.locator('td[data-testid="created-time"]');
    createdTimes = await createdTimeCells.allTextContents();

    for (let i = 0; i < createdTimes.length - 1; i++) {
      const currentTime = new Date(createdTimes[i].replace(/\//g, '-'));
      const nextTime = new Date(createdTimes[i + 1].replace(/\//g, '-'));
      expect(currentTime.getTime()).toBeGreaterThanOrEqual(nextTime.getTime());
    }

    // Verify sort indicator is visible (descending arrow)
    const sortIconDesc = page.locator('th:has-text("創建時間") .sort-icon-desc');
    await expect(sortIconDesc).toBeVisible();
  });

  test('P2-5: Export CSV includes all 3 time fields (billing start, end, created time)', async ({ page }) => {
    // Create a record
    await page.fill('input[name="billAmount"]', '1250');
    await page.selectOption('select[name="cropType"]', '水稻');
    await page.fill('input[name="fieldArea"]', '10.5');
    await page.fill('input[name="billingPeriodStart"]', '2024-07-01');
    await page.fill('input[name="billingPeriodEnd"]', '2024-07-31');
    await page.click('button:has-text("計算")');
    await page.waitForSelector('.result-card');
    await page.click('button:has-text("儲存紀錄")');

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export CSV button
    await page.click('button:has-text("匯出 CSV")');

    // Wait for download
    const download = await downloadPromise;
    const path = await download.path();

    // Read CSV content
    const fs = require('fs');
    const csvContent = fs.readFileSync(path, 'utf-8');

    // Verify CSV headers include 3 time fields
    expect(csvContent).toContain('計費期間起');
    expect(csvContent).toContain('計費期間迄');
    expect(csvContent).toContain('創建時間');

    // Verify date format in CSV (YYYY/MM/DD)
    const lines = csvContent.split('\n');
    const dataLine = lines[1]; // First data row

    // Should contain dates in YYYY/MM/DD format
    expect(dataLine).toMatch(/2024\/07\/01/); // Billing period start
    expect(dataLine).toMatch(/2024\/07\/31/); // Billing period end
    expect(dataLine).toMatch(/\d{4}\/\d{2}\/\d{2}/); // Created time date
  });

  test('P2-6: Export JSON includes ISO 8601 format timestamps', async ({ page }) => {
    // Create a record
    await page.fill('input[name="billAmount"]', '1250');
    await page.selectOption('select[name="cropType"]', '水稻');
    await page.fill('input[name="fieldArea"]', '10.5');
    await page.fill('input[name="billingPeriodStart"]', '2024-07-01');
    await page.fill('input[name="billingPeriodEnd"]', '2024-07-31');
    await page.click('button:has-text("計算")');
    await page.waitForSelector('.result-card');
    await page.click('button:has-text("儲存紀錄")');

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export JSON button
    await page.click('button:has-text("匯出 JSON")');

    // Wait for download
    const download = await downloadPromise;
    const path = await download.path();

    // Read JSON content
    const fs = require('fs');
    const jsonContent = fs.readFileSync(path, 'utf-8');
    const data = JSON.parse(jsonContent);

    // Verify first record has all timestamp fields
    const record = data[0];
    expect(record.billingPeriodStart).toBeDefined();
    expect(record.billingPeriodEnd).toBeDefined();
    expect(record.timestamp).toBeDefined();

    // Verify ISO 8601 format (YYYY-MM-DD)
    expect(record.billingPeriodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(record.billingPeriodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Verify timestamp is Unix milliseconds
    expect(typeof record.timestamp).toBe('number');
    expect(record.timestamp).toBeGreaterThan(0);
  });

  test('P2-7: Column headers have tooltips explaining difference (SC-003)', async ({ page }) => {
    // Create a record first to display the table
    await page.fill('input[name="billAmount"]', '1000');
    await page.selectOption('select[name="cropType"]', '水稻');
    await page.fill('input[name="fieldArea"]', '10');
    await page.fill('input[name="billingPeriodStart"]', '2024-07-01');
    await page.fill('input[name="billingPeriodEnd"]', '2024-07-31');
    await page.click('button:has-text("計算")');
    await page.waitForSelector('.result-card');
    await page.click('button:has-text("儲存紀錄")');

    // Verify billing period header has tooltip
    const billingPeriodHeader = page.locator('th:has-text("計費期間")');
    const billingPeriodTitle = await billingPeriodHeader.getAttribute('title');
    expect(billingPeriodTitle).toBeTruthy();
    expect(billingPeriodTitle).toContain('電費單'); // Should explain it's from the bill

    // Verify created time header has tooltip
    const createdTimeHeader = page.locator('th:has-text("創建時間")');
    const createdTimeTitle = await createdTimeHeader.getAttribute('title');
    expect(createdTimeTitle).toBeTruthy();
    expect(createdTimeTitle).toContain('紀錄建立'); // Should explain it's when record was created
  });

  test('P2-8: Load 100+ records with dual timestamps in <2s (SC-004)', async ({ page }) => {
    // Create 100+ records (using LocalStorage directly for speed)
    const records = [];
    for (let i = 0; i < 105; i++) {
      const date = new Date(2024, 0, 1 + i); // Incremental dates
      records.push({
        id: `test-${i}`,
        timestamp: date.getTime(),
        billingPeriodStart: date.toISOString().split('T')[0],
        billingPeriodEnd: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billAmount: 1000 + i * 10,
        cropType: '水稻',
        fieldArea: 10,
        region: 'south',
        calculatedKwh: 285 + i,
        waterFlowRate: 0.65 + i * 0.01,
        monthlyVolume: 1700 + i * 10,
      });
    }

    // Inject records into LocalStorage
    await page.evaluate((recordsData) => {
      localStorage.setItem('aquametrics_history', JSON.stringify(recordsData));
    }, records);

    // Reload page and measure load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('h1:has-text("智慧農業水資源管理平台")');
    await page.waitForSelector('td[data-testid="billing-period"]', { timeout: 5000 });
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(2000); // < 2 seconds per SC-004

    // Verify records loaded correctly
    const recordCountText = await page.textContent('div:has-text("共") >> text=/共.*筆記錄/');
    expect(recordCountText).toContain('105');
  });
});
