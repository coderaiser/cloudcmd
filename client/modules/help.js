import * as Images from '#dom/images';

const {CloudCmd} = globalThis;

CloudCmd.Help = {
    init,
    show,
    hide,
};

export function init() {
    Images.show.load('top');
}

export function show() {
    const positionLoad = 'top';
    const relative = true;
    
    CloudCmd.Markdown.show('/HELP.md', {
        positionLoad,
        relative,
    });
}

export function hide() {
    CloudCmd.View.hide();
}
