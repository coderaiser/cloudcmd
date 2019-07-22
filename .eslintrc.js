'use strict';

module.exports = {
    env: {
        browser: true,
    },
    rules: {
        'no-console': 0,
    },
    extends: [
        'plugin:putout/recommended',
    ],
    plugins: [
        'putout',
        'node',
    ],
    overrides: [{
        files: ['server'],
        rules: {
            'no-process-exit': 0,
        },
        extends: [
            'plugin:node/recommended',
        ],
    }],
};
