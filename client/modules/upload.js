/* global CloudCmd, DOM */

'use strict';

const load = require('../dom/load');
const Files = require('../dom/files');
const Images = require('../dom/images');
const uploadFiles = require('../dom/upload-files');

module.exports.init = async () => {
    Images.show.load('top');
    await CloudCmd.View();
};

module.exports.show = show;
module.exports.hide = hide;

function show() {
    Images.show.load('top');
    
    Files.get('upload', (error, data) => {
        const autoSize = true;
        
        CloudCmd.View.show(data, {
            autoSize,
            afterShow,
        });
    });
    
    const fontFamily = [
        '"Droid Sans Mono"',
        '"Ubuntu Mono"',
        '"Consolas"',
        'monospace'
    ].join(', ');
    
    load.style({
        id      : 'upload-css',
        inner   : '[data-name=js-upload-file-button] {' +
                      `font-family: ${fontFamily};`     +
                      'font-size: 20px;'                +
                      'width: 97%'                      +
                '}'
    });
}

function hide() {
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

