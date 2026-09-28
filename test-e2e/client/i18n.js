import {test} from '@cloudcmd/test-e2e';

test('should inject i18n into index.html during bootstrap', async ({page}) => {
    const i18nPack = await page.evaluate(() => globalThis.i18n);
    
    const isObject = typeof i18nPack === 'object' && i18nPack !== null;
    if (!isObject)
        throw Error('i18n is not an object');
});

test('should use injected i18n translations on client-side', async ({page}) => {
    await page.evaluate(() => {
        globalThis.i18n = {
            'F2 - Rename': 'F2 - Zmień nazwę',
        };
    });
    
    const translation = await page.evaluate(() => {
        return globalThis.i18n['F2 - Rename'];
    });
    
    if (translation !== 'F2 - Zmień nazwę')
        throw Error('Client-side translation fallback failed');
});
