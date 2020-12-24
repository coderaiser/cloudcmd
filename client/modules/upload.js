/* global CloudCmd, DOM */

import Files from '../dom/files.js';
import Images from '../dom/images.js';
import uploadFiles from '../dom/upload-files.js';
import createElement from '@cloudcmd/create-element';

CloudCmd.Upload = {
    init,
    show,
    hide,
};

export async function init() {
    Images.show.load('top');
    await CloudCmd.View();
}

export async function show() {
    Images.show.load('top');
    
    const innerHTML = await Files.get('upload');
    const autoSize = true;
    
    const el = createElement('div', {
        innerHTML,
    });
    
    CloudCmd.View.show(el, {
        autoSize,
        afterShow,
    });
    
    const fontFamily = [
        '"Droid Sans Mono"',
        '"Ubuntu Mono"',
        '"Consolas"',
        'monospace',
    ].join(', ');
    
    createElement('style', {
        dataName: 'upload-css',
        innerText: `[data-name=js-upload-file-button] {
                      font-family: ${fontFamily};
                      font-size: 16px;
                      margin: 10px 0 10px 0;
                   }`,
    });
}

export function hide() {
    CloudCmd.View.hide();
}

function afterShow() {
    const button = DOM.getByDataName('js-upload-file-button');
    
    Images.hide();
    
    DOM.Events.add('change', button, ({target}) => {
        const {files} = target;
        
        hide();
        
        uploadFiles(files);
    });
}

