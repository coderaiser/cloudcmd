import path from 'node:path';
import {test, expect} from './fixtures.js';
import {open} from './helper.js';

// TRM-03 needs a pseudo terminal (gritty).
// If the CI image has no PTY, change "test" to "test.fixme" for TRM-03 only.
test('TRM-01: the backquote key opens the console', async ({page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
});

test('TRM-02: the console runs a command', async ({page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
    
    await page.keyboard.type('echo e2e-ok');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.console')).toContainText('e2e-ok');
});

test.describe('terminal', () => {
    test.use({
        flags: ['--terminal', '--terminal-path', path.resolve('node_modules/gritty')],
    });
    
    test('TRM-03: Shift+Backquote opens the terminal', async ({page}) => {
        await open(page);
        await page.keyboard.press('Shift+Backquote');
        
        await expect(page.locator('.xterm')).toBeVisible();
    });
});

test('TRM-04: Escape closes the console', async ({page}) => {
    await open(page);
    await page.keyboard.press('Backquote');
    await expect(page.locator('.jqconsole-prompt')).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.locator('.jqconsole-prompt')).toBeHidden();
});
