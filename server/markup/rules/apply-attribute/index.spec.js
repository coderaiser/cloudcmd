import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-attribute', rule],
    ],
});

const withData = (data) => ({
    data,
});

test('cloudcmd: server: markup: apply-attribute: transform', (t) => {
    t.transformWithOptions('attribute', withData({
        prefix: '/p',
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-attribute: escape: transform', (t) => {
    t.transformWithOptions('escape', withData({
        prefix: '/"x',
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-attribute: guard: transform', (t) => {
    t.transformWithOptions('guard', withData({
        prefix: '/className',
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-attribute: mixed: transform', (t) => {
    t.transformWithOptions('mixed', withData({
        prefix: '/p',
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-attribute: no templates: no transform', (t) => {
    t.noTransformWithOptions('no-templates', withData({
        prefix: '/p',
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-attribute: no brace: no transform', (t) => {
    t.noTransformWithOptions('no-brace', withData({
        prefix: '/p',
    }));
    t.end();
});
