/* global CloudCmd */

import {promisify} from 'es6-promisify';
import tryToCatch from 'try-to-catch';
import createElement from '@cloudcmd/create-element';
import load from 'load.js';
const loadJS = load.js;

import {MAX_FILE_SIZE as maxSize} from '../../common/cloudfunc.js';
import {time, timeEnd} from '../../common/util.js';

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

export const init = async () => {
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

export const show = (options) => {
    if (Loading)
        return;
    
    CloudCmd.View.show(Element, initConfig(options));
    
    getEditor()
        .setOptions({
            fontSize: 16,
        });
};

export function getEditor() {
    return editor;
}

export const getElement = () => {
    return Element;
};

export const hide = () => {
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

