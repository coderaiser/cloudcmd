'use strict';

// prevent additional loading of exec by spero, remedy, ishtar, salam, omnes
window.exec = require('execon');

// prevent additional loading of emitify
window.Emitify = require('emitify');

window.CloudCmd = (config) => {
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
    
    const dir = '/dist';
    
    const notEmpty = (a) => a;
    // does not work in development mode
    const moduleFiles = [
        window.Promise ? '' : `${dir}/promise`,
        Object.assign ? '' : `${dir}/object.assign`,
    ].filter(notEmpty);
    
    const allFiles = moduleFiles
        .map((name) => `${name}.js`);
    
    const urlFiles = getJoinURL(allFiles);
    
    createScript(prefix + urlFiles, () => {
        window.CloudCmd.init(prefix, config);
    });
};

function getPrefix(prefix) {
    if (!prefix)
        return '';
   
    if (!prefix.indexOf('/'))
        return prefix;
    
    return '/' + prefix;
}

function createScript(url, callback) {
    const script = document.createElement('script');
    
    script.src = url;
    script.async = true;
    
    script.addEventListener('load', function load() {
        callback();
        script.removeEventListener('load', load);
    });
    
    document.body.appendChild(script);
}

function getJoinURL(names) {
    const prefix = '/join:';
    const url = prefix + names.join(':');
    
    return url;
}

