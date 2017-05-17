'use strict';

window.Promise = window.Promise || require('es6-promise');

exports.alert = (title, message) => {
    const promise = new Promise((resolve) => {
        alert(message);
        resolve();
    });
    
    return promise;
};

exports.prompt = (title, message, value, options) => {
    const o = options;
    const promise = new Promise((resolve, reject) => {
        const noCancel = o && !o.cancel;
        const result = prompt(message, value);
        
        if (result !== null)
            return resolve(result);
        
        if (!noCancel)
            reject();
    });
    
    return promise;
};

exports.confirm = (title, message, options) => {
    const o = options;
    const noCancel = o && !o.cancel;
    const promise = new Promise((resolve, reject) => {
        const is = confirm(message);
        
        if (is || noCancel)
            return resolve();
        
        reject();
    });
    
    return promise;
};

