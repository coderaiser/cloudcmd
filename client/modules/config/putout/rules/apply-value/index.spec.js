import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-value', rule],
    ],
});

test('cloudcmd: common: config-form: apply-value: string: transform', (t) => {
    t.transformWithOptions('string', {
        config: {
            name: 'cloud',
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-value: number: transform', (t) => {
    t.transformWithOptions('number', {
        config: {
            name: 8000,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-value: escape: transform', (t) => {
    t.transformWithOptions('escape', {
        config: {
            name: '<a href="x">&</a>',
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-value: null: no transform', (t) => {
    t.noTransformWithOptions('null', {
        config: {
            name: null,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-value: no attribute: transform', (t) => {
    t.transformWithOptions('no-attribute', {
        config: {
            name: 'cloud',
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-value: checkbox: no transform', (t) => {
    t.noTransformWithOptions('checkbox', {
        config: {
            vim: true,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-value: not input: no transform', (t) => {
    t.noTransformWithOptions('not-input', {
        config: {
            name: 'a',
        },
    });
    t.end();
});
