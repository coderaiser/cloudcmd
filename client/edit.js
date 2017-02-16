/* global CloudCmd, Util, DOM, CloudFunc */

'use strict';

const exec = require('execon');

CloudCmd.Edit = EditProto;

function EditProto(callback) {
    const Name = 'Edit';
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
    
    const Edit = exec;
    
    function init(callback) {
        const element = createElement();
        
        exec.series([
            CloudCmd.View,
            (callback) => {
                loadFiles(element, callback);
            },
        ], callback);
    }
    
    function createElement() {
        const element = DOM.load({
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
    
    function initConfig(config, options) {
        Object.assign(config, ConfigView);
        
        if (!options)
            return config;
        
        if (options.afterShow) {
            checkFn('options.afterShow', options.afterShow);
            
            const afterShow = config.afterShow;
            
            config.afterShow = () => {
                afterShow();
                options.afterShow();
            };
        }
        
        return config;
    }
    
    Edit.show = (options) => {
        if (Loading)
            return;
         
        CloudCmd.View.show(Element, initConfig(options));
    };
    
    Edit.getEditor = () => {
        return editor;
    };
    
    Edit.getElement = () => {
        return Element;
    };
    
    Edit.hide = () => {
        CloudCmd.View.hide();
    };
    
    function loadFiles(element, callback) {
        const socketPath = CloudCmd.PREFIX;
        const maxSize = CloudFunc.MAX_FILE_SIZE;
        
        const prefix = socketPath + '/' + EditorName;
        const url = prefix + '/' + EditorName + '.js';
        
        Util.time(Name + ' load');
        
        DOM.load.js(url, () => {
            const word = window[EditorName];
            const options = {
                maxSize,
                prefix,
                socketPath,
            };
            
            word(element, options, (ed) => {
                Util.timeEnd(Name + ' load');
                editor  = ed;
                Loading = false;
                
                exec(callback);
            });
        });
    }
    
    init(callback);
    
    return Edit;
}

