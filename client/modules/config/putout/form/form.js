import {getName, getValue} from '../../input.js';
import {render as renderForm} from '../render.js';
import actions from './actions.json' with {
    type: 'json',
};
import {createState} from './state.js';
import {listen} from './listen.js';
import {patch} from './patch.js';

const noop = () => {};

const parse = (html) => {
    const template = document.createElement('template');
    
    template.innerHTML = html;
    
    return template.content;
};

export const attachForm = (element, {config, template, onCommit = noop}) => {
    const state = createState(config);
    const stats = {
        renders: 0,
    };
    
    const draw = () => {
        ++stats.renders;
        
        return renderForm(state.read(), template);
    };
    
    const stop = listen(element, actions, ({target, render}) => {
        const name = getName(target);
        const value = getValue(name, element);
        
        state.commit(name, value);
        
        if (render)
            patch(element, parse(draw()), {
                activeElement: document.activeElement,
            });
        
        onCommit(name, value);
    });
    
    return {
        stop,
        stats,
        set: state.commit,
        read: state.read,
    };
};
