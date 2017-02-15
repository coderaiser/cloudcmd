'use strict';

/* global CloudCmd, DOM, MenuIO */

const Format = require('format-io');

CloudCmd.EditFile = function EditFileProto(callback) {
    const Info = DOM.CurrentInfo;
    const Dialog = DOM.Dialog;
    const EditFile = this;
    const config = CloudCmd.config;
    
    let Menu;
    
    const exec = require('execon');
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
        let editor;
        
        exec.series([
            CloudCmd.Edit,
            (callback) => {
                editor = CloudCmd.Edit.getEditor();
                callback();
            },
            (callback) => {
                authCheck(editor);
                callback();
            },
            
            (callback) => {
                setListeners(editor);
                callback();
            },
            (callback) => {
                EditFile.show(callback);
            },
        ], callback);
    }
    
    function getName() {
        const {name, isDir} = Info;
        
        if (isDir)
            return `${name}.json`;
            
        return name;
    }
    
    this.show = () => {
        Images.show.load();
        
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
                .setOption('fontSize', 16)
                .enableKey();
            
            CloudCmd.Edit.show(ConfigView);
        });
    };
    
    this.hide = () => {
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
        if (!config('auth'))
            return;
        
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
        
        !Menu && DOM.loadRemote('menu', (error) => {
            let noFocus;
            const options = {
                beforeShow: (params) => {
                    params.x -= 18;
                    params.y -= 27;
                },
                
                afterClick: () => {
                    !noFocus && editor.focus();
                }
            };
            
            const editor = CloudCmd.Edit.getEditor();
            
            const menuData = {
                'Save           Ctrl+S' : () => {
                    editor.save();
                },
                'Go To Line     Ctrl+G' : () => {
                    noFocus = true;
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
            
            if (error)
                return Dialog.alert(TITLE, error);
            
            if (Menu || !MenuIO)
                return;
                
            const element = CloudCmd.Edit.getElement();
            
            Menu = new MenuIO(element, options, menuData);
            Menu.show(position.x, position.y);
        });
    }
    
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
};

