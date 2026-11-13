import {test, expect} from './fixtures.js';
import {
    open,
    getModal,
    read,
    p,
} from './helper.js';

const isPutoutModule = (url) => url.endsWith('/modules/putout.js');
const getEngine = (page) => page.evaluate(() => globalThis.CloudCmd.config('engine'));
const getEngineSelect = (page) => getModal(page).locator('[data-name="js-engine"]');

const selectEngine = async (page, name) => {
    await getEngineSelect(page).selectOption(name);
    await expect
        .poll(() => getEngine(page))
        .toBe(name);
};

const reopen = async (page) => {
    await page.keyboard.press('Escape');
    await expect(getModal(page)).toHaveCount(0);
    await page.keyboard.press('F10');
    await expect(
        getModal(page).locator('form.config'),
    ).toBeVisible();
};

// The server uses a temporary HOME. The config file is in server.home.
test('CFG-01: F10 opens the config window', async ({page}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    await expect(
        getModal(page).locator('form.config'),
    ).toBeVisible();
});

test('CFG-02: a changed option is saved to the config file', async ({page, server}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    await getModal(page)
        .locator('[data-name="js-theme"]')
        .selectOption('dark');
    
    await expect
        .poll(() => read(p(server.home, '.cloudcmd.json')).catch(() => ''))
        .toContain('"theme": "dark"');
});

test('CFG-03: Escape closes the config window', async ({page}) => {
    await open(page);
    await page.keyboard.press('F10');
    await expect(getModal(page)).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(getModal(page)).toHaveCount(0);
});

test('CFG-04: the menu list has aleman, supermenu and lunes', async ({page}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    await expect(
        getModal(page).locator('[data-name="js-menu"] option'),
    ).toHaveText([
        'aleman',
        'supermenu',
        'lunes',
    ]);
});

test('CFG-05: the menu "lunes" is saved to the config file', async ({page, server}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    await getModal(page)
        .locator('[data-name="js-menu"]')
        .selectOption('lunes');
    
    await expect
        .poll(() => read(p(server.home, '.cloudcmd.json')).catch(() => ''))
        .toContain('"menu": "lunes"');
});

test.describe('--menu lunes', () => {
    test.use({
        flags: ['--menu', 'lunes'],
    });
    
    test('CFG-06: the menu list shows lunes', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        await expect(
            getModal(page).locator('[data-name="js-menu"]'),
        ).toHaveValue('lunes');
    });
});

const trackRequests = (page, name) => {
    const urls = [];
    
    page.on('request', (request) => {
        if (request.url().includes(name))
            urls.push(request.url());
    });
    
    return urls;
};

test('CFG-07: the default engine does not request putout.js', async ({page}) => {
    const urls = trackRequests(page, 'putout.js');
    
    await open(page);
    await page.keyboard.press('F10');
    await expect(
        getModal(page).locator('form.config'),
    ).toBeVisible();
    
    expect(urls).toHaveLength(0);
});

test.describe('--engine putout', () => {
    test.use({
        flags: ['--engine', 'putout'],
    });
    
    test('CFG-08: F10 opens the config window', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        await expect(
            getModal(page).locator('form.config'),
        ).toBeVisible();
    });
    
    test('CFG-09: the username field follows the auth checkbox', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        const username = getModal(page).locator('[data-name="js-username"]');
        
        await expect(username).toBeDisabled();
        
        await getModal(page)
            .locator('[data-name="js-auth"]')
            .check();
        
        await expect(username).toBeEnabled();
    });
    
    test('CFG-10: the window has 25 fields', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        await expect(
            getModal(page).locator('form.config [data-name]'),
        ).toHaveCount(25);
    });
    
    test('CFG-11: a changed checkbox is saved to the config file', async ({page, server}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        await getModal(page)
            .locator('[data-name="js-vim"]')
            .check();
        
        await expect
            .poll(() => read(p(server.home, '.cloudcmd.json')).catch(() => ''))
            .toContain('"vim": true');
    });
    
    test('CFG-12: a changed text field is saved to the config file', async ({page, server}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        const name = getModal(page).locator('[data-name="js-name"]');
        
        await name.fill('hello');
        await name.blur();
        
        await expect
            .poll(() => read(p(server.home, '.cloudcmd.json')).catch(() => ''))
            .toContain('"name": "hello"');
    });
    
    test('CFG-17: the config window opens again after Escape', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        await expect(
            getModal(page).locator('form.config'),
        ).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(getModal(page)).toHaveCount(0);
        
        await page.keyboard.press('F10');
        
        await expect(
            getModal(page).locator('form.config'),
        ).toBeVisible();
    });
    
    test('CFG-18: the markup has the value after the change', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        const name = getModal(page).locator('[data-name="js-name"]');
        
        await name.fill('hello');
        await page.keyboard.press('Tab');
        
        await expect(name).toHaveAttribute('value', 'hello');
    });
    
    test('CFG-19: the focus and the typed text stay when another field changes', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        const modal = getModal(page);
        const name = modal.locator('[data-name="js-name"]');
        
        await name.focus();
        await page.keyboard.press('End');
        await page.keyboard.type('abc');
        
        const before = await name.inputValue();
        
        await modal
            .locator('[data-name="js-vim"]')
            .evaluate((element) => {
                element.checked = !element.checked;
                element.dispatchEvent(new Event('change', {
                    bubbles: true,
                }));
            });
        
        await expect(name).toBeFocused();
        await expect(name).toHaveValue(before);
    });
    
    test('CFG-22: both fields follow the auth checkbox in both directions', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        const modal = getModal(page);
        const username = modal.locator('[data-name="js-username"]');
        const password = modal.locator('[data-name="js-password"]');
        
        await expect(password).toBeDisabled();
        
        await modal
            .locator('[data-name="js-auth"]')
            .check();
        
        await expect(username).toBeEnabled();
        await expect(password).toBeEnabled();
        
        await modal
            .locator('[data-name="js-auth"]')
            .uncheck();
        
        await expect(username).toBeDisabled();
        await expect(password).toBeDisabled();
    });
    
    test('CFG-26: the select shows the engine putout', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        await expect(getEngineSelect(page)).toHaveValue('putout');
    });
    
    test('CFG-27: the engine rendy works when the window opens again', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        await selectEngine(page, 'rendy');
        await reopen(page);
        
        const name = getModal(page).locator('[data-name="js-name"]');
        const before = await name.getAttribute('value');
        
        await name.fill('hello');
        await page.keyboard.press('Tab');
        
        await expect(name).toHaveAttribute('value', before);
    });
    
    test('CFG-14: putout.js is requested one time', async ({page}) => {
        const urls = trackRequests(page, 'putout.js');
        
        await open(page);
        await page.keyboard.press('F10');
        await expect(
            getModal(page).locator('form.config'),
        ).toBeVisible();
        
        expect(urls.filter(isPutoutModule)).toHaveLength(1);
    });
});

test('CFG-20: the default engine does not change the markup after the change', async ({page}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    const name = getModal(page).locator('[data-name="js-name"]');
    const before = await name.getAttribute('value');
    
    await name.fill('hello');
    await page.keyboard.press('Tab');
    
    await expect(name).toHaveAttribute('value', before);
});

test('CFG-21: the default engine: the fields follow the auth checkbox', async ({page}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    const modal = getModal(page);
    const username = modal.locator('[data-name="js-username"]');
    const password = modal.locator('[data-name="js-password"]');
    
    await expect(username).toBeDisabled();
    await expect(password).toBeDisabled();
    
    await modal
        .locator('[data-name="js-auth"]')
        .check();
    
    await expect(username).toBeEnabled();
    await expect(password).toBeEnabled();
    
    await modal
        .locator('[data-name="js-auth"]')
        .uncheck();
    
    await expect(username).toBeDisabled();
});

test('CFG-23: the window has the select of the engine with two choices', async ({page}) => {
    await open(page);
    await page.keyboard.press('F10');
    
    await expect(getEngineSelect(page)).toHaveValue('rendy');
    await expect(
        getEngineSelect(page).locator('option'),
    ).toHaveText(['rendy', 'putout']);
});

test('CFG-24: a chosen engine is saved to the config file', async ({page, server}) => {
    await open(page);
    await page.keyboard.press('F10');
    await selectEngine(page, 'putout');
    
    await expect
        .poll(() => read(p(server.home, '.cloudcmd.json')).catch(() => ''))
        .toContain('"engine": "putout"');
});

test('CFG-25: the engine putout works when the window opens again', async ({page}) => {
    const urls = trackRequests(page, 'putout.js');
    
    await open(page);
    await page.keyboard.press('F10');
    await selectEngine(page, 'putout');
    await reopen(page);
    
    const name = getModal(page).locator('[data-name="js-name"]');
    
    await name.fill('hello');
    await page.keyboard.press('Tab');
    
    await expect(name).toHaveAttribute('value', 'hello');
    expect(urls.filter(isPutoutModule)).toHaveLength(1);
});

test.describe('--engine putout --no-config-auth --no-config-port', () => {
    test.use({
        flags: [
            '--engine',
            'putout',
            '--no-config-auth',
            '--no-config-port',
        ],
    });
    
    test('CFG-13: 4 items are hidden', async ({page}) => {
        await open(page);
        await page.keyboard.press('F10');
        
        await expect(
            getModal(page).locator('form.config li[hidden]'),
        ).toHaveCount(4);
    });
});

test.describe('--engine putout --menu supermenu', () => {
    test.use({
        flags: [
            '--engine',
            'putout',
            '--menu',
            'supermenu',
        ],
    });
    
    test('CFG-15: putout.js is not requested until the config window opens', async ({page}) => {
        const urls = trackRequests(page, 'putout.js');
        
        await open(page);
        
        expect(urls).toHaveLength(0);
    });
    
    test('CFG-16: putout.js is requested one time when the config window opens', async ({page}) => {
        const urls = trackRequests(page, 'putout.js');
        
        await open(page);
        await page.keyboard.press('F10');
        await expect(
            getModal(page).locator('form.config'),
        ).toBeVisible();
        
        expect(urls.filter(isPutoutModule)).toHaveLength(1);
    });
});
