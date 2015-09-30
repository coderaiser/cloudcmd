(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports = Smalltalk();
    else
        global.smalltalk = Smalltalk();
        
    
    function Smalltalk() {
        if (!(this instanceof Smalltalk))
            return new Smalltalk();
        
        this.alert          = (title, message) => {
            let promise = new Promise(function(resolve) {
                alert(message);
                resolve();
            });
            
            return promise;
        };
        
        this.prompt         = (title, message, value, options) => {
            let o       = options,
                promise = new Promise(function(resolve, reject) {
                    let noCancel = o && !o.cancel,
                        result  = prompt(message, value);
                    
                    if (result !== null)
                        resolve(result);
                    else if (!noCancel)
                        reject();
                });
            
            return promise;
        };
        
        this.confirm         = (title, message, options) => {
            let o           = options,
                noCancel    = o && !o.noCancel,
                promise     = new Promise(function(resolve, reject) {
                    let is = confirm(message);
                    
                    if (is)
                        resolve();
                    else if (!noCancel)
                        reject();
                });
            
            return promise;
        };
    }
    
})(typeof window !== 'undefined' && window);
