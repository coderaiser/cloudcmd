import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-choices', rule],
    ],
});

const choices = {
    theme: ['light', 'dark'],
};

test('cloudcmd: client: config: putout: apply-choices: replace: transform', (t) => {
    t.transformWithOptions('replace', {
        choices,
    });
    t.end();
});

test('cloudcmd: client: config: putout: apply-choices: empty: transform', (t) => {
    t.transformWithOptions('empty', {
        choices,
    });
    t.end();
});

test('cloudcmd: client: config: putout: apply-choices: same: no transform', (t) => {
    t.noTransformWithOptions('same', {
        choices,
    });
    t.end();
});

test('cloudcmd: client: config: putout: apply-choices: unknown: no transform', (t) => {
    t.noTransformWithOptions('unknown', {
        choices,
    });
    t.end();
});

test('cloudcmd: client: config: putout: apply-choices: not select: no transform', (t) => {
    t.noTransformWithOptions('not-select', {
        choices,
    });
    t.end();
});
