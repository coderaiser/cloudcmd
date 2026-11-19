import {putout} from 'putout';
import currify from 'currify';
import {html} from './html.js';

const toRule = currify((options, [name]) => [name, ['on', options]]);
const toRules = (rules, options) => Object.fromEntries(rules.map(toRule(options)));

export const render = (template, {rules, options, format = html}) => {
    const {code} = putout(format.from(template), {
        rules: toRules(rules, options),
        plugins: rules,
    });
    
    return format.to(code, template);
};
