import {test, expect} from '@playwright/test';

const MENU = 'http://localhost:3003';
const LUNES = 'http://localhost:3004';

const file = (page, index = 1) => page
    .locator('.files li[data-name^="js-file-"]')
    .nth(index);

const label = (page, text) => page.locator('ul.menu:not(.menu-hidden) > li > label', {
    hasText: RegExp(`^${text}$`),
});

const VISIBLE = 'ul.menu:not(.menu-hidden)';

const waitVisible = (page) => page
    .locator(VISIBLE)
    .first()
    .waitFor();

const waitHidden = (page) => expect(page.locator(VISIBLE)).toHaveCount(0);

const rightClick = async (page, locator, options = {}) => {
    await locator.click({
        button: 'right',
        ...options,
    });
    await waitVisible(page);
};

const rightClickEmpty = (page) => rightClick(page, page.locator('[data-name="js-left"]'), {
    position: {
        x: 200,
        y: 500,
    },
});

const scenarios = {
    'right click on the path bar': async (page) => {
        await rightClick(
            page,
            page
                .locator('[data-name="js-path"]')
                .first(),
        );
    },
    'file, then empty panel': async (page) => {
        await rightClick(page, file(page));
        await rightClickEmpty(page);
    },
    'file, then another file': async (page) => {
        await rightClick(page, file(page));
        await rightClick(page, file(page, 2), {
            position: {
                x: 20,
                y: 5,
            },
        });
    },
    'file, Escape, file': async (page) => {
        await rightClick(page, file(page));
        await page.keyboard.press('Escape');
        await waitHidden(page);
        await rightClick(page, file(page));
    },
    'empty panel, Escape, file': async (page) => {
        await rightClickEmpty(page);
        await page.keyboard.press('Escape');
        await waitHidden(page);
        await rightClick(page, file(page));
    },
    'file, click Copy': async (page) => {
        await rightClick(page, file(page));
        await label(page, 'Copy').click();
    },
    'file, F9 while the menu is open': async (page) => {
        await rightClick(page, file(page));
        await page.keyboard.press('F9');
    },
    'file, hover New': async (page) => {
        await rightClick(page, file(page));
        await label(page, 'New').hover();
    },
    'file, click New': async (page) => {
        await rightClick(page, file(page));
        await label(page, 'New').click();
    },
    'file, ArrowDown, ArrowDown, ArrowUp': async (page) => {
        await rightClick(page, file(page));
        
        for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp'])
            await page.keyboard.press(key);
    },
};

const getState = (page) => page.evaluate(() => {
    const visible = [];
    
    for (const ul of document.querySelectorAll('ul.menu:not(.menu-hidden)')) {
        const {x, y} = ul.getBoundingClientRect();
        const first = ul.querySelector(':scope > li > label');
        
        visible.push(`${first.textContent}@${Math.round(x)},${Math.round(y)}`);
    }
    
    const selected = document.querySelector('.menu-item-selected label');
    
    return {
        visible,
        bound: globalThis.CloudCmd.Key.isBind(),
        selected: selected?.textContent,
        dialog: Boolean(document.querySelector('.smalltalk')),
    };
});

const run = async (browser, url, scenario) => {
    const page = await browser.newPage({
        viewport: {
            width: 1100,
            height: 700,
        },
    });
    
    await page.goto(url, {
        waitUntil: 'networkidle',
    });
    await page
        .locator('.files li')
        .first()
        .waitFor();
    await scenario(page);
    await page.waitForTimeout(250);
    
    const state = await getState(page);
    
    await page.close();
    
    return state;
};

for (const [name, scenario] of Object.entries(scenarios)) {
    test(`menu: behavior: lunes works like menu: ${name}`, async ({browser}) => {
        const expected = await run(browser, MENU, scenario);
        const result = await run(browser, LUNES, scenario);
        
        expect(result).toStrictEqual(expected);
    });
}
