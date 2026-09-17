import { test, expect } from '@playwright/test';

test.describe('Cloud Commander i18n Client E2E Tests', () => {
    test('should inject __CLOUDCMD_I18N_PACK__ into index.html during bootstrap', async ({ page }) => {
        // 1. Przejście na stronę główną (adres pobierany automatycznie z baseURL Playwrighta)
        await page.goto('/');
        
        // 2. Weryfikacja czy obiekt i18n istnieje w oknie przeglądarki
        const i18nPack = await page.evaluate(() => window.__CLOUDCMD_I18N_PACK__);
        
        expect(i18nPack).toBeDefined();
    });
});
