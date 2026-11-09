import {putout} from 'putout';
import {merge} from '@putout/processor-html';
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

export const render = (config, template) => {
    const options = ['on', {
        config,
        choices,
    }];
    
    const {code} = putout(fromHbs(template), {
        rules: {
            'config-form/apply-choices': options,
            'config-form/apply-checked': options,
            'config-form/apply-value': options,
            'config-form/apply-selected': options,
            'config-form/apply-visibility': options,
            'config-form/apply-enabled': options,
        },
        plugins: [
            ['config-form/apply-choices', applyChoices],
            ['config-form/apply-checked', applyChecked],
            ['config-form/apply-value', applyValue],
            ['config-form/apply-selected', applySelected],
            ['config-form/apply-visibility', applyVisibility],
            ['config-form/apply-enabled', applyEnabled],
        ],
    });
    
    return merge('', [code]);
};
