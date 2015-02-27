var CloudCmd, Util, DOM, CloudFunc, MenuIO, Format, edward;
(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
        
    function EditProto(callback) {
        var Name        = 'Edit',
            Loading     = true,
            
            Info        = DOM.CurrentInfo,
            
            exec        = Util.exec,
            Edit        = this,
            
            Menu,
            
            Editor      = 'edward',
            
            Images      = DOM.Images,
            MSG_CHANGED,
            Element,
            ConfigView  = {
                beforeClose: function() {
                    isChanged();
                    exec.ifExist(Menu, 'hide');
                },
                afterShow: function() {
                    edward
                        .clearSelection()
                        .moveCursorTo(0, 0)
                        .focus();
                }
            };
        
       function init(callback) {
            var element = createElement();
            
            element.addEventListener('contextmenu', setMenu);
            
            exec.series([
                CloudCmd.View,
                getConfig,
                function(callback) {
                    loadFiles(element, callback);
                },
                function(callback) {
                    Edit.create(element)
                        .show(callback);
                    
                }, callback]);
        }
        
        function createElement() {
            var element = DOM.load({
                name        : 'div',
                style   :
                    'width      : 100%;'    +
                    'height     : 100%;'    +
                    'font       : 16px "Droid Sans Mono";' +
                    'position   : absolute;',
                notAppend : true
            });
            
            return element;
        }
        
        this.show                       = function(callback) {
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
                    alert(error);
                } else {
                    edward.setValueFirst(path, data);
                    
                    setMsgChanged(name);
                    edward.setModeForPath(name);
                    
                    CloudCmd.View.show(Element, ConfigView);
                }
            });
            
            return this;
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        this.create = function(element) {
            Element     = element;
            
            edward.on('save', function(value) {
                var size    = Format.size(value);
                DOM.setCurrentSize(size);
            });
            
            edward.addCommand({
                name    : 'hide',
                bindKey : { win: 'Esc',  mac: 'Esc' },
                exec    : function () {
                    Edit.hide();
                }
            });
            
            return this;
        };
        
        function getConfig(callback) {
            DOM.Files.get('config', function(error, config) {
                if (error)
                    alert(error);
                else if (config.editor)
                    Editor = config.editor;
                
                callback();
            });
        }
        
        function loadFiles(element, callback) {
            var url = '/' + Editor + '/' + Editor + '.js';
            
            Util.time(Name + ' load');
            
            DOM.load.js(url, function() {
                var options = {
                    maxSize : CloudFunc.MAX_FILE_SIZE
                };
                
                Loading = false;
                
                edward = window[Editor];
                
                edward(element, options, function() {
                    Util.timeEnd(Name + ' load');
                    exec(callback);
                });
            });
        }
        
        function setMenu() {
            if (!Menu) {
                DOM.loadRemote('menu', function(error) {
                    var position    = CloudCmd.MousePosition,
                        options     = {
                            beforeShow: function(params) {
                                params.x -= 18;
                                params.y -= 27;
                            },
                            afterClick: function() {
                                edward.focus();
                            }
                    },
                    menuData    = {
                        'Save           Ctrl+S' : function() {
                            edward.save();
                        },
                        'Go To Line     Ctrl+L' : function() {
                            edward.goToLine();
                        },
                        'Select All     Ctrl+A' : function() {
                            edward.selectAll();
                        },
                        'Delete         Del'    : function() {
                            edward.remove('right');
                        },
                        'Beautify       Ctrl+B' : function() {
                            edward.beautify();
                        },
                        'Minify         Ctrl+M' : function() {
                            edward.minify();
                        },
                        'Close          Esc'    : function() {
                            Edit.hide();
                        }
                    };
                    
                    if (error) {
                        alert(error);
                    } else if (!Menu) {
                        Menu = new MenuIO(Element, options, menuData);
                        Menu.show(position.x, position.y);
                        
                        Element.removeEventListener('contextmenu', setMenu);
                    }
                });
            }
        }
        
        function setMsgChanged(name) {
            var msg = 'Do you want to save changes to ' + name + '?';
            
            MSG_CHANGED = msg;
        }
        
        function isChanged() {
            var is  = edward.isChanged();
                
            if (is) {
                is = confirm(MSG_CHANGED);
                
                if (is)
                    edward.save();
            }
        }
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM, CloudFunc);
