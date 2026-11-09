import {createTest} from '@putout/test';
import * as rule from './index.js';

const test = createTest(import.meta.url, {
    extension: 'jsx',
    extensionFix: 'jsx',
    plugins: [
        ['apply-enabled', rule],
    ],
});

test('cloudcmd: client: config: putout: apply-enabled: disabled: transform', (t) => {
    t.transformWithOptions('disabled', {
        config: {
            auth: false,
        },
    });
    t.end();
});

test('cloudcmd: client: config: putout: apply-enabled: enabled: no transform', (t) => {
    t.noTransformWithOptions('enabled', {
        config: {
            auth: true,
        },
    });
    t.end();
});

test('cloudcmd: client: config: putout: apply-enabled: no mark: no transform', (t) => {
    t.noTransformWithOptions('no-mark', {
        config: {
            auth: false,
        },
    });
    t.end();
});
