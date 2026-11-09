import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-selected', rule],
    ],
});

test('cloudcmd: common: config-form: apply-selected: dark: transform', (t) => {
    t.transformWithOptions('dark', {
        config: {
            theme: 'dark',
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-selected: unknown: no transform', (t) => {
    t.noTransformWithOptions('unknown', {
        config: {
            theme: 'blue',
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-selected: not option: no transform', (t) => {
    t.noTransformWithOptions('not-option', {
        config: {
            theme: 'dark',
        },
    });
    t.end();
});
