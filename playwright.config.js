import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './test-e2e',
    testMatch: 'client/**/*.js',
    timeout: 30_000,
    workers: 1,
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3002',
        headless: true,
    },
    webServer: {
        command: 'node bin/cloudcmd.js --no-auth --port 3002 --root test-e2e/client/fixture --no-open',
        url: 'http://localhost:3002',
        reuseExistingServer: false,
        timeout: 15_000,
    },
});
