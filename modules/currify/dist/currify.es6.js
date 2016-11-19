(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.currify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"currify":[function(require,module,exports){
'use strict';

module.exports = currify;

let tail = list => [].slice.call(list, 1);

function currify(fn) {
    check(fn);
    
    let args = tail(arguments);
    
    if (args.length >= fn.length)
        return fn(...args);
    else
        return function() {
            return currify(...[fn, ...args, ...arguments]);
        };
}

function check(fn) {
    if (typeof fn !== 'function')
        throw Error('fn should be function!');
}

},{}]},{},["currify"])("currify")
});