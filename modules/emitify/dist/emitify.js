(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Emitify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"emitify":[function(require,module,exports){
'use strict';

module.exports = Emitify;

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
        callback.apply(null, arguments);
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

Emitify.prototype.removeAllListeners = function(event) {
    this._check(event);
    this._all[event] = [];
    
    return this;
};


},{}]},{},["emitify"])("emitify")
});