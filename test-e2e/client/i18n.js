import { test, expect } from '@playwright/test';
import createServer from '../server/createServer.js';

test.describe('Cloud Commander i18n Server E2E Tests', () => {
    test('should inject __CLOUDCMD_I18N_PACK__ into index.html during bootstrap', async ({ page }) => {
        const server = await createServer({
            auth: false,
            lang: 'en',
        });
        
        const url = `http://localhost:${server.port}`;
        await page.goto(url);
        
        const i18nPack = await page.evaluate(() => window.__CLOUDCMD_I18N_PACK__);
        
        expect(i18nPack).toBeDefined();
        expect(typeof i18nPack).toBe('object');
        
        await server.close();
    });
});
