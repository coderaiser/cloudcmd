import createElement from '@cloudcmd/create-element';
import * as Images from '#dom/images';
import {Markdown} from '#dom/rest';
import {alert} from '#dom/dialog';

const {CloudCmd} = globalThis;

CloudCmd.Markdown = {
    init,
    show,
    hide,
};

export async function init() {
    Images.show.load('top');
    await CloudCmd.View();
}

export function hide() {
    CloudCmd.View.hide();
}

export async function show(name, options = {}) {
    const {positionLoad, relative} = options;
    
    Images.show.load(positionLoad);
    
    if (relative)
        name += '?relative';
    
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
