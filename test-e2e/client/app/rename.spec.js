import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getFile,
    getDialog,
    getDialogInput,
    clickOk,
    clickCancel,
    exists,
    read,
    p,
} from './helper.js';

test('REN-01: Shift+F6 renames a file', async ({page, server}) => {
    await open(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('Shift+F6');
    await getDialogInput(page).fill('renamed.txt');
    await clickOk(page);
    
    await expect(getFile(page, 'renamed.txt')).toBeVisible();
    expect(await exists(p(server.root, 'edit.txt'))).toBe(false);
    expect(await read(p(server.root, 'renamed.txt'))).toBe('hello\n');
});

test('REN-02: cancel keeps the old name', async ({page, server}) => {
    await open(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('Shift+F6');
    await getDialogInput(page).fill('renamed.txt');
    await clickCancel(page);
    
    await expect(getDialog(page)).toHaveCount(0);
    await expect(getFile(page, 'edit.txt')).toBeVisible();
    expect(await exists(p(server.root, 'renamed.txt'))).toBe(false);
});

test('REN-03: rename to an existing name asks, and cancel keeps both files', async ({page, server}) => {
    await open(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('Shift+F6');
    await getDialogInput(page).fill('copy.txt');
    await clickOk(page);
    
    await expect(getDialog(page)).toContainText('already exists');
    await clickCancel(page);
    
    await expect(getDialog(page)).toHaveCount(0);
    expect(await read(p(server.root, 'edit.txt'))).toBe('hello\n');
    expect(await exists(p(server.root, 'copy.txt'))).toBe(true);
});
