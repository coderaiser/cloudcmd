(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.itype = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"itype":[function(require,module,exports){
'use strict';

module.exports = new TypeProto();

function TypeProto() {
    /**
     * get type of variable
     *
     * @param variable
     */
    function type(variable) {
        var regExp = /\s([a-zA-Z]+)/;
        var str = {}.toString.call(variable);
        var typeBig = str.match(regExp)[1];
        var result = typeBig.toLowerCase();
        
        return result;
    }
    
    /**
     * functions check is variable is type of name
     *
     * @param variable
     */
    function typeOf(name, variable) {
        return type(variable) === name;
    }
    
    function typeOfSimple(name, variable) {
        return typeof variable === name;
    }
    
    ['arrayBuffer', 'file', 'array', 'object']
        .forEach(function (name) {
            type[name] = typeOf.bind(null, name);
        });
    
    ['null', 'string', 'undefined', 'boolean', 'number', 'function']
        .forEach(function (name) {
            type[name] = typeOfSimple.bind(null, name);
        });
    
    return type;
}


},{}]},{},["itype"])("itype")
});