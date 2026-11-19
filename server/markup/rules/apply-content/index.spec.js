import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-content', rule],
    ],
});

const withData = (data, raw) => ({
    data,
    raw,
});

test('cloudcmd: server: markup: apply-content: text: transform', (t) => {
    t.transformWithOptions('text', withData({
        title: 'a<b',
    }, []));
    t.end();
});

test('cloudcmd: server: markup: apply-content: raw: transform', (t) => {
    t.transformWithOptions('raw', withData({
        fm: '<b>x</b>',
    }, ['fm']));
    t.end();
});

test('cloudcmd: server: markup: apply-content: script: transform', (t) => {
    t.transformWithOptions('script', withData({
        config: '{"a":1}',
    }, ['config']));
    t.end();
});

test('cloudcmd: server: markup: apply-content: guard: text: transform', (t) => {
    t.transformWithOptions('guard-text', withData({
        fm: 'classNames.js',
    }, ['fm']));
    t.end();
});

test('cloudcmd: server: markup: apply-content: guard: script: transform', (t) => {
    t.transformWithOptions('guard-script', withData({
        config: '{"a":"className"}',
    }, ['config']));
    t.end();
});

test('cloudcmd: server: markup: apply-content: again: transform', (t) => {
    t.transformWithOptions('again', withData({
        fm: '{title}',
        title: 'x',
    }, ['fm']));
    t.end();
});

test('cloudcmd: server: markup: apply-content: unknown: no transform', (t) => {
    t.noTransformWithOptions('unknown', withData({
        title: 'x',
    }, []));
    t.end();
});

test('cloudcmd: server: markup: apply-content: no templates: no transform', (t) => {
    t.noTransformWithOptions('no-templates', withData({
        prefix: '/p',
    }, []));
    t.end();
});
