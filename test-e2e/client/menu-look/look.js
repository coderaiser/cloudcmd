import {test, expect} from '@playwright/test';

const MENU = 'http://localhost:3003';
const LUNES = 'http://localhost:3004';

const open = async (page, url) => {
    await page.goto(url, {
        waitUntil: 'networkidle',
    });
    await page
        .locator('.files li')
        .first()
        .waitFor();
};

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

const rightClickEmpty = async (page) => {
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
};

const arrowDown = async (page) => {
    await page.mouse.move(5, 5);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
};

const openNew = async (page) => {
    await page.mouse.move(5, 5);
    await page.keyboard.press('ArrowDown');
    
    const items = await page
        .locator('ul.menu:not(.menu-hidden) > .menu-item > label')
        .allTextContents();
    
    const index = items.indexOf('New');
    
    for (let i = 0; i < index; i++)
        await page.keyboard.press('ArrowDown');
    
    await page.keyboard.press('ArrowRight');
};

const shot = async (browser, url, scenario) => {
    const page = await browser.newPage({
        viewport: {
            width: 1100,
            height: 700,
        },
    });
    
    await open(page, url);
    await scenario(page);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300);
    
    const image = await page.screenshot({
        animations: 'disabled',
    });
    
    await page.close();
    
    return image;
};

const scenarios = {
    'file menu': rightClickFile,
    'empty panel menu': rightClickEmpty,
    'selected item': async (page) => {
        await rightClickFile(page);
        await arrowDown(page);
    },
    'New submenu': async (page) => {
        await rightClickFile(page);
        await openNew(page);
    },
};

for (const [name, scenario] of Object.entries(scenarios)) {
    test(`menu: look: lunes looks like menu: ${name}`, async ({browser}) => {
        const expected = await shot(browser, MENU, scenario);
        const result = await shot(browser, LUNES, scenario);
        
        expect(result.equals(expected)).toBe(true);
    });
}
