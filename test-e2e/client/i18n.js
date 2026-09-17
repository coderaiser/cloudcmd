import { test, expect } from '@playwright/test';
import createServer from '../server/createServer.js';

test.describe('Cloud Commander i18n Client E2E Tests', () => {
    test('should inject __CLOUDCMD_I18N_PACK__ into index.html during bootstrap', async ({ page }) => {
        // 1. Uruchomienie instancji serwera testowego
        const server = await createServer({
            auth: false,
            lang: 'en',
        });
        
        // 2. Pobranie dynamicznego portu przydzielonego przez framework testowy
        const port = server.port;
        const url = `http://localhost:${port}/`;
        
        // 3. Przejście na stronę z flagą oczekiwania na pełny load sieciowy
        await page.goto(url, { waitUntil: 'load' });
        
        // 4. Weryfikacja wstrzykniętego pakietu i18n
        const i18nPack = await page.evaluate(() => window.__CLOUDCMD_I18N_PACK__);
        
        expect(i18nPack).toBeDefined();
        
        await server.close();
    });
});
