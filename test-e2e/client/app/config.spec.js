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
