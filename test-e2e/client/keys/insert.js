import {test, expect} from '@playwright/test';

const getRows = (page) => page.locator('.files li');
const goto = (page) => page.goto('/', {
    waitUntil: 'networkidle',
});

const waitForPanel = (page) => page
    .locator('.files li')
    .first()
    .waitFor();

test('Insert selects the current file', async ({page}) => {
    await goto(page);
    await waitForPanel(page);
    
    const rows = getRows(page);
    const first = rows.nth(0);
    
    await expect(first).toHaveClass(/current-file/);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(first).toHaveClass(/selected-file/);
});

test('Insert moves the cursor to the next file', async ({page}) => {
    await goto(page);
    await waitForPanel(page);
    
    const rows = getRows(page);
    const first = rows.nth(0);
    const second = rows.nth(1);
    
    await expect(first).toHaveClass(/current-file/);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
});

test('Insert does not leave the cursor on the first file', async ({page}) => {
    await goto(page);
    await waitForPanel(page);
    
    const rows = getRows(page);
    const first = rows.nth(0);
    
    await expect(first).toHaveClass(/current-file/);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(first).not.toHaveClass(/current-file/);
});

test('pressing Insert twice selects two consecutive files: first selected', async ({page}) => {
    await goto(page);
    await waitForPanel(page);
    
    const rows = getRows(page);
    const first = rows.nth(0);
    const second = rows.nth(1);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
    
    await page.keyboard.press('Insert');
    
    await expect(first).toHaveClass(/selected-file/);
});

test('pressing Insert twice selects two consecutive files: second selected', async ({page}) => {
    await goto(page);
    await waitForPanel(page);
    
    const rows = getRows(page);
    const first = rows.nth(0);
    const second = rows.nth(1);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
    
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/selected-file/);
});

test('pressing Insert twice leaves cursor on the third file', async ({page}) => {
    await goto(page);
    await waitForPanel(page);
    
    const rows = getRows(page);
    const first = rows.nth(0);
    const second = rows.nth(1);
    const third = rows.nth(2);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
    
    await page.keyboard.press('Insert');
    
    await expect(third).toHaveClass(/current-file/);
});
