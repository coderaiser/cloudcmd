/* global CloudCmd */

'use strict';

const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');
const createElement = require('@cloudcmd/create-element');
const load = require('load.js');
const loadJS = promisify(load.js);

const {MAX_FILE_SIZE: maxSize} = require('../../common/cloudfunc');
const {time, timeEnd} = require('../../common/util');

const Name = 'Edit';

CloudCmd[Name] = exports;

const EditorName = CloudCmd.config('editor');

let Loading = true;
let Element;
let editor;

const ConfigView = {
    afterShow: () => {
        editor
            .moveCursorTo(0, 0)
            .focus();
    },
};

module.exports.init = async () => {
    const element = create();
    
    await CloudCmd.View();
    await loadFiles(element);
};

function create() {
    const element = createElement('div', {
        style:
            'width      : 100%;' +
            'height     : 100%;' +
            'font-family: "Droid Sans Mono";',
        notAppend: true,
    });
    
    Element = element;
    
    return element;
}

function checkFn(name, fn) {
    if (typeof fn !== 'function')
        throw Error(name + ' should be a function!');
}

function initConfig(options = {}) {
    const config = {
        ...options,
        ...ConfigView,
    };
    
    if (!options.afterShow)
        return config;
    
    checkFn('options.afterShow', options.afterShow);
    
    const afterShow = {config};
    
    config.afterShow = () => {
        afterShow();
        options.afterShow();
    };
    
    return config;
}

module.exports.show = (options) => {
    if (Loading)
        return;
    
    CloudCmd.View.show(Element, initConfig(options));
    
    getEditor()
        .setOptions({
            fontSize: 16,
        });
};

module.exports.getEditor = getEditor;

function getEditor() {
    return editor;
}

module.exports.getElement = () => {
    return Element;
};

module.exports.hide = () => {
    CloudCmd.View.hide();
};

const loadFiles = async (element) => {
    const prefix = `${CloudCmd.prefix}/${EditorName}`;
    const socketPath = CloudCmd.prefix;
    const prefixSocket = `${CloudCmd.prefixSocket}/${EditorName}`;
    const url = `${prefix}/${EditorName}.js`;
    
    time(Name + ' load');
    
    await loadJS(url);
    
    const word = promisify(window[EditorName]);
    const [ed] = await tryToCatch(word, element, {
        maxSize,
        prefix,
        prefixSocket,
        socketPath,
    });
    
    timeEnd(Name + ' load');
    editor = ed;
    Loading = false;
};

