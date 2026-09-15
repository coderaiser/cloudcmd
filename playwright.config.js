import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './test-e2e',
    testMatch: '**/*.spec.js',
    timeout: 30_000,
    use: {
        baseURL: 'http://localhost:3002',
        headless: true,
    },
    webServer: {
        command: 'node bin/cloudcmd.js --port 3002 --root test-e2e/fixture --no-open',
        url: 'http://localhost:3002',
        reuseExistingServer: false,
        timeout: 15_000,
    },
});
