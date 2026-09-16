import {test, expect} from '@playwright/test';

const getRows = (page) => page.locator('.files li');

test('Insert selects the current file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(1);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(first).toHaveClass(/selected-file/);
});

test('Insert moves the cursor to the next file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(0);
    const second = rows.nth(1);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
});

test('Insert does not leave the cursor on the last file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(0);
    
    await first.click();
    await page.keyboard.press('Insert');
    
    await expect(first).not.toHaveClass(/current-file/);
});

test('pressing Insert twice selects two consecutive files: first selected', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(0);
    
    await first.click();
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    
    await expect(first).toHaveClass(/selected-file/);
});

test('pressing Insert twice selects two consecutive files: second selected', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const first = rows.nth(0);
    const second = rows.nth(1);
    
    await first.click();
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/selected-file/);
});

test('pressing Insert twice leaves cursor on the second file', async ({page}) => {
    await page.goto('/');
    
    const rows = getRows(page);
    const second = rows.nth(1);
    
    await rows
        .nth(1)
        .click();
    
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    
    await expect(second).toHaveClass(/current-file/);
});
