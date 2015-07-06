/* global CloudCmd */
/* global Util */
/* global DOM */
/* global rendy */
/* global spero */
/* global remedy */

(function(CloudCmd, Util, DOM, rendy) {
    'use strict';
    
    CloudCmd.Operation = OperationProto;
        
    function OperationProto(operation, data) {
        var Name        = 'Operation',
            Loaded,
            RESTful     = DOM.RESTful,
            
            copyFn      = RESTful.cp,
            moveFn      = RESTful.mv,
            deleteFn    = RESTful.delete,
            
            Images      = DOM.Images,
            Dialog      = DOM.Dialog,
            
            showLoad    = Images.show.load.bind(null, 'top'),
            
            Operation   = this;
        
        function rmLastSlash(str) {
            return str.replace(/\/$/, '');
        }
            
        function init() {
            showLoad();
            
            Util.exec.series([
                DOM.loadSocket,
                function(callback) {
                    var Files = DOM.Files;
                    
                    Files.get('config', function(error, config) {
                        if (error)
                            alert(error);
                        else if (config.progress)
                            load(function() {
                                create(callback);
                            });
                        else
                            callback();
                    });
                },
                function() {
                    Loaded = true;
                    Images.hide();
                    Operation.show(operation, data);
                }
            ]);
        }
        
        function create(callback) {
            spero(function() {
                 spero.on('connect', function() {
                    copyFn = function(data, callback) {
                        setListeners(spero, callback);
                        spero.copy(data.from, data.to, data.names);
                    };
                });
                
                spero.on('disconnect', function() {
                    copyFn = DOM.RESTful.cp;
                });
            });
            
            remedy(function() {
                 remedy.on('connect', function() {
                    deleteFn = function(from, files, callback) {
                        from = from.replace(/\?.*/, '');
                        
                        setListeners(remedy, callback);
                        remedy.remove(from, files);
                    };
                });
                
                remedy.on('disconnect', function() {
                    deleteFn = DOM.RESTful.remove;
                });
            });
            
            Util.exec(callback);
        }
        
        function setListeners(emitter, callback) {
            var wasError,
                listeners = {
                    progress: function(value) {
                        Images.setProgress(value);
                    },
                    
                    end: function() {
                        if (!wasError)
                            callback();
                        
                        Images
                            .hide()
                            .clearProgress();
                        
                        events.forEach(function(name) {
                            emitter.removeListener(name, listeners[name]);
                        });
                    },
                    
                    error: function(error) {
                        var msg = error + '\n Continue?',
                            is = confirm(msg);
                        
                        if (is) {
                            emitter.continue();
                        } else {
                            wasError = true;
                            emitter.abort();
                        }
                    }
            },
            events = Object.keys(listeners);
            
            events.forEach(function(name) {
                emitter.on(name, listeners[name]);
            });
        }
        
        this.hide   = function() {
            CloudCmd.View.hide();
        };
        
        this.show = function(operation, data) {
            if (Loaded)
                switch(operation) {
                case 'copy':
                    Operation.copy(data);
                    break;
                
                case 'move':
                    Operation.move(data);
                    break;
                
                case 'delete':
                    Operation.delete();
                    break;
                
                case 'delete:silent':
                    Operation.deleteShift();
                }
        };
        
        this.copy           = function(data) {
            processFiles(data, copyFn, message('Copy'));
        };
        
        this.move           = function(data) {
            processFiles(data, moveFn, message('Rename/Move'));
        };
        
        this.delete         = function() {
            promptDelete();
        };
        
        this.deleteSilent   = function() {
            deleteSilent();
        };
        
         /**
         * prompt and delete current file or selected files
         *
         * @currentFile
         */
        function promptDelete() {
            var ret, type, isDir, msg,
                name        = '',
                msgAsk      = 'Do you really want to delete the ',
                msgSel      = 'selected ',
                files       = DOM.getSelectedFiles(),
                names       = DOM.getSelectedNames(files),
                i, n        = names && names.length,
                current     = DOM.getCurrentFile();
            
            if (n) {
                for (i = 0; i < 5 && i < n; i++)
                    name += '\n' + names[i];
                
                if (n >= 5)
                    name   += '\n...';
                
                msg    = msgAsk + msgSel + n + ' files/directoris?\n' + name ;
            } else {
                isDir       = DOM.isCurrentIsDir(current);
                
                if (isDir)
                    type    = 'directory';
                else
                    type    = 'file';
                 
                 type += ' ';
                
                name   = DOM.getCurrentName(current);
                msg    = msgAsk + msgSel + type + name + '?';
            }
            
            if (name !== '..')
                ret  = Dialog.confirm(msg);
            else
                Dialog.alert.noFiles();
            
            if (ret)
                deleteSilent(files);
            
            return ret;
        }
        
        /**
         * delete current or selected files
         *
         * @files
         */
        function deleteSilent(files) {
            var n, names,
                query       = '?files',
                Info        = DOM.CurrentInfo,
                path        = Info.dirPath,
                current     = Info.element;
            
            showLoad();
            
            if (!files)
                files       = DOM.getSelectedFiles();
            
            names       = DOM.getSelectedNames(files),
            n           = names && names.length;
            
            if (!n)
                names   = [Info.name];
            
            deleteFn(path + query, names, function() {
                var Storage     = DOM.Storage,
                    dirPath     = Info.dirPath,
                    dir         = rmLastSlash(dirPath);
                
                if (n > 1)
                    DOM.deleteSelected(files);
                else
                    DOM.deleteCurrent(current);
                
                Storage.removeMatch(dir);
            });
        }
        
        /*
         * process files (copy or move)
         * @param data
         * @param operation
         */
        function processFiles(data, operation, message) {
             var name, files,
                Info        = DOM.CurrentInfo,
                panel,
                shouldAsk,
                sameName,
                ok,
                tmpl        = '"{{ name }}" already exist. Overwrite?',
                
                from        = '',
                to          = '',
                
                names       = [];
            
            if (data) {
                from        = data.from;
                to          = data.to;
                names       = data.names;
                panel       = Info.panel;
            } else {
                from        = Info.dirPath;
                to          = DOM.getNotCurrentDirPath();
                names       = DOM.getSelectedNames();
                data        = {};
                shouldAsk   = true;
                panel       = Info.panelPassive;
            }
            
            if (!names.length)
                names.push(DOM.getCurrentName());
            
            name    = names[0];
            
            sameName    = !!DOM.getCurrentByName(name, panel);
            
            if (name === '..') {
                Dialog.alert.noFiles();
            } else {
                if (shouldAsk)
                    to = message(to, names);
                
                ok = from !== to && to;
                
                if (ok && shouldAsk && sameName)
                    ok = Dialog.confirm(rendy(tmpl, {
                        name: name
                    }));
                
                if (ok) {
                    showLoad();
                     
                    files   = {
                        from    : from,
                        to      : to,
                        names   : names
                    };
                    
                    operation(files, function() {
                        var path = rmLastSlash(from);
                        
                        DOM.Storage.remove(path, function() {
                            var panel           = Info.panel,
                                panelPassive    = Info.panelPassive,
                                setCurrent      = function() {
                                    var current;
                                    
                                    if (!name)
                                        name = data.names[0];
                                    
                                    current = DOM.getCurrentByName(name);
                                    DOM.setCurrentFile(current);
                                };
                            
                            if (!Info.isOnePanel)
                                CloudCmd.refresh(panelPassive, {
                                    noCurrent: true
                                });
                            
                            CloudCmd.refresh(panel, setCurrent);
                        });
                    });
                }
            }
        }
        
        function message(msg) {
            return function(to, names) {
                var ret,
                    n       = names.length,
                    name    = names[0];
                
                msg += ' ';
                
                if (names.length > 1)
                    msg     += n + ' file(s)';
                else
                    msg     += '"' + name + '"';
                
                msg         += ' to';
                
                ret = Dialog.prompt(msg, to);
                
                return ret;
            };
        }
        
        function load(callback) {
            var files = [
                '/spero/spero.js',
                '/remedy/remedy.js'
            ];
            
            DOM.load.parallel(files, function(error) {
                if (error) {
                    Dialog.alert(error.message);
                } else {
                    Loaded = true;
                    Util.timeEnd(Name + ' load');
                    Util.exec(callback);
                }
            });
            
            Util.time(Name + ' load');
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, rendy);
