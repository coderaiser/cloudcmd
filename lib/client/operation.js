/* global CloudCmd */
/* global Util */
/* global DOM */
/* global rendy */
/* global spero */
/* global remedy */
/* global ishtar */

(function(CloudCmd, Util, DOM, rendy) {
    'use strict';
    
    CloudCmd.Operation = OperationProto;
        
    function OperationProto(operation, data) {
        var Name        = 'Operation',
            Loaded,
            RESTful     = DOM.RESTful,
            
            exec        = Util.exec,
            
            copyFn      = RESTful.cp,
            moveFn      = RESTful.mv,
            deleteFn    = RESTful.delete,
            packFn      = RESTful.pack,
            extractFn   = RESTful.extract,
            
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
                            load(create);
                        
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
            exec.series([
                function(fn) {
                    spero(function(copier) {
                        fn();
                        
                        copier.on('connect', function() {
                            copyFn = function(data, callback) {
                                setListeners(copier, callback);
                                copier.copy(data.from, data.to, data.names);
                            };
                        });
                        
                        copier.on('disconnect', function() {
                            copyFn = DOM.RESTful.cp;
                        });
                    });
                },
                
                function(fn) {
                    remedy(function() {
                        fn();
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
                },
                
                function(fn) {
                    ishtar(function() {
                        fn();
                        ishtar.on('connect', function() {
                            packFn = function(data, callback) {
                                setListeners(ishtar, callback);
                                
                                ishtar.pack(data.from, data.to, data.names);
                            };
                            
                            extractFn = function(data, callback) {
                                setListeners(ishtar, callback);
                                ishtar.pack(data.from, data.to);
                            };
                        });
                        
                        ishtar.on('disconnect', function() {
                            packFn      = RESTful.pack;
                            extractFn   = RESTful.extract;
                        });
                    });
                }
            ]);
            
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
                    break;
                
                case 'pack':
                    Operation.pack();
                    break;
                
                case 'extract':
                    Operation.extract();
                    break;
                
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
        
        this.pack           = function() {
            twopack('pack');
        };
        
        this.extract        = function() {
           twopack('extract');
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
            
            deleteFn(path + query, names, function(error) {
                var Storage     = DOM.Storage,
                    dirPath     = Info.dirPath,
                    dir         = rmLastSlash(dirPath);
                
                if (!error) {
                    if (n > 1)
                        DOM.deleteSelected(files);
                    else
                        DOM.deleteCurrent(current);
                    
                    Storage.removeMatch(dir);
                }
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
                    
                    operation(files, function(error) {
                        var path = rmLastSlash(from);
                        
                        !error && DOM.Storage.remove(path, function() {
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
        
        function twopack(operation) {
            var op,
                Images      = DOM.Images,
                Info        = DOM.CurrentInfo,
                name        = Info.name,
                path        = Info.path,
                dirPath     = Info.dirPath,
                activeFiles = DOM.getActiveFiles(),
                names       = DOM.getSelectedNames(activeFiles),
                fileFrom;
            
            Util.check(arguments, ['operation']);
            
            if (!names.length) {
                Dialog.alert.noFiles();
            } else {
                switch(operation) {
                case 'extract':
                    op          = extractFn;
                    
                    fileFrom   = {
                        from    : path,
                        to      : dirPath
                    };
                    
                    name        = name.replace(/\.tar\.gz$/, '');
                    
                    break;
                
                case 'pack':
                    op          = packFn;
                    
                    if (names.length > 1)
                        name    = Info.dir;
                    
                    name    += '.tar.gz';
                    
                    fileFrom    = {
                        from    : dirPath,
                        to      : dirPath + name,
                        names   : names
                    };
                    break;
                }
                
                Images.show.load('top');
                
                op(fileFrom, function(error) {
                    !error && CloudCmd.refresh(null, function() {
                        var file = DOM.getCurrentByName(name);
                            
                        DOM.setCurrentFile(file);
                    });
                });
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
                '/remedy/remedy.js',
                '/ishtar/ishtar.js'
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
