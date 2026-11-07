import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getModal,
    getDialog,
    clickCancel,
    read,
    p,
} from './helper.js';

const openEditor = async (page, name) => {
    await open(page);
    await select(page, name);
    await page.keyboard.press('F4');
    await expect(page.locator('.ace_editor')).toBeVisible();
};

const typeAtEnd = async (page, text) => {
    await page
        .locator('.ace_content')
        .click();
    await page.keyboard.press('Control+End');
    await page.keyboard.type(text);
};

test('EDT-01: F4 opens the editor with the file content', async ({page}) => {
    await openEditor(page, 'edit.txt');
    
    await expect(page.locator('.ace_content')).toContainText('hello');
});

test('EDT-02: Ctrl+S saves a change to disk', async ({page, server}) => {
    await openEditor(page, 'edit.txt');
    await typeAtEnd(page, 'world');
    await page.keyboard.press('Control+S');
    
    await expect
        .poll(() => read(p(server.root, 'edit.txt')))
        .toBe('hello\nworld');
});

test('EDT-03: Escape closes the editor', async ({page}) => {
    await openEditor(page, 'edit.txt');
    await page.keyboard.press('Escape');
    
    await expect(getModal(page)).toHaveCount(0);
});

test('EDT-04: close without save keeps the old content', async ({page, server}) => {
    await openEditor(page, 'edit.txt');
    await typeAtEnd(page, 'world');
    await page.keyboard.press('Escape');
    
    await expect(getDialog(page)).toContainText('Do you want to save changes');
    await clickCancel(page);
    
    expect(await read(p(server.root, 'edit.txt'))).toBe('hello\n');
});
