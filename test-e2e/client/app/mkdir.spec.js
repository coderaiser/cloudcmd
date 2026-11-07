import {test, expect} from './fixtures.js';
import {
    open,
    getFile,
    getDialog,
    getDialogInput,
    clickOk,
    clickCancel,
    exists,
    p,
} from './helper.js';

test('MKD-01: F7 creates a directory', async ({page, server}) => {
    await open(page);
    await page.keyboard.press('F7');
    await getDialogInput(page).fill('new-dir');
    await clickOk(page);
    
    await expect(getFile(page, 'new-dir')).toBeVisible();
    expect(await exists(p(server.root, 'new-dir'))).toBe(true);
});

test('MKD-02: F7 with cancel creates nothing', async ({page, server}) => {
    await open(page);
    await page.keyboard.press('F7');
    await getDialogInput(page).fill('new-dir');
    await clickCancel(page);
    
    await expect(getDialog(page)).toHaveCount(0);
    await expect(getFile(page, 'new-dir')).toHaveCount(0);
    expect(await exists(p(server.root, 'new-dir'))).toBe(false);
});

test('MKD-03: F7 with an existing name keeps the old content', async ({page, server}) => {
    await open(page);
    await page.keyboard.press('F7');
    await getDialogInput(page).fill('dir1');
    await clickOk(page);
    
    await page.waitForLoadState('networkidle');
    expect(await exists(p(server.root, 'dir1', 'inner.txt'))).toBe(true);
});
