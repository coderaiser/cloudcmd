import {test, expect} from './fixtures.js';
import {open, getRows} from './helper.js';

const basic = (user, password) => 'Basic ' +
    Buffer
        .from(`${user}:${password}`)
        .toString('base64');

test.use({
    flags: [
        '--auth',
        '--username',
        'e2e',
        '--password',
        'secret',
    ],
});

test('AUT-01: correct credentials show the panel', async ({browser, server}) => {
    const context = await browser.newContext({
        baseURL: server.url,
        httpCredentials: {
            username: 'e2e',
            password: 'secret',
        },
    });
    
    const page = await context.newPage();
    
    await open(page);
    
    await expect(
        getRows(page).first(),
    ).toBeVisible();
    await context.close();
});

test('AUT-02: wrong credentials are rejected', async ({request, server}) => {
    const response = await request.get(server.url, {
        headers: {
            authorization: basic('e2e', 'wrong'),
        },
    });
    
    expect(response.status()).toBe(401);
});

test('AUT-03: no credentials are rejected', async ({request, server}) => {
    const response = await request.get(server.url);
    
    expect(response.status()).toBe(401);
});
