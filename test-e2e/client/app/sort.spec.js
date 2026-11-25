import {utimes, writeFile} from 'node:fs/promises';
import {test, expect} from './fixtures.js';
import {
    open,
    getLeft,
    p,
} from './helper.js';

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

test.describe('sort by time', () => {
    test.use({
        flags: ['--columns', 'name-size-date-time'],
    });
    
    test('a click on the time header sorts files by time', async ({page, server}) => {
        const late = p(server.root, 'a-late.txt');
        const early = p(server.root, 'z-early.txt');
        
        await writeFile(late, 'late\n');
        await writeFile(early, 'early\n');
        await utimes(
            late,
            new Date(2020,
                0,
                1,
                18,
                0,
                0),
            new Date(2020,
                0,
                1,
                18,
                0,
                0),
        );
        await utimes(
            early,
            new Date(2020,
                0,
                1,
                8,
                0,
                0),
            new Date(2020,
                0,
                1,
                8,
                0,
                0),
        );
        
        await open(page);
        
        const start = await names(page);
        
        await header(page, 'time').click();
        const first = await changed(page, start);
        
        await expect(header(page, 'time')).toHaveText('time↑');
        expect(before(first, 'z-early.txt', 'a-late.txt')).toBe(true);
        
        await header(page, 'time').click();
        const second = await changed(page, first);
        
        await expect(header(page, 'time')).toHaveText('time↓');
        expect(before(second, 'a-late.txt', 'z-early.txt')).toBe(true);
    });
});
