import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getFile,
    getDialog,
    clickOk,
    clickCancel,
    exists,
    p,
} from './helper.js';

test('DEL-01: F8 deletes a file after confirmation', async ({page, server}) => {
    await open(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('F8');
    await expect(getDialog(page)).toContainText('Do you really want to delete');
    await clickOk(page);
    
    await expect(getFile(page, 'edit.txt')).toHaveCount(0);
    expect(await exists(p(server.root, 'edit.txt'))).toBe(false);
});

test('DEL-02: F8 with cancel keeps the file', async ({page, server}) => {
    await open(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('F8');
    await clickCancel(page);
    
    await expect(getDialog(page)).toHaveCount(0);
    await expect(getFile(page, 'edit.txt')).toBeVisible();
    expect(await exists(p(server.root, 'edit.txt'))).toBe(true);
});

test('DEL-03: F8 deletes all selected files', async ({page, server}) => {
    await open(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    await page.keyboard.press('F8');
    await expect(getDialog(page)).toContainText('selected');
    await clickOk(page);
    
    await expect(getFile(page, 'edit.txt')).toHaveCount(0);
    expect(await exists(p(server.root, 'edit.txt'))).toBe(false);
});
