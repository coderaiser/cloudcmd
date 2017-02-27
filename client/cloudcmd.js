'use strict';

// prevent additional loading of exec by spero, remedy, ishtar, salam, omnes
window.exec = require('execon');

// prevent additional loading of emitify
window.Emitify = require('emitify');

window.CloudCmd = (config) => {
    window.Promise = window.Promise || require('es6-promise');
    window.Util = require('../common/util');
    window.CloudFunc = require('../common/cloudfunc');
    
    const DOM = require('./dom');
    
    window.DOM = DOM;
    window.CloudCmd = require('./client');
    
    const Dialog = require('./dom/dialog');
    
    const prefix = getPrefix(config.prefix);
    const {htmlDialogs} = config;
    
    DOM.Dialog = Dialog(prefix, {
        htmlDialogs
    });
    
    require('./listeners');
    require('./key');
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

