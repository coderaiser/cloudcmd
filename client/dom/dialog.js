'use strict';

module.exports = Dialog;

const sm = require('smalltalk');
const smNative = require('smalltalk/native');

function Dialog(prefix, config) {
    if (!(this instanceof Dialog))
        return new Dialog(prefix, config);
    
    const {htmlDialogs} = config;
    const smalltalk = htmlDialogs ? sm : smNative;
    
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

