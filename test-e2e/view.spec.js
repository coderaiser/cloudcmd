import {test, expect} from '@playwright/test';

const getModal = (page) => page.locator('[data-name="modal-main"]');
const getFile = (page, name) => page
    .locator(`[data-name="js-file-${btoa(name)}"]`)
    .first();

test('F3 on a .png file opens the image viewer', async ({page}) => {
    await page.goto('/');
    await getFile(page, 'view.png').click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    await expect(modal).toBeVisible();
});

test('F3 on a .png file does not open the text viewer', async ({page}) => {
    await page.goto('/');
    await getFile(page, 'view.png').click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    const modalText = await modal.textContent();
    
    await expect(modalText).not.toContain('PNG');
});

test('double-click on a .png file opens the image viewer', async ({page}) => {
    await page.goto('/');
    await getFile(page, 'view.png').dblclick();
    
    const modal = getModal(page);
    await expect(modal).toBeVisible();
});

test('double-click on a .png file does not open the text viewer', async ({page}) => {
    await page.goto('/');
    await getFile(page, 'view.png').dblclick();
    
    const modal = getModal(page);
    const modalText = await modal.textContent();
    
    await expect(modalText).not.toContain('PNG');
});

test('F3 on a .txt file opens the text viewer', async ({page}) => {
    await page.goto('/');
    await getFile(page, 'copy.txt').click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    await expect(modal).toBeVisible();
});

test('F3 on a .txt file shows file content', async ({page}) => {
    await page.goto('/');
    await getFile(page, 'copy.txt').click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    const modalText = await modal.textContent();
    
    await expect(modalText.length).toBeGreaterThan(0);
});
