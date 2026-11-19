import {render as renderLayer} from '#common/render';
import * as applyVisibility from './rules/apply-visibility/index.js';
import * as applyContent from './rules/apply-content/index.js';
import * as applyAttribute from './rules/apply-attribute/index.js';

const rules = [
    ['markup/apply-visibility', applyVisibility],
    ['markup/apply-content', applyContent],
    ['markup/apply-attribute', applyAttribute],
];

const raw = [
    'columns',
    'themes',
    'fm',
    'config',
];

export const render = (config, template, data) => renderLayer(template, {
    rules,
    options: {
        config,
        data,
        raw,
    },
});
