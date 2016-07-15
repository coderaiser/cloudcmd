'use strict';

exports.alert          = (title, message) => {
    const promise = new Promise(function(resolve) {
        alert(message);
        resolve();
    });
    
    return promise;
};

exports.prompt         = (title, message, value, options) => {
    const o     = options,
        promise = new Promise(function(resolve, reject) {
            const noCancel = o && !o.cancel,
                result  = prompt(message, value);
            
            if (result !== null)
                resolve(result);
            else if (!noCancel)
                reject();
        });
    
    return promise;
};

exports.confirm         = (title, message, options) => {
    const o         = options,
        noCancel    = o && !o.noCancel,
        promise     = new Promise(function(resolve, reject) {
            const is = confirm(message);
            
            if (is)
                resolve();
            else if (!noCancel)
                reject();
        });
    
    return promise;
};

