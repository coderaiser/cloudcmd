/* global CloudCmd */

'use strict';

const exec = require('execon');
const currify = require('currify/legacy');

const load = require('../dom/load');

const {MAX_FILE_SIZE: maxSize} = require('../../common/cloudfunc');
const {time, timeEnd} = require('../../common/util');

CloudCmd.Edit = EditProto;

function EditProto(callback) {
    const Name = 'Edit';
    const EditorName = CloudCmd.config('editor');
    const loadFiles = currify(_loadFiles);
    
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
    
    const Edit = exec.bind();
    
    function init(callback) {
        const element = createElement();
        
        exec.series([
            CloudCmd.View,
            loadFiles(element)
        ], callback);
    }
    
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
    
    Edit.show = (options) => {
        if (Loading)
            return;
         
        CloudCmd.View.show(Element, initConfig(options));
        
        Edit.getEditor()
            .setOptions({
                fontSize: 16,
            });
        
        return Edit;
    };
    
    Edit.getEditor = () => {
        return editor;
    };
    
    Edit.getElement = () => {
        return Element;
    };
    
    Edit.hide = () => {
        CloudCmd.View.hide();
        return Edit;
    };
    
    function _loadFiles(element, callback) {
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
                
                exec(callback);
            });
        });
    }
    
    init(callback);
    
    return Edit;
}

