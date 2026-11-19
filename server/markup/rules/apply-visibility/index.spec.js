import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-visibility', rule],
    ],
});

const withConfig = (config) => ({
    config,
});

test('cloudcmd: server: markup: apply-visibility: hidden: transform', (t) => {
    t.transformWithOptions('hidden', withConfig({
        console: false,
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-visibility: visible: transform', (t) => {
    t.transformWithOptions('visible', withConfig({
        console: true,
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-visibility: inverted: transform', (t) => {
    t.transformWithOptions('inverted', withConfig({
        oneFilePanel: true,
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-visibility: class name: transform', (t) => {
    t.transformWithOptions('class-name', withConfig({
        keysPanel: false,
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-visibility: no mark: no transform', (t) => {
    t.noTransformWithOptions('no-mark', withConfig({
        console: false,
    }));
    t.end();
});

test('cloudcmd: server: markup: apply-visibility: empty mark: no transform', (t) => {
    t.noTransformWithOptions('empty-mark', withConfig({
        console: false,
    }));
    t.end();
});
