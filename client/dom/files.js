/* global CloudCmd */

'use strict';

const itype = require('itype/legacy');
const currify = require('currify/legacy');
const {promisify} = require('es6-promisify');

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

async function getFile(name) {
    const type = itype(name);
    check(name);
    
    if (type === 'string')
        return getModule(name);
    
    if (type === 'array')
        return Promise.all(unaryMap(name, get));
}

function check(name) {
    if (!name)
        throw Error('name could not be empty!');
}

async function getModule(name) {
    const regExpHTML = new RegExp(FILES_HTML + '|' + FILES_HTML_ROOT);
    const regExpJSON = new RegExp(FILES_JSON);
    
    const isHTML = regExpHTML.test(name);
    const isJSON = regExpJSON.test(name);
    
    if (!isHTML && !isJSON)
        return showError(name);
    
    if (name === 'config')
        return getConfig();
    
    const path = getPath(name, isHTML, isJSON);
    return getSystemFile(path);
}

function getPath(name, isHTML, isJSON) {
    let path;
    const regExp = new RegExp(FILES_HTML_ROOT);
    const isRoot = regExp.test(name);
    
    if (isHTML) {
        if (isRoot)
            path = DIR_HTML + name.replace('-tmpl', '');
        else
            path = DIR_HTML_FS + name;
        
        path += '.hbs';
    } else if (isJSON) {
        path = DIR_JSON + name + '.json';
    }
    
    return path;
}

function showError(name) {
    const str = 'Wrong file name: ' + name;
    const error = new Error(str);
    
    throw error;
}

const getSystemFile = promisify((file, callback) => {
    const {prefix} = CloudCmd;
    
    if (!Promises[file])
        Promises[file] = new Promise((success, error) => {
            const url = prefix + file;
            
            load.ajax({
                url,
                success,
                error,
            });
        });
    
    Promises[file].then((data) => {
        callback(null, data);
    }, (error) => {
        Promises[file] = null;
        callback(error);
    });
});

const getConfig = async () => {
    let is;
    
    if (!Promises.config)
        Promises.config = () => {
            is = true;
            return RESTful.Config.read();
        };
    
    const [, data] = await Promises.config();
    
    if (data)
        is = false;
    
    timeout(() => {
        if (!is)
            Promises.config = null;
    });
    
    return data;
};

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

