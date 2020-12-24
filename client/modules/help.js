/* global CloudCmd */

CloudCmd.Help = exports;

import Images from '../dom/images.js';

export const init = () => {
    Images.show.load('top');
};

export function show() {
    const positionLoad = 'top';
    const relative = true;
    
    CloudCmd
        .Markdown
        .show('/HELP.md', {
            positionLoad,
            relative,
        });
}

export function hide() {
    CloudCmd.View.hide();
}

