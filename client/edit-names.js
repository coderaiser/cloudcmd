/* global Promise */

var CloudCmd, Util, DOM, CloudFunc, MenuIO;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.EditNames = function EditNamesProto(callback) {
        var Info = DOM.CurrentInfo;
        var Dialog = DOM.Dialog;
        var exec = Util.exec;
        var EditNames = this;
        var Menu;
        var TITLE = 'Edit Names';
        var ConfigView  = {
            beforeClose: function() {
                exec.ifExist(Menu, 'hide');
                isChanged();
                DOM.Events.remove('keydown', keyListener);
            }
        };
        
        var getName = DOM.getCurrentName.bind(DOM);
        
        function init(callback) {
            var editor;
            
            exec.series([
                CloudCmd.Edit,
                
                function(callback) {
                    editor = CloudCmd.Edit.getEditor();
                    callback();
                },
                
                function(callback) {
                    setListeners(editor);
                    callback();
                },
                
                function(callback) {
                    EditNames.show();
                    callback();
                },
            ], callback);
        }
        
        this.show = function() {
            var names = getActiveNames().join('\n');
            
            if (Info.name === '..' && names.length === 1)
                return Dialog.alert.noFiles(TITLE);
            
            CloudCmd.Edit
                .getEditor()
                .setValueFirst('edit-names', names)
                .setOption('fontSize', 16)
                .disableKey();
            
            DOM.Events.addKey(keyListener);
            CloudCmd.Edit.show(ConfigView);
        };
        
        function keyListener(event) {
            var ctrl = event.ctrlKey;
            var meta = event.metaKey;
            var ctrlMeta = ctrl || meta;
            var Key = CloudCmd.Key;
            
            if (!ctrlMeta || event.keyCode !== Key.S)
                return;
            
            EditNames.hide();
        }
        
        function getActiveNames() {
            return DOM
                .getActiveFiles()
                .map(getName);
        }
        
        this.hide = function() {
            CloudCmd.Edit.hide();
        };
        
        function setListeners() {
            var element = CloudCmd.Edit.getElement();
            
            DOM.Events.addOnce('contextmenu', element, setMenu);
        }
        
        function applyNames() {
            var dir = Info.dirPath;
            var from = getActiveNames();
            var nameIndex = from.indexOf(Info.name);
            
            var editor = CloudCmd.Edit.getEditor();
            var to = editor
                .getValue()
                .split('\n');
            
            var reject = Promise.reject.bind(Promise);
            
            getRoot()
                .then(rename(dir, from, to))
                .then(function(res) {
                    if (res.status === 404)
                        return res.text().then(reject);
                    
                    CloudCmd.refresh(null, function() {
                        var name = to[nameIndex];
                        DOM.setCurrentByName(name);
                    });
                }).catch(function(message) {
                    Dialog.alert(TITLE, message);
                });
        }
        
        function getDir(root, dir) {
            if (root === '/')
                return dir;
            
            return root + dir;
        }
        
        function rename(dir, from, to) {
            return function(root) {
                return fetch(CloudCmd.PREFIX + '/rename', {
                    method: 'put',
                    credentials: 'include',
                    body: JSON.stringify({
                        from: from,
                        to: to,
                        dir: getDir(root, dir)
                    })
                });
            };
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
                        EditNames.hide();
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
                    'Close          Esc'    : function() {
                        EditNames.hide();
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
        
        function getRoot() {
            return new Promise(function(resolve, reject) {
                DOM.Files.get('config', function(error, config) {
                    if (error)
                        return reject(error);
                    
                    resolve(config.root);
                });
            });
        }
        
        function isChanged() {
            var editor = CloudCmd.Edit.getEditor();
            var msg = 'Apply new names?';
            
            if (!editor.isChanged())
                return;
            
            Dialog.confirm(TITLE, msg)
                .then(EditNames.hide)
                .then(applyNames)
                .catch(EditNames.hide);
        }
        
        init(callback);
    };
    
})(CloudCmd, Util, DOM, CloudFunc);

