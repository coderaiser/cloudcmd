/* global CloudCmd */
/* global DOM */
/* global olark */

'use strict';

CloudCmd.Contact = exports;

const {promisify} = require('es6-promisify');

const Images = require('../dom/images');
const loadJS = promisify(require('load.js/legacy').js);

const Events = DOM.Events;
const Key = CloudCmd.Key;

module.exports.show = show;
module.exports.hide = hide;

let Inited = false;

module.exports.init = async () => {
    if (Inited)
        return;
    
    Events.addKey(onKey);
    await load();
    
    Inited = true;
    
    olark.identify('6216-545-10-4223');
    olark('api.box.onExpand', show);
    olark('api.box.onShow', show);
    olark('api.box.onShrink', hide);
};

const load = async () => {
    const {PREFIX} = CloudCmd;
    const path = `${PREFIX}/modules/olark/olark.min.js`;
    
    Images.show.load('top');
    
    await loadJS(path);
};

function show() {
    Key.unsetBind();
    Images.hide();
    
    if (!Inited)
        return;
    
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

