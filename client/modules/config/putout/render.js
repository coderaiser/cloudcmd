import {merge} from '@putout/processor-html';
import {render as renderLayer} from '#common/render';
import * as applyChecked from './rules/apply-checked/index.js';
import * as applyValue from './rules/apply-value/index.js';
import * as applySelected from './rules/apply-selected/index.js';
import * as applyVisibility from './rules/apply-visibility/index.js';
import * as applyChoices from './rules/apply-choices/index.js';
import * as applyEnabled from './rules/apply-enabled/index.js';
import choices from './choices.json' with {
    type: 'json',
};
import {fromHbs} from './from-hbs.js';

const rules = [
    ['config-form/apply-choices', applyChoices],
    ['config-form/apply-checked', applyChecked],
    ['config-form/apply-value', applyValue],
    ['config-form/apply-selected', applySelected],
    ['config-form/apply-visibility', applyVisibility],
    ['config-form/apply-enabled', applyEnabled],
];

const format = {
    from: fromHbs,
    to: (code) => merge('', [code]),
};

export const render = (config, template) => renderLayer(template, {
    rules,
    format,
    options: {
        config,
        choices,
    },
});
