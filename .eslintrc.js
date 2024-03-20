'use strict';

module.exports = {
    extends: [
        'plugin:putout/safe',
    ],
    plugins: [
        'putout',
        'n',
    ],
    rules: {
        'key-spacing': 'off',
        'n/prefer-node-protocol': 'error',
    },
    overrides: [{
        files: ['bin/release.js'],
        rules: {
            'no-console': 'off',
            'n/shebang': 'off',
        },
        extends: [
            'plugin:n/recommended',
        ],
    }, {
        files: ['client/dom/index.js'],
        rules: {
            'no-multi-spaces': 'off',
        },
    }, {
        files: ['bin/cloudcmd.js'],
        rules: {
            'no-console': 'off',
        },
        extends: [
            'plugin:n/recommended',
        ],
    }, {
        files: ['{client,common,static}/**/*.js'],
        env: {
            browser: true,
        },
    }],
};
