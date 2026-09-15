import {test, expect} from '@playwright/test';

const getModal = (page) => page.locator('[data-name="modal-main"]');

test('F3 on a .jpg file opens the image viewer', async ({page}) => {
    await page.goto('/');
    await page
        .getByText('photo.jpg')
        .first()
        .click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    await expect(modal).toBeVisible();
});

test('F3 on a .jpg file does not open the text viewer', async ({page}) => {
    await page.goto('/');
    await page
        .getByText('photo.jpg')
        .first()
        .click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    const modalText = await modal.textContent();
    
    await expect(modalText).not.toContain('JFIF');
});

test('double-click on a .jpg file opens the image viewer', async ({page}) => {
    await page.goto('/');
    await page
        .getByText('photo.jpg')
        .first()
        .dblclick();
    
    const modal = getModal(page);
    await expect(modal).toBeVisible();
});

test('double-click on a .jpg file does not open the text viewer', async ({page}) => {
    await page.goto('/');
    await page
        .getByText('photo.jpg')
        .first()
        .dblclick();
    
    const modal = getModal(page);
    const modalText = await modal.textContent();
    
    await expect(modalText).not.toContain('JFIF');
});

test('F3 on a .txt file opens the text viewer', async ({page}) => {
    await page.goto('/');
    await page
        .getByText('copy.txt')
        .first()
        .click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    await expect(modal).toBeVisible();
});

test('F3 on a .txt file shows file content', async ({page}) => {
    await page.goto('/');
    await page
        .getByText('copy.txt')
        .first()
        .click();
    await page.keyboard.press('F3');
    
    const modal = getModal(page);
    const modalText = await modal.textContent();
    
    await expect(modalText.length).toBeGreaterThan(0);
});
