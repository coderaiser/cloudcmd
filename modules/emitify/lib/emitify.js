(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports = Emitify;
    else
        global.Emitify = Emitify;
        
    function Emitify() {
        if (this instanceof Emitify)
            this._all = {};
        else
            return new Emitify();
    }
    
    Emitify.prototype._check = function(event, callback) {
        var isTwo = arguments.length === 2;
        
        if (typeof event !== 'string')
            throw Error('event should be string!');
        
        if (isTwo && typeof callback !== 'function')
            throw Error('callback should be function!');
    };
    
    Emitify.prototype.on   = function(event, callback) {
        var funcs = this._all[event];
        
        this._check(event, callback);
        
        if (funcs)
            funcs.push(callback);
        else
            this._all[event] = [callback];
        
        return this;
    };
    
    Emitify.prototype.addListener =
    Emitify.prototype.on;
    
    Emitify.prototype.once  = function(event, callback) {
        var self = this;
        
        self._check(event, callback);
        
        self.on(event, function fn() {
            callback();
            self.off(event, fn);
        });
        
        return this;
    };
    
    Emitify.prototype.off   = function(event, callback) {
        var events  = this._all[event] || [],
            index   = events.indexOf(callback);
        
        this._check(event, callback);
        
        while (~index) {
            events.splice(index, 1);
            index = events.indexOf(callback);
        }
        
        return this;
    };
    
    Emitify.prototype.removeListener    =
    Emitify.prototype.off;
    
    Emitify.prototype.emit = function(event) {
        var args    = [].slice.call(arguments, 1),
            funcs   = this._all[event];
        
        this._check(event);
        
        if (funcs)
            funcs.forEach(function(fn) {
                fn.apply(null, args);
            });
        else if (event === 'error')
            throw args[0];
        
        return this;
    };
    
})(this);
