module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
        sourceType: 'module',
        babelOptions: {
            sourceType: 'module',
            plugins: [
                '@babel/plugin-syntax-top-level-await',
            ],
        },
    },
    rules: {
        'node/no-unsupported-features/es-syntax': 'off',
    },
    extends: [
        'plugin:node/recommended',
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
    }, {
        files: ['bin/cloudcmd.js'],
        rules: {
            'no-console': 'off',
        },
    }, {
        files: ['{client,common,static}/**/*.js'],
        env: {
            browser: true,
        },
    }],
};
