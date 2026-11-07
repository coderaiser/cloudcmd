import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getDialog,
    exists,
    list,
    p,
} from './helper.js';

test('PCK-01: Alt+F5 packs a directory', async ({page, server}) => {
    await open(page);
    await select(page, 'dir1');
    await page.keyboard.press('Alt+F5');
    
    await expect
        .poll(async () => (await list(server.root)).some((name) => name.startsWith('dir1.') && name !== 'dir1'))
        .toBe(true);
});

test('PCK-02: Alt+F9 extracts an archive', async ({page, server}) => {
    await open(page);
    await select(page, 'archive.zip');
    await page.keyboard.press('Alt+F9');
    
    // test/fixture/pack.zip contains one file named "pack".
    await expect
        .poll(() => exists(p(server.root, 'pack')))
        .toBe(true);
});

test('PCK-03: Alt+F9 on a bad archive does not extract anything', async ({page, server}) => {
    await open(page);
    const rootBefore = await list(server.root);
    await select(page, 'bad.zip');
    await page.keyboard.press('Alt+F9');
    
    await page.waitForLoadState('networkidle');
    await expect(
        getDialog(page).or(page.locator('.fm')),
    ).toBeVisible();
    const result = await list(server.root);
    
    expect(result.join()).toBe(rootBefore.join());
});
