'use strict';

module.exports = {
    extends: [
        'plugin:putout/recommended',
    ],
    plugins: [
        'putout',
        'node',
    ],
    overrides: [{
        files: ['bin/release.js'],
        rules: {
            'no-console': 'off',
            'node/shebang': 'off',
        },
        extends: [
            'plugin:node/recommended',
        ],
    },{
        files: ['bin/cloudcmd.js'],
        rules: {
            'no-console': 'off',
        },
        extends: [
            'plugin:node/recommended',
        ],
    }, {
        files: ['{client,common}/**/*.js'],
        env: {
            browser: true,
        },
    }],
};
