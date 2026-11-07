import {test, expect} from './fixtures.js';
import {
    open,
    getFile,
    select,
} from './helper.js';

test('NAV-01: Enter opens a directory', async ({page}) => {
    await open(page);
    await select(page, 'dir1');
    await page.keyboard.press('Enter');
    
    await expect(getFile(page, 'inner.txt')).toBeVisible();
    await expect(page).toHaveURL(/\/fs\/dir1/);
});

test('NAV-02: double-click opens a directory', async ({page}) => {
    await open(page);
    await getFile(page, 'dir1').dblclick();
    
    await expect(getFile(page, 'inner.txt')).toBeVisible();
});

test('NAV-03: Backspace goes to the parent directory', async ({page}) => {
    await open(page);
    await getFile(page, 'dir1').dblclick();
    await expect(getFile(page, 'inner.txt')).toBeVisible();
    
    await page.keyboard.press('Backspace');
    
    await expect(getFile(page, 'edit.txt')).toBeVisible();
});

test('NAV-04: the ".." row goes to the parent directory', async ({page}) => {
    await open(page);
    await getFile(page, 'dir1').dblclick();
    await expect(getFile(page, 'inner.txt')).toBeVisible();
    
    await getFile(page, '..').dblclick();
    
    await expect(getFile(page, 'edit.txt')).toBeVisible();
});

test('NAV-05: Tab switches the active panel', async ({page}) => {
    await open(page);
    
    const left = page.locator('[data-name="js-left"] .current-file');
    const right = page.locator('[data-name="js-right"] .current-file');
    
    await expect(left).toHaveCount(1);
    await expect(right).toHaveCount(0);
    
    await page.keyboard.press('Tab');
    
    await expect(right).toHaveCount(1);
    await expect(left).toHaveCount(0);
});

test('NAV-06: Home, End, ArrowDown, and ArrowUp move the cursor', async ({page}) => {
    await open(page);
    
    const rows = page.locator('[data-name="js-left"] .files li');
    const count = await rows.count();
    
    await page.keyboard.press('End');
    await expect(rows.nth(count - 1)).toHaveClass(/current-file/);
    
    await page.keyboard.press('ArrowUp');
    await expect(rows.nth(count - 2)).toHaveClass(/current-file/);
    
    await page.keyboard.press('Home');
    await expect(rows.nth(0)).toHaveClass(/current-file/);
    
    await page.keyboard.press('ArrowDown');
    await expect(rows.nth(1)).toHaveClass(/current-file/);
});
