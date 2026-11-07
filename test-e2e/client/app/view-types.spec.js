import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getModal,
} from './helper.js';

test('VEW-01: F3 on a .md file shows rendered markdown', async ({page}) => {
    await open(page);
    await select(page, 'note.md');
    await page.keyboard.press('F3');
    
    await expect(
        getModal(page).locator('h1'),
    ).toHaveText('Note title');
});

test('VEW-02: F3 on a .json file shows the JSON text', async ({page}) => {
    await open(page);
    await select(page, 'data.json');
    await page.keyboard.press('F3');
    
    await expect(getModal(page)).toContainText('"answer": 42');
});

test('VEW-03: Escape closes the viewer', async ({page}) => {
    await open(page);
    await select(page, 'data.json');
    await page.keyboard.press('F3');
    await expect(getModal(page)).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(getModal(page)).toHaveCount(0);
});
