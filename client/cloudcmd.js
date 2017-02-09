'use strict';

window.CloudCmd = (config) => {
    window.Util = require('../common/util');
    window.CloudFunc = require('../common/cloudfunc');
    window.DOM = require('./dom');
    
    require('./events');
    require('./storage');
    require('./files');
    require('./rest');
    require('./load');
    require('./notify');
    require('./dialog');
    
    window.CloudCmd = require('./client');
    
    require('./buffer');
    require('./listeners');
    require('./key');
    require('./directory');
    require('./sort');
    
    window.exec = require('execon');
    window.rendy = require('rendy');
    
    const modules = '/modules/';
    
    var moduleFiles = [
        window.Promise ? '' : 'promise-polyfill/promise.min',
    ].filter((name) => {
        return name;
    }).map((name) => {
        return modules + name;
    });
    
    const allFiles = moduleFiles
        .concat('/join/join')
        .map((name) => `${name}.js`);
    
    const urlFiles = getJoinURL(allFiles);
    
    const prefix = getPrefix(config.prefix);
    
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
    var script = document.createElement('script');
    
    script.src = url;
    script.async = true;
    
    script.addEventListener('load', function load(event) {
        callback(event);
        script.removeEventListener('load', load);
    });
    
    document.body.appendChild(script);
}

function getJoinURL(names) {
    const prefix = '/join:';
    const url = prefix + names.join(':');
    
    return url;
}

