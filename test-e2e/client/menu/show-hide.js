import {test, expect} from '@playwright/test';
import {createMenuHelper} from './helper.js';

test('menu: shows on right-click', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    
    await expect(await menu.isVisible()).toBe(true);
});

test('menu: hides on Escape', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    await menu.pressKey('Escape');
    
    await expect(await menu.isHidden()).toBe(true);
});

test('menu: hides on click outside', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    await page.mouse.click(10, 10);
    
    await expect(await menu.isHidden()).toBe(true);
});

test('menu: contains Paste item', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    const items = await menu.itemTexts();
    
    expect(items).toContain('Paste');
});

test('menu: contains New item', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    const items = await menu.itemTexts();
    
    expect(items).toContain('New');
});

test('menu: contains Upload item', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    const items = await menu.itemTexts();
    
    expect(items).toContain('Upload');
});

test('menu: F9 opens menu', async ({page}) => {
    const menu = createMenuHelper(page);
    
    await page.goto('/', {
        waitUntil: 'networkidle',
    });
    await page
        .locator('.files li')
        .first()
        .waitFor();
    await page.keyboard.press('F9');
    await menu.waitForMenu();
    
    await expect(await menu.isVisible()).toBe(true);
});
