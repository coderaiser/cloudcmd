/* global CloudCmd */
/* global DOM */

'use strict';

CloudCmd.Contact = exports;

const olark = require('@cloudcmd/olark');
const Images = require('../dom/images');

const {Events} = DOM;
const {Key} = CloudCmd;

module.exports.show = show;
module.exports.hide = hide;

module.exports.init = () => {
    Events.addKey(onKey);
    
    olark.identify('6216-545-10-4223');
    olark('api.box.onExpand', show);
    olark('api.box.onShow', show);
    olark('api.box.onShrink', hide);
};

function show() {
    Key.unsetBind();
    Images.hide();
    
    olark('api.box.expand');
}

function hide() {
    Key.setBind();
    olark('api.box.hide');
}

function onKey({keyCode}) {
    if (keyCode === Key.ESC)
        hide();
}

