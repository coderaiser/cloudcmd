'use strict';

/* global CloudCmd, DOM, MenuIO, Format */
    
CloudCmd.EditFile = function EditFileProto(callback) {
    var Info = DOM.CurrentInfo;
    var Dialog = DOM.Dialog;
    var EditFile = this;
    var config = CloudCmd.config;
    
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
        var editor;
        
        exec.series([
            CloudCmd.Edit,
            function(callback) {
                editor = CloudCmd.Edit.getEditor();
                callback();
            },
            function(callback) {
                authCheck(editor);
                callback();
            },
            
            function(callback) {
                setListeners(editor);
                callback();
            },
            function(callback) {
                EditFile.show(callback);
            },
        ], callback);
    }
    
    this.show = function() {
        Images.show.load();
        
        Info.getData(function(error, data) {
            var path = Info.path;
            var isDir = Info.isDir;
            var name = Info.name;
            
            if (isDir)
                name += '.json';
            
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
    
    this.hide = function() {
        CloudCmd.Edit.hide();
    };
    
    function setListeners(editor) {
        var element = CloudCmd.Edit.getElement();
        
        DOM.Events.addOnce('contextmenu', element, setMenu);
        
        editor.on('save', function(value) {
            DOM.setCurrentSize(Format.size(value));
        });
    }
    
    function authCheck(spawn) {
        if (!config('auth'))
            return;
        
        spawn.emit('auth', config('username'), config('password'));
        spawn.on('reject', function() {
            Dialog.alert(TITLE, 'Wrong credentials!');
        });
    }
    
    function setMenu(event) {
        var position = {
            x: event.clientX,
            y: event.clientY
        };
        
        event.preventDefault();
        
        !Menu && DOM.loadRemote('menu', function(error) {
            var noFocus;
            var options = {
                beforeShow: function(params) {
                    params.x -= 18;
                    params.y -= 27;
                },
                
                afterClick: function() {
                    !noFocus && editor.focus();
                }
            };
            
            var editor = CloudCmd.Edit.getEditor();
            
            var menuData = {
                'Save           Ctrl+S' : function() {
                    editor.save();
                },
                'Go To Line     Ctrl+G' : function() {
                    noFocus = true;
                    editor.goToLine();
                },
                'Cut            Ctrl+X' : function() {
                    editor.cutToClipboard();
                },
                'Copy           Ctrl+C' : function() {
                    editor.copyToClipboard();
                },
                'Paste          Ctrl+V' : function() {
                    editor.pasteFromClipboard();
                },
                'Delete         Del'    : function() {
                    editor.remove('right');
                },
                'Select All     Ctrl+A' : function() {
                    editor.selectAll();
                },
                'Beautify       Ctrl+B' : function() {
                    editor.beautify();
                },
                'Minify         Ctrl+M' : function() {
                    editor.minify();
                },
                'Close          Esc'    : function() {
                    EditFile.hide();
                }
            };
            
            if (error)
                return Dialog.alert(TITLE, error);
            
            if (Menu || !MenuIO)
                return;
                
            var element = CloudCmd.Edit.getElement();
            
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

