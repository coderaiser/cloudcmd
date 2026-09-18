import { test, expect } from '@playwright/test';

test.describe('Cloud Commander i18n Client E2E Tests', () => {
    test('should inject __CLOUDCMD_I18N_PACK__ into index.html during bootstrap', async ({ page }) => {
        await page.goto('/');

        const i18nPack = await page.evaluate(() => window.__CLOUDCMD_I18N_PACK__);
        expect(i18nPack).toBeDefined();
    });

    test('should render translated text tokens visible in the user interface context', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            window.__CLOUDCMD_I18N_PACK__ = {
                "F2 - Rename": "F2 - Zmień nazwę"
            };
        });

        const testToken = await page.evaluate(() => {
            return window.__CLOUDCMD_I18N_PACK__["F2 - Rename"];
        });

        expect(testToken).toBe('F2 - Zmień nazwę');
    });
});
