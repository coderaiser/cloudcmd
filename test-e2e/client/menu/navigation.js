import {test, expect} from '@playwright/test';
import {createMenuHelper} from './helper.js';

test('menu: ArrowDown selects first item', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    await menu.pressKey('ArrowDown');
    const text = await menu.selectedText();
    
    expect(text.length).toBeGreaterThan(0);
});

test('menu: ArrowDown then ArrowUp returns to first item', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    await menu.pressKey('ArrowDown');
    const first = await menu.selectedText();
    await menu.pressKey('ArrowDown');
    
    const selected = page
        .locator('.menu-item-selected label')
        .first();
    
    await expect(selected).toBeVisible();
    
    await menu.pressKey('ArrowUp');
    
    expect(await menu.selectedText()).toBe(first);
});

test('menu: j key selects first item', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    await page.keyboard.press('j');
    const text = await menu.selectedText();
    
    expect(text.length).toBeGreaterThan(0);
});

test('menu: ArrowRight opens New submenu: File item visible', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    const items = await menu.itemTexts();
    const newIdx = items.indexOf('New');
    
    for (let i = 0; i <= newIdx; i++)
        await menu.pressKey('ArrowDown');
    
    await menu.pressKey('ArrowRight');
    const subItems = await page
        .locator('.menu .menu-item .menu-item label')
        .allTextContents();
    
    expect(subItems).toContain('File');
});

test('menu: ArrowRight opens New submenu: Directory item visible', async ({page}) => {
    const menu = createMenuHelper(page);
    await menu.open();
    await menu.waitForMenu();
    const items = await menu.itemTexts();
    const newIdx = items.indexOf('New');
    
    for (let i = 0; i <= newIdx; i++)
        await menu.pressKey('ArrowDown');
    
    await menu.pressKey('ArrowRight');
    const subItems = await page
        .locator('.menu .menu-item .menu-item label')
        .allTextContents();
    
    expect(subItems).toContain('Directory');
});
