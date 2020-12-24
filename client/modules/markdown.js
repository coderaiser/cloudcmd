/* global CloudCmd */

CloudCmd.Markdown = exports;

import createElement from '@cloudcmd/create-element';

import Images from '../dom/images.js';
import {Markdown} from '../dom/rest.js';
import {alert} from '../dom/dialog.js';

export const init = async () => {
    Images.show.load('top');
    await CloudCmd.View();
};

export const hide = () => {
    CloudCmd.View.hide();
};

export async function show(name, options = {}) {
    const relativeQuery = '?relative';
    const {
        positionLoad,
        relative,
    } = options;
    
    Images.show.load(positionLoad);
    
    if (relative)
        name += relativeQuery;
    
    const [error, innerHTML] = await Markdown.read(name);
    Images.hide();
    
    if (error)
        return alert(error.message, {
            cancel: false,
        });
    
    const className = 'help';
    const div = createElement('div', {
        className,
        innerHTML,
    });
    
    CloudCmd.View.show(div);
}

