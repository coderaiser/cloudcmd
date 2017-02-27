/* global CloudCmd */

'use strict';

const itype = require('itype/legacy');
const currify = require('currify/legacy');
const exec = require('execon');

const Storage = require('./storage');
const load = require('./load');
const RESTful = require('./rest');

const Promises = {};
const FILES_JSON = 'config|modules';
const FILES_HTML = 'file|path|link|pathLink|media';
const FILES_HTML_ROOT = 'view/media-tmpl|config-tmpl|upload';
const DIR_HTML = '/tmpl/';
const DIR_HTML_FS = DIR_HTML + 'fs/';
const DIR_JSON = '/json/';
const timeout = getTimeoutOnce(2000);

const get = currify(getFile);
const unaryMap = (array, fn) => array.map((a) => fn(a));

module.exports.get = get;

function getFile(name, callback) {
    const type = itype(name);
    let array;
    
    check(name, callback);
    
    switch(type) {
    case 'string':
        getModule(name, callback);
        break;
    
    case 'array':
        array = unaryMap(name, get);
        
        exec.parallel(array, callback);
        break;
    }
}

function check(name, callback) {
    if (!name)
        throw Error('name could not be empty!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function');
}

function getModule(name, callback) {
    let path;
    
    const regExpHTML = new RegExp(FILES_HTML + '|' + FILES_HTML_ROOT);
    const regExpJSON = new RegExp(FILES_JSON);
    
    const isHTML = regExpHTML.test(name);
    const isJSON = regExpJSON.test(name);
    
    if (!isHTML && !isJSON) {
        showError(name);
    } else if (name === 'config') {
        getConfig(callback);
    } else {
        path = getPath(name, isHTML, isJSON);
        
        getSystemFile(path, callback);
    }
    
}

function getPath(name, isHTML, isJSON) {
    let path;
    const regExp = new RegExp(FILES_HTML_ROOT);
    const isRoot = regExp.test(name);
    
    if (isHTML) {
        if (isRoot)
            path = DIR_HTML + name.replace('-tmpl', '');
        else
            path = DIR_HTML_FS  + name;
        
        path += '.hbs';
    } else if (isJSON) {
        path = DIR_JSON  + name + '.json';
    }
    
    return path;
}

function showError(name) {
    const str = 'Wrong file name: ' + name;
    const error = new Error(str);
    
    throw(error);
}

function getSystemFile(url, callback) {
    const prefix = CloudCmd.PREFIX;
    
    if (!Promises[url])
        Promises[url] = new Promise((success, error) => {
            url = prefix + url;
            
            load.ajax({
                url,
                success,
                error
            });
        });
    
    Promises[url].then((data) => {
        callback(null, data);
    }, (error) => {
        Promises[url] = null;
        callback(error);
    });
}

function getConfig(callback) {
    let is;
    
    if (!Promises.config)
        Promises.config = new Promise((resolve, reject) => {
            is = true;
            RESTful.Config.read((error, data) => {
                if (error)
                    return reject(error);
                
                resolve(data);
            });
        });
    
    Promises.config.then(function(data) {
        is = false;
        Storage.setAllowed(data.localStorage);
        
        callback(null, data);
        
        timeout(() => {
            if (!is)
                Promises.config = null;
        });
    }, function() {
        if (!is)
            Promises.config = null;
    });
}

function getTimeoutOnce(time) {
    let is;
    
    return (callback) => {
        if (is)
            return;
        
        is = true;
        
        setTimeout(() => {
            is = false;
            callback();
        }, time);
    };
}

