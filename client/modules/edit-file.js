'use strict';

/* global CloudCmd, DOM*/

const Format = require('format-io');
const currify = require('currify/legacy');
const store = require('fullstore/legacy');
const squad = require('squad/legacy');
const fullstore = require('fullstore/legacy');
const exec = require('execon');
const supermenu = require('supermenu');

const call = currify((fn, callback) => {
    fn();
    callback();
});

CloudCmd.EditFile = function EditFileProto(callback) {
    const Info = DOM.CurrentInfo;
    const Dialog = DOM.Dialog;
    const EditFile = exec.bind();
    const config = CloudCmd.config;
    const isFocuse = fullstore();
    
    let Menu;
    
    const TITLE = 'Edit';
    const Images = DOM.Images;
    
    let MSG_CHANGED;
    const ConfigView  = {
        beforeClose: () => {
            exec.ifExist(Menu, 'hide');
            isChanged();
        }
    };
    
    function init(callback) {
        const editor = store();
        
        const getMainEditor = () => CloudCmd.Edit.getEditor();
        const getEditor = squad(editor, getMainEditor);
        const auth = squad(authCheck, editor);
        const listeners = squad(setListeners, editor);
        
        const show = callback ? exec : EditFile.show;
        
        exec.series([
            CloudCmd.Edit,
            call(getEditor),
            call(auth),
            call(listeners),
            show,
        ], callback);
    }
    
    function getName() {
        const {name, isDir} = Info;
        
        if (isDir)
            return `${name}.json`;
        
        return name;
    }
    
    EditFile.show = (options) => {
        const config = Object.assign({}, ConfigView, options);
        
        Images.show.load();
        
        CloudCmd.Edit
            .getEditor()
            .setOption('keyMap', 'default');
        
        Info.getData((error, data) => {
            const path = Info.path;
            const name = getName();
            
            if (error)
                return Images.hide();
            
            setMsgChanged(name);
            
            CloudCmd.Edit
                .getEditor()
                .setValueFirst(path, data)
                .setModeForPath(name)
                .enableKey();
            
            CloudCmd.Edit.show(config);
        });
        
        return CloudCmd.Edit;
    };
    
    EditFile.hide = () => {
        CloudCmd.Edit.hide();
    };
    
    function setListeners(editor) {
        const element = CloudCmd.Edit.getElement();
        
        DOM.Events.addOnce('contextmenu', element, setMenu);
        
        editor.on('save', (value) => {
            DOM.setCurrentSize(Format.size(value));
        });
    }
    
    function authCheck(spawn) {
        spawn.emit('auth', config('username'), config('password'));
        spawn.on('reject', () => {
            Dialog.alert(TITLE, 'Wrong credentials!');
        });
    }
    
    function setMenu(event) {
        const position = {
            x: event.clientX,
            y: event.clientY
        };
        
        event.preventDefault();
        
        if (Menu)
            return;
        
        const editor = CloudCmd.Edit.getEditor();
        const options = {
            beforeShow: (params) => {
                params.x -= 18;
                params.y -= 27;
            },
            
            afterClick: () => {
                editor.focus();
            }
        };
        
        const element = CloudCmd.Edit.getElement();
        
        Menu = supermenu(element, options, getMenuData());
        Menu.show(position.x, position.y);
    }
    
    function getMenuData() {
        return {
            'Save           Ctrl+S' : () => {
                editor.save();
            },
            'Go To Line     Ctrl+G' : () => {
                editor.goToLine();
            },
            'Cut            Ctrl+X' : () => {
                editor.cutToClipboard();
            },
            'Copy           Ctrl+C' : () => {
                editor.copyToClipboard();
            },
            'Paste          Ctrl+V' : () => {
                editor.pasteFromClipboard();
            },
            'Delete         Del'    : () => {
                editor.remove('right');
            },
            'Select All     Ctrl+A' : () => {
                editor.selectAll();
            },
            'Beautify       Ctrl+B' : () => {
                editor.beautify();
            },
            'Minify         Ctrl+M' : () => {
                editor.minify();
            },
            'Close          Esc'    : () => {
                EditFile.hide();
            }
        };
    };
    
    function setMsgChanged(name) {
        MSG_CHANGED = 'Do you want to save changes to ' + name + '?';
    }
    
    function isChanged() {
        const editor = CloudCmd.Edit.getEditor();
        const is = editor.isChanged();
        
        if (!is)
            return;
        
        const cancel = false;
        Dialog.confirm(TITLE, MSG_CHANGED, {cancel})
            .then(() => {
                editor.save();
            });
    }
    
    init(callback);
    
    return EditFile;
};

