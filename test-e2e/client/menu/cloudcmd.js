import {test, expect} from '@playwright/test';

const open = async (page) => {
    await page.goto('/', {
        waitUntil: 'networkidle',
    });
    await page
        .locator('.files li')
        .first()
        .waitFor();
};

const visibleLabels = (page) => page
    .locator('ul.menu:not(.menu-hidden) > .menu-item > label')
    .allTextContents();

const isBound = (page) => page.evaluate(() => globalThis.CloudCmd.Key.isBind());

const rightClickFile = async (page) => {
    await page
        .locator('.files li[data-name^="js-file-"]')
        .nth(1)
        .click({
            button: 'right',
        });
    await page
        .locator('ul.menu:not(.menu-hidden)')
        .first()
        .waitFor();
};

test('menu: cloudcmd: right click on a file shows the file menu', async ({page}) => {
    await open(page);
    await rightClickFile(page);
    
    const labels = await visibleLabels(page);
    
    for (const label of [
        'View',
        'Edit',
        'Upload To Cloud',
        'Cut',
        'Copy',
        'Paste',
    ])
        expect(labels).toContain(label);
});

test('menu: cloudcmd: right click on empty panel shows (Un)Select All', async ({page}) => {
    await open(page);
    await page
        .locator('[data-name="js-left"]')
        .click({
            button: 'right',
            position: {
                x: 200,
                y: 500,
            },
        });
    
    await page
        .locator('ul.menu:not(.menu-hidden)')
        .first()
        .waitFor();
    
    const labels = await visibleLabels(page);
    
    expect(labels).toContain('(Un)Select All');
});

test('menu: cloudcmd: the menu opens near the pointer', async ({page}) => {
    await open(page);
    await page.mouse.click(300, 300, {
        button: 'right',
    });
    
    const menu = page
        .locator('ul.menu:not(.menu-hidden)')
        .first();
    
    await menu.waitFor();
    
    const box = await menu.boundingBox();
    
    expect(Math.abs(box.x - 300)).toBeLessThan(20);
    expect(Math.abs(box.y - 300)).toBeLessThan(40);
});

test('menu: cloudcmd: keys are free after Escape', async ({page}) => {
    await open(page);
    await rightClickFile(page);
    
    const whileOpen = await isBound(page);
    
    await page.keyboard.press('Escape');
    
    const afterEscape = await isBound(page);
    
    expect(whileOpen).toBe(false);
    expect(afterEscape).toBe(true);
});

test('menu: cloudcmd: New > File opens the dialog and hides the menu', async ({page}) => {
    await open(page);
    await rightClickFile(page);
    
    await page
        .locator('ul.menu:not(.menu-hidden) > .menu-item > label', {
            hasText: /^New$/,
        })
        .hover();
    
    await page
        .locator('.menu .menu-item .menu-item label:visible', {
            hasText: /^File$/,
        })
        .click();
    
    await expect(page.locator('.smalltalk')).toBeVisible();
    await expect(page.locator('ul.menu:not(.menu-hidden)')).toHaveCount(0);
});
