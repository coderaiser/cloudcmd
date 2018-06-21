/* global CloudCmd */

'use strict';

const {promisify} = require('es6-promisify');

const load = require('../dom/load');

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
    }
};

module.exports.init = async () => {
    const element = createElement();
    
    await CloudCmd.View();
    await loadFiles(element);
};

function createElement() {
    const element = load({
        name: 'div',
        style:
            'width      : 100%;'                +
            'height     : 100%;'                +
            'font-family: "Droid Sans Mono";'   +
            'position   : absolute;',
        notAppend: true
    });
    
    Element = element;
    
    return element;
}

function checkFn(name, fn) {
    if (typeof fn !== 'function')
        throw Error(name + ' should be a function!');
}

function initConfig(options = {}) {
    const config = Object.assign({}, options, ConfigView);
    
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

const loadFiles = promisify((element, callback) => {
    const socketPath = CloudCmd.PREFIX;
    const prefix = socketPath + '/' + EditorName;
    const url = prefix + '/' + EditorName + '.js';
    
    time(Name + ' load');
    
    load.js(url, () => {
        const word = window[EditorName];
        const options = {
            maxSize,
            prefix,
            socketPath,
        };
        
        word(element, options, (ed) => {
            timeEnd(Name + ' load');
            editor  = ed;
            Loading = false;
            
            callback();
        });
    });
});

