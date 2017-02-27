/* global CloudCmd */
/* global DOM */
/* global olark */

'use strict';

CloudCmd.Contact = ContactProto;

const exec = require('execon');
const Images = require('../dom/images');

function ContactProto(callback) {
    init(callback);
    
    return exports;
}

const Events = DOM.Events;
const Key = CloudCmd.Key;

module.exports.show = show;
module.exports.hide = hide;

let Inited = false;

function init(callback) {
    if (Inited)
        return;
    
    load(() => {
        Inited = true;
        
        olark.identify('6216-545-10-4223');
        olark('api.box.onExpand', show);
        olark('api.box.onShow', show);
        olark('api.box.onShrink', hide);
        
        exec(callback);
    });
    
    Events.addKey(onKey);
}

function load(callback) {
    const {PREFIX} = CloudCmd;
    const path = `${PREFIX}/modules/olark/olark.min.js`;
    
    Images.show.load('top');
    
    DOM.load.js(path, callback);
}

function show() {
    Key.unsetBind();
    Images.hide();
    
    if (Inited)
        return olark('api.box.expand');
    
    init(show);
}

function hide() {
    Key.setBind();
    olark('api.box.hide');
}

function onKey({keyCode}) {
    if (keyCode === Key.ESC)
        hide();
}

