/* global DOM */
/* global smalltalk */

'use strict';

module.exports = Dialog;

function Dialog(prefix, config) {
    if (!(this instanceof Dialog))
        return new Dialog(prefix, config);
    
    load(config.htmlDialogs);
    
    function getJsName(htmlDialogs) {
        const is = window.Promise;
        const js = '.min.js';
        const jsName = is ? js : '.poly' + js;
        
        if (!htmlDialogs)
            return '.native' + jsName;
        
        return jsName;
    }
    
    function load(htmlDialogs) {
        const noop = () => {};
        const name = 'smalltalk';
        const dir = '/modules/' + name + '/dist/';
        const jsName = getJsName(htmlDialogs);
        
        const names = [jsName, '.min.css'].map((ext) => {
            return prefix + dir + name + ext;
        });
        
        DOM.load.parallel(names, noop);
    }
    
    const alert = (title, message) => {
        return smalltalk.alert(title, message);
    };
    
    this.alert = alert;
    
    this.prompt = (title, message, value, options) => {
        return smalltalk.prompt(title, message, value, options);
    };
    
    this.confirm = (title, message, options) => {
        return smalltalk.confirm(title, message, options);
    };
    
    this.alert.noFiles = (title) => {
        return alert(title, 'No files selected!');
    };
}

