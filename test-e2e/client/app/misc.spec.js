import {writeFile} from 'node:fs/promises';
import {test, expect} from './fixtures.js';
import {
    open,
    select,
    getLeft,
    getFile,
    getModal,
    exists,
    p,
} from './helper.js';

test('MSC-01: upload adds a file', async ({page, server}) => {
    await open(page);
    await getLeft(page).click({
        button: 'right',
    });
    await page
        .locator('ul.menu li', {
            hasText: 'Upload',
        })
        .first()
        .click();
    
    await getModal(page)
        .locator('[data-name="js-upload-file-button"]')
        .setInputFiles({
            name: 'uploaded.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('uploaded\n'),
        });
    
    await expect
        .poll(() => exists(p(server.root, 'uploaded.txt')))
        .toBe(true);
});

test('MSC-02: a path outside the root is not served', async ({request, server}) => {
    const response = await request.get(`${server.url}/api/v1/fs/..%2f..%2f..%2f..%2fetc/passwd`);
    const body = await response.text();
    
    expect(body).not.toContain('root:');
});

test('MSC-03: a missing directory returns an error status', async ({request, server}) => {
    const response = await request.get(`${server.url}/api/v1/fs/no-such-dir`);
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
});

test.describe('vim', () => {
    test.use({
        flags: ['--vim'],
    });
    
    test('MSC-04: j and k move the cursor', async ({page}) => {
        await open(page);
        
        const rows = getLeft(page).locator('.files li');
        
        await page.keyboard.press('j');
        await expect(rows.nth(1)).toHaveClass(/current-file/);
        
        await page.keyboard.press('k');
        await expect(rows.nth(0)).toHaveClass(/current-file/);
    });
});

test('MSC-05: Space on a directory selects it and shows its size', async ({page}) => {
    await open(page);
    await select(page, 'dir1');
    await page.keyboard.press('Space');
    
    const row = getFile(page, 'dir1');
    
    await expect(row).toHaveClass(/selected-file/);
    await expect(row.locator('.size')).not.toHaveText('<dir>');
});

test('MSC-06: Ctrl+R refreshes the panel', async ({page, server}) => {
    await open(page);
    await writeFile(p(server.root, 'late.txt'), 'late\n');
    await expect(getFile(page, 'late.txt')).toHaveCount(0);
    
    await page.keyboard.press('Control+R');
    
    await expect(getFile(page, 'late.txt')).toBeVisible();
});
