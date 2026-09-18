import process from 'node:process';
import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './test-e2e',
    timeout: 30_000,
    workers: 1,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    reporter: 'list',
    expect: {
        timeout: 10_000,
    },
    projects: [{
        name: 'default',
        testMatch: 'client/keys/**/*.js',
        use: {
            baseURL: 'http://localhost:3002',
            headless: true,
            video: 'retain-on-failure',
        },
    }, {
        name: 'menu',
        testMatch: 'client/menu/**/*.js',
        testIgnore: 'client/menu/helper.js',
        use: {
            baseURL: 'http://localhost:3003',
            headless: true,
            video: 'retain-on-failure',
        },
    }],
    webServer: [{
        command: 'node bin/cloudcmd.js --no-auth --port 3002 --root test-e2e/client/fixture --no-open',
        url: 'http://localhost:3002',
        reuseExistingServer: false,
        timeout: 15_000,
    }, {
        command: 'node bin/cloudcmd.js --no-auth --port 3003 --root test-e2e/client/fixture --no-open --menu aleman',
        url: 'http://localhost:3003',
        reuseExistingServer: false,
        timeout: 15_000,
    }],
});
