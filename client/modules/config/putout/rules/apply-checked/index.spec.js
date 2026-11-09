import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-checked', rule],
    ],
});

test('cloudcmd: common: config-form: apply-checked: on: transform', (t) => {
    t.transformWithOptions('on', {
        config: {
            vim: true,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-checked: off: no transform', (t) => {
    t.noTransformWithOptions('off', {
        config: {
            vim: false,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-checked: not checkbox: no transform', (t) => {
    t.noTransformWithOptions('not-checkbox', {
        config: {
            name: 'a',
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-checked: not input: no transform', (t) => {
    t.noTransformWithOptions('not-input', {
        config: {
            vim: true,
        },
    });
    t.end();
});
