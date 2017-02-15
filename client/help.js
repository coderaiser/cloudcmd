'use strict';

/* global CloudCmd */

CloudCmd.Help = HelpProto;

function HelpProto() {
    Images.show.load('top');
    show();
    
    return exports;
}

const {Images} = require('./dom');

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

