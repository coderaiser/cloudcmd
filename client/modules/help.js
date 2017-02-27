'use strict';

/* global CloudCmd */

CloudCmd.Help = HelpProto;

const Images = require('../dom/images');

function HelpProto() {
    Images.show.load('top');
    show();
    
    return exports;
}

module.exports.show = show;
module.exports.hide = hide;

function show() {
    const positionLoad = 'top';
    const relative = true;
    
    CloudCmd
        .Markdown
        .show('/HELP.md', {
            positionLoad,
            relative,
        });
}

function hide() {
    CloudCmd.View.hide();
}

