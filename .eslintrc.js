'use strict';

module.exports = {
    extends: [
        'plugin:putout/recommended',
    ],
    plugins: [
        'putout',
        'node',
    ],
    rules: {
        'key-spacing': 'off',
    },
    overrides: [{
        files: ['bin/release.js'],
        rules: {
            'no-console': 'off',
            'node/shebang': 'off',
        },
        extends: [
            'plugin:node/recommended',
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
            'plugin:node/recommended',
        ],
    }, {
        files: ['{client,common,static}/**/*.js'],
        env: {
            browser: true,
        },
    }],
};
