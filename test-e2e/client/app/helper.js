import {
    readFile,
    readdir,
    stat,
} from 'node:fs/promises';
import path from 'node:path';
import {tryToCatch} from 'try-to-catch';

export const goto = (page, url = '/') => page.goto(url, {
    waitUntil: 'networkidle',
});

export const waitForPanel = (page) => page
    .locator('.files li')
    .first()
    .waitFor();

export const open = async (page, url) => {
    await goto(page, url);
    await waitForPanel(page);
};

export const getRows = (page) => page.locator('.files li');

export const getLeft = (page) => page.locator('[data-name="js-left"]');
export const getRight = (page) => page.locator('[data-name="js-right"]');

// Both panels show the same directory at start. Use the left panel only.
export const getFile = (page, name, panel = getLeft(page)) => panel.locator(`[data-name="js-file-${btoa(name)}"]`);

export const getModal = (page) => page.locator('[data-name="modal-main"]');

// smalltalk dialog
export const getDialog = (page) => page.locator('.smalltalk');
export const getDialogInput = (page) => getDialog(page).locator('input');
export const clickOk = (page) => getDialog(page)
    .locator('[data-name="js-ok"]')
    .click();
export const clickCancel = (page) => getDialog(page)
    .locator('[data-name="js-cancel"]')
    .click();

export const select = async (page, name) => {
    await getFile(page, name).click();
};

export const exists = async (file) => {
    const [error] = await tryToCatch(stat, file);
    
    return !error;
};

export const read = async (file) => await readFile(file, 'utf8');
export const list = async (dir) => await readdir(dir);
export const p = path.join;
