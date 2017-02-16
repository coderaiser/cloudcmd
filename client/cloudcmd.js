'use strict';

// prevent additional loading of exec by spero, remedy, ishtar, salam, omnes
window.exec = require('execon');

// prevent additional loading of emitify
window.Emitify = require('emitify');

window.CloudCmd = (config) => {
    window.Promise = window.Promise || require('promise-polyfill');
    Object.assign = Object.assign || require('object.assign');

    window.Util = require('../common/util');
    window.CloudFunc = require('../common/cloudfunc');
    
    const DOM = require('./dom');
    
    window.DOM = DOM;
    window.CloudCmd = require('./client');
    
    const Dialog = require('./dialog');
    
    const prefix = getPrefix(config.prefix);
    const {htmlDialogs} = config;
    
    DOM.Dialog = Dialog(prefix, {
        htmlDialogs
    });
    
    require('./listeners');
    require('./key');
    require('./directory');
    require('./sort');
    
    window.CloudCmd.init(prefix, config);
};

function getPrefix(prefix) {
    if (!prefix)
        return '';
   
    if (!prefix.indexOf('/'))
        return prefix;
    
    return '/' + prefix;
}

