var CloudCmd, Util, DOM, CloudFunc, MenuIO, Format;
(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
        
    function EditProto(callback) {
        var Name        = 'Edit',
            Loading     = true,
            
            Info        = DOM.CurrentInfo,
            Dialog      = DOM.Dialog,
            
            exec        = Util.exec,
            Edit        = this,
            
            Menu,
            
            EditorName  = 'edward',
            editor,
            
            TITLE       = 'Edit',
            
            Images      = DOM.Images,
            MSG_CHANGED,
            Element,
            ConfigView  = {
                beforeClose: function() {
                    exec.ifExist(Menu, 'hide');
                    isChanged(Edit.hide);
                },
                afterShow: function() {
                    editor
                        .moveCursorTo(0, 0)
                        .focus();
                }
            };
        
       function init(callback) {
            var element;
            
            element = createElement();
            
            DOM.Events.addOnce('contextmenu', element, setMenu);
            
            exec.series([
                CloudCmd.View,
                getConfig,
                function(callback) {
                    loadFiles(element, callback);
                },
                function(callback) {
                    authCheck(editor);
                    callback();
                },
                function(callback) {
                    Edit.create(element)
                        .show(callback);
                    
                },
                callback
            ]);
        }
        
        function createElement() {
            var element = DOM.load({
                name        : 'div',
                style   :
                    'width      : 100%;'    +
                    'height     : 100%;'    +
                    'font-family: "Droid Sans Mono";' +
                    'position   : absolute;',
                notAppend : true
            });
            
            return element;
        }
        
        this.show                       = function(callback) {
            if (!Loading) {
                Images.show.load();
                
                if (callback)
                    ConfigView.beforeShow = callback;
                
                Info.getData(function(error, data) {
                    var path    = Info.path,
                        isDir   = Info.isDir,
                        name    = Info.name;
                    
                    if (isDir)
                        name += '.json';
                    
                    if (error) {
                        Images.hide();
                    } else {
                        editor.setValueFirst(path, data);
                        
                        setMsgChanged(name);
                        
                        editor
                            .setModeForPath(name)
                            .setOption('fontSize', 16);
                        
                        CloudCmd.View.show(Element, ConfigView);
                    }
                });
            }
            
            return this;
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        this.create = function(element) {
            Element     = element;
            
            editor.on('save', function(value) {
                var size = Format.size(value);
                DOM.setCurrentSize(size);
            });
            
            return this;
        };
        
        function authCheck(spawn) {
            DOM.Files.get('config', function(error, config) {
                if (error)
                    return Dialog.alert(TITLE, error);
                
                if (config.auth) {
                    spawn.emit('auth', config.username, config.password);
                    
                    spawn.on('reject', function() {
                        Dialog.alert(TITLE, 'Wrong credentials!');
                    });
                }
            });
        }
        
        function getConfig(callback) {
            DOM.Files.get('config', function(error, config) {
                if (error)
                    Dialog.alert(TITLE, error);
                else if (config.editor)
                    EditorName = config.editor;
                
                callback();
            });
        }
        
        function loadFiles(element, callback) {
            var prefix      = CloudCmd.PREFIX,
                prefixName  = prefix + '/' + EditorName,
                url         = prefixName + '/' + EditorName + '.js';
            
            Util.time(Name + ' load');
            
            DOM.load.js(url, function() {
                var word    = window[EditorName],
                    options = {
                        maxSize     : CloudFunc.MAX_FILE_SIZE,
                        prefix      : prefixName,
                        socketPath  : prefix
                    };
                
                word(element, options, function(ed) {
                    Util.timeEnd(Name + ' load');
                    editor  = ed;
                    Loading = false;
                    
                    exec(callback);
                });
            });
        }
        
        function setMenu(event) {
            var position = {
                x: event.clientX,
                y: event.clientY
            };
            
            event.preventDefault();
            
            !Menu && DOM.loadRemote('menu', function(error) {
                var noFocus,
                    options     = {
                        beforeShow: function(params) {
                            params.x -= 18;
                            params.y -= 27;
                        },
                        
                        afterClick: function() {
                            !noFocus && editor.focus();
                        }
                },
                menuData    = {
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
                        Edit.hide();
                    }
                };
                
                if (error) {
                    Dialog.alert(TITLE, error);
                } else if (!Menu && MenuIO) {
                    Menu = new MenuIO(Element, options, menuData);
                    Menu.show(position.x, position.y);
                }
            });
        }
        
        function setMsgChanged(name) {
            var msg = 'Do you want to save changes to ' + name + '?';
            
            MSG_CHANGED = msg;
        }
        
        function isChanged() {
            var is  = editor.isChanged();
                
            is && Dialog.confirm(TITLE, MSG_CHANGED, {cancel: false})
                .then(function() {
                    editor.save();
                });
        }
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM, CloudFunc);
