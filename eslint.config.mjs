import {safeAlign} from 'eslint-plugin-putout';
import {defineConfig} from 'eslint/config';
import n from 'eslint-plugin-n';
import globals from 'globals';
import {matchToFlat} from '@putout/eslint-flat';

export const match = {
    'bin/release.mjs': {
        'no-console': 'off',
        'n/hashbang': 'off',
    },
    'client/dom/index.js': {
        'no-multi-spaces': 'off',
    },
    '{client,static}/**/*.js': {
        'n/no-extraneous-require': 'off',
        'n/no-unsupported-features/node-builtins': 'off',
    },
    'bin/cloudcmd.js': {
        'no-console': 'off',
    }
};
export default defineConfig([
    safeAlign, {
        ignores: ['**/fixture'],
        rules: {
            'key-spacing': 'off',
            'n/prefer-node-protocol': 'error',
        },
        plugins: {
            n,
        },
    }, {
        files: ['{client,common,static}/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    ...matchToFlat(match),
]);
