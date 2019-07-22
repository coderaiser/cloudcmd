'use strict';

module.exports = {
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
    }, {
        files: ['client', 'static'],
        env: {
            browser: true,
        },
    }],
};
