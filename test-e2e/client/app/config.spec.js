import {test, expect} from './fixtures.js';
import {
    open,
    getModal,
    read,
    p,
} from './helper.js';

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
    
    await expect(getModal(page).locator('[data-name="js-menu"] option')).toHaveText([
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
        
        await expect(getModal(page).locator('[data-name="js-menu"]')).toHaveValue('lunes');
    });
});
