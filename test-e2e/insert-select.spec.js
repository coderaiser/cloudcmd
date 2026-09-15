import {test, expect} from '@playwright/test';

const getRows = (page) => page.locator('.files li');

test('Insert selects the current file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(1);
    // nth(0) is '..'
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(first).toHaveClass(/selected-file/);
});

test('Insert moves the cursor to the next file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(1);
    const second = rows.nth(2);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
});

test('Insert does not leave the cursor on the first file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(1);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(first).not.toHaveClass(/current-file/);
});

test('pressing Insert twice selects two consecutive files', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(1);
    const second = rows.nth(2);
    
    await first.click();
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    
    await expect(first).toHaveClass(/selected-file/);
    await expect(second).toHaveClass(/selected-file/);
});

test('pressing Insert twice leaves cursor on the third file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const third = rows.nth(3);
    
    await rows
        .nth(1)
        .click();
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    
    await expect(third).toHaveClass(/current-file/);
});
