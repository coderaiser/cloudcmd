'use strict';

/* global CloudCmd */

CloudCmd.Help = exports;

const Images = require('../dom/images');

module.exports.init = () => {
    Images.show.load('top');
};

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

