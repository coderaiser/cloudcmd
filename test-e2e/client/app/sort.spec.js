import {test, expect} from './fixtures.js';
import {open, getLeft} from './helper.js';

const header = (page, name) => getLeft(page).locator(`[data-name="js-fm-header"] [data-name="js-${name}"]`);

const names = (page) => getLeft(page)
    .locator('.files li .name')
    .allTextContents();

const before = (list, a, b) => list.indexOf(a) < list.indexOf(b);

// Wait until the list changes, then return the new list.
const changed = async (page, old) => {
    await expect
        .poll(() => names(page))
        .not
        .toEqual(old);
    return await names(page);
};

test('SRT-01: a second click on the name header reverses the order', async ({page}) => {
    await open(page);
    
    const start = await names(page);
    
    await header(page, 'name').click();
    const first = await changed(page, start);
    
    await header(page, 'name').click();
    const second = await changed(page, first);
    
    expect(before(first, 'data.json', 'edit.txt')).not.toBe(before(second, 'data.json', 'edit.txt'));
});

test('SRT-02: a click on the size header sorts by size', async ({page}) => {
    await open(page);
    
    const start = await names(page);
    
    await header(page, 'size').click();
    const first = await changed(page, start);
    
    await header(page, 'size').click();
    const second = await changed(page, first);
    
    // view.png is the biggest file. a.txt is the smallest.
    expect(before(first, 'view.png', 'a.txt')).not.toBe(before(second, 'view.png', 'a.txt'));
});

test('SRT-03: Ctrl+F6 sorts by size', async ({page}) => {
    await open(page);
    
    const start = await names(page);
    await page.keyboard.press('Control+F6');
    
    await changed(page, start);
});
