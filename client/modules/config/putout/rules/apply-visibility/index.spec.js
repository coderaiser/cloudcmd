import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-visibility', rule],
    ],
});

test('cloudcmd: common: config-form: apply-visibility: hidden: transform', (t) => {
    t.transformWithOptions('hidden', {
        config: {
            configAuth: false,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-visibility: visible: transform', (t) => {
    t.transformWithOptions('visible', {
        config: {
            configAuth: true,
        },
    });
    t.end();
});

test('cloudcmd: common: config-form: apply-visibility: no mark: no transform', (t) => {
    t.noTransformWithOptions('no-mark', {
        config: {
            configAuth: false,
        },
    });
    t.end();
});
