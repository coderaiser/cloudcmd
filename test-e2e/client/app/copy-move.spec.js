import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getFile,
    getRight,
    getDialog,
    getDialogInput,
    clickOk,
    clickCancel,
    exists,
    read,
    p,
} from './helper.js';

// Left panel shows the root. Right panel shows "dir2".
const openDir2InRightPanel = async (page) => {
    await open(page);
    await page.keyboard.press('Tab');
    await getFile(page, 'dir2', getRight(page)).dblclick();
    await expect(page).toHaveURL(/\/fs\/dir2/);
    await page.keyboard.press('Tab');
};

test('CPY-01: F5 copies a file to the other panel', async ({page, server}) => {
    await openDir2InRightPanel(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('F5');
    await expect(getDialogInput(page)).toHaveValue(/dir2/);
    await clickOk(page);
    
    await expect
        .poll(() => exists(p(server.root, 'dir2', 'edit.txt')))
        .toBe(true);
    expect(await exists(p(server.root, 'edit.txt'))).toBe(true);
    expect(await read(p(server.root, 'dir2', 'edit.txt'))).toBe('hello\n');
});

test('CPY-02: F5 copies all selected files', async ({page, server}) => {
    await openDir2InRightPanel(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('Insert');
    await page.keyboard.press('Insert');
    await page.keyboard.press('F5');
    await clickOk(page);
    
    await expect
        .poll(() => exists(p(server.root, 'dir2', 'edit.txt')))
        .toBe(true);
});

test('CPY-03: F5 asks before overwrite', async ({page, server}) => {
    await openDir2InRightPanel(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('F5');
    await clickOk(page);
    await expect
        .poll(() => exists(p(server.root, 'dir2', 'edit.txt')))
        .toBe(true);
    
    // Right panel shows the new file after the refresh.
    await expect(getFile(page, 'edit.txt', getRight(page))).toBeVisible();
    
    await select(page, 'edit.txt');
    await page.keyboard.press('F5');
    await clickOk(page);
    
    await expect(getDialog(page)).toContainText('already exist');
    await clickOk(page);
    await expect(getDialog(page)).toHaveCount(0);
});

test('MOV-01: F6 moves a file to the other panel', async ({page, server}) => {
    await openDir2InRightPanel(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('F6');
    await expect(getDialogInput(page)).toHaveValue(/dir2/);
    await clickOk(page);
    
    await expect
        .poll(() => exists(p(server.root, 'dir2', 'edit.txt')))
        .toBe(true);
    expect(await exists(p(server.root, 'edit.txt'))).toBe(false);
});

test('MOV-02: F6 with cancel moves nothing', async ({page, server}) => {
    await openDir2InRightPanel(page);
    await select(page, 'edit.txt');
    await page.keyboard.press('F6');
    await clickCancel(page);
    
    await expect(getDialog(page)).toHaveCount(0);
    expect(await exists(p(server.root, 'edit.txt'))).toBe(true);
    expect(await exists(p(server.root, 'dir2', 'edit.txt'))).toBe(false);
});
