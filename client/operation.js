/* global CloudCmd */
/* global Util */
/* global DOM */
/* global rendy */
/* global currify */
/* global spero */
/* global remedy */
/* global ishtar */
/* global salam */

(function(CloudCmd, Util, DOM, rendy) {
    'use strict';
    
    CloudCmd.Operation = OperationProto;
        
    function OperationProto(operation, data) {
        var Name        = 'Operation',
            TITLE       = CloudCmd.TITLE,
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
        
        function init() {
            showLoad();
            
            Util.exec.series([
                DOM.loadSocket,
                function(callback) {
                    var Files = DOM.Files;
                    
                    Files.get('config', function(error, config) {
                        if (error)
                            Dialog.alert('Config', error);
                        else if (config.progress)
                            load(function(callback) {
                                create(CloudCmd.PREFIX, callback);
                            });
                        
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
        
        function authCheck(spawn, ok) {
            DOM.Files.get('config', function(error, config) {
                if (error)
                    return Dialog.alert(TITLE, error);
                
                if (!config.auth) {
                    ok();
                } else {
                    spawn.on('accept', ok);
                    spawn.on('reject', function() {
                        Dialog.alert(TITLE, 'Wrong credentials!');
                    });
                    
                    spawn.emit('auth', config.username, config.password);
                }
            });
        }
        
        function _initSpero(prefix, fn) {
            spero(prefix + '/spero', prefix, function(copier) {
                fn();
                
                copier.on('connect', function() {
                    authCheck(copier, function() {
                        copyFn = function(data, callback) {
                            setListeners(copier, callback);
                            copier.copy(data.from, data.to, data.names);
                        };
                    });
                });
                
                copier.on('disconnect', function() {
                    copyFn = DOM.RESTful.cp;
                });
            });
        }
        
        function _initRemedy(prefix, fn) {
            remedy(prefix + '/remedy', prefix, function(remover) {
                fn();
                remover.on('connect', function() {
                    authCheck(remover, function() {
                        deleteFn = function(from, files, callback) {
                            setListeners(remover, callback);
                            from = from.replace(/\?.*/, '');
                            remover.remove(from, files);
                        };
                    });
                });
                
                remover.on('disconnect', function() {
                    deleteFn = DOM.RESTful.remove;
                });
            });
        }
        
        function _setPacker(prefix, name, pack, fn) {
            pack(prefix + '/' + name, prefix, function(packer) {
                fn();
                packer.on('connect', function() {
                    authCheck(packer, function() {
                        packFn = function(data, callback) {
                            setListeners(packer, {noContinue: true}, callback);
                            packer.pack(data.from, data.to, data.names);
                        };
                        
                        extractFn = function(data, callback) {
                            setListeners(packer, {noContinue: true}, callback);
                            packer.extract(data.from, data.to);
                        };
                    });
                });
                
                packer.on('disconnect', function() {
                    packFn      = RESTful.pack;
                    extractFn   = RESTful.extract;
                });
            });
        }
        
        function _initPacker(prefix, fn) {
            DOM.Files.get('config', function(e, config) {
                if (e)
                    return CloudCmd.log(e);
                
                if (config.packer === 'zip')
                    return _setPacker(prefix, 'salam', salam, fn);
                
                _setPacker(prefix, 'ishtar', ishtar, fn);
            });
        }
        
        function create(prefix) {
            var initSpero = currify(_initSpero);
            var initRemedy = currify(_initRemedy);
            var initPacker = currify(_initPacker);
            
            exec.parallel([
                initSpero(prefix),
                initRemedy(prefix),
                initPacker(prefix)
            ], exec.ret);
        }
        
        function setListeners(emitter, options, callback) {
            if (!callback) {
                callback = options;
                options = {};
            }
            
            var done;
            
            var listeners = {
                progress: function(value) {
                    done = value === 100;
                    Images.setProgress(value);
                },
                
                end: function(error) {
                    Images
                        .hide()
                        .clearProgress();
                    
                    events.forEach(function(name) {
                        emitter.removeListener(name, listeners[name]);
                    });
                    
                    if (error || done)
                        callback(error);
                },
                
                error: function(error) {
                    if (options.noContinue) {
                        listeners.end(error);
                        Dialog.alert(TITLE, error)
                    } else {
                        Dialog.confirm(TITLE, error + '\n Continue?')
                            .then(function() {
                                emitter.continue();
                            }, function() {
                                emitter.abort();
                            });
                    }
                }
            };
            
            var events = Object.keys(listeners);
            
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
                    Operation.deleteSilent();
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
            DOM.Files.get('config', function(e, config) {
                var zip = config && config.packer === 'zip';
                twopack('pack', zip ? 'zip' : 'tar');
            });
        };
        
        this.extract        = function() {
            DOM.Files.get('config', function(e, config) {
                var zip = config && config.packer === 'zip';
                twopack('extract', zip ? 'zip' : 'tar');
            });
        };
        
         /**
         * prompt and delete current file or selected files
         *
         * @currentFile
         */
        function promptDelete() {
            var type, isDir, msg,
                name        = '',
                msgAsk      = 'Do you really want to delete the ',
                msgSel      = 'selected ',
                files       = DOM.getSelectedFiles(),
                names       = DOM.getFilenames(files),
                i,
                n           = names.length,
                current     = DOM.getCurrentFile();
            
            if (n) {
                for (i = 0; i < 5 && i < n; i++)
                    name += '\n' + names[i];
                
                if (n >= 5)
                    name   += '\n...';
                
                msg    = msgAsk + msgSel + n + ' files/directories?\n' + name ;
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
            
            if (name === '..')
                return Dialog.alert.noFiles(TITLE);
            
            Dialog.confirm(TITLE, msg, {cancel: false}).then(function() {
                deleteSilent(files);
            });
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
                name        = Info.name;
            
            if (name === '..')
                return Dialog.alert.noFiles(TITLE);
            
            showLoad();
            
            if (!files)
                files       = DOM.getSelectedFiles();
            
            names       = DOM.getFilenames(files),
            n           = names.length;
            
            if (!n)
                names = [Info.name];
            
            deleteFn(path + query, names, function(error) {
                var Storage     = DOM.Storage,
                    dirPath     = Info.dirPath,
                    delCurrent  = DOM.deleteCurrent,
                    delSelected = DOM.deleteSelected,
                    getByName   = DOM.getCurrentByName;
                
                if (!error) {
                    if (n > 1)
                        delSelected(files);
                    else
                        delCurrent(getByName(name));
                    
                    Storage.removeMatch(dirPath);
                }
            });
        }
        
        /*
         * process files (copy or move)
         * @param data
         * @param operation
         */
        function processFiles(data, operation, message) {
             var name, selFiles, files,
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
                selFiles    = DOM.getSelectedFiles();
                names       = DOM.getFilenames(selFiles);
                data        = {};
                shouldAsk   = true;
                panel       = Info.panelPassive;
            }
            
            if (!names.length)
                names.push(DOM.getCurrentName());
            
            name    = names[0];
            
            sameName    = !!DOM.getCurrentByName(name, panel);
            
            if (name === '..') {
                Dialog.alert.noFiles(TITLE);
            } else {
                if (shouldAsk)
                    message(to, names).then(ask);
                else
                    ask(to);
            }
            
            function ask(to) {
                ok = from !== to && to;
                
                if (ok)
                    if (shouldAsk && sameName)
                        Dialog.confirm(TITLE, rendy(tmpl, {
                            name: name
                        }), {cancel: false}).then(function() {
                            go();
                        });
                    else
                        go();
                
                function go() {
                    showLoad();
                     
                    files   = {
                        from    : from,
                        to      : to,
                        names   : names
                    };
                    
                    operation(files, function(error) {
                        !error && DOM.Storage.remove(from, function() {
                            var panel           = Info.panel,
                                panelPassive    = Info.panelPassive,
                                setCurrent      = function() {
                                    if (!name)
                                        name = data.names[0];
                                    
                                    DOM.setCurrentByName(name);
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
        
        function getTypeReg(type) {
            if (type === 'zip')
                return /\.zip$/;
            
            return /\.tar\.gz$/
        }
        
        function twopack(operation, type) {
            var op,
                fileFrom,
                Images      = DOM.Images,
                Info        = DOM.CurrentInfo,
                name        = Info.name,
                path        = Info.path,
                dirPath     = Info.dirPath,
                activeFiles = DOM.getActiveFiles(),
                names       = DOM.getFilenames(activeFiles);
            
            Util.check(arguments, ['operation']);
            
            if (!names.length) {
                Dialog.alert.noFiles(TITLE);
            } else {
                switch(operation) {
                case 'extract':
                    op = extractFn;
                    
                    fileFrom   = {
                        from    : path,
                        to      : dirPath
                    };
                    
                    name = name.replace(getTypeReg(type), '');
                    
                    break;
                
                case 'pack':
                    op = packFn;
                    
                    if (names.length > 1)
                        name = Info.dir;
                    
                    name += DOM.getPackerExt(type);
                    
                    fileFrom = {
                        from    : dirPath,
                        to      : dirPath + name,
                        names   : names
                    };
                    break;
                }
                
                Images.show.load('top');
                
                op(fileFrom, function(error) {
                    !error && CloudCmd.refresh(null, function() {
                        DOM.setCurrentByName(name);
                    });
                });
            }
        }
        
        function message(msg) {
            return function(to, names) {
                var promise,
                    n       = names.length,
                    name    = names[0];
                
                msg += ' ';
                
                if (names.length > 1)
                    msg     += n + ' file(s)';
                else
                    msg     += '"' + name + '"';
                
                msg         += ' to';
                
                promise = Dialog.prompt(TITLE, msg, to, {cancel: false});
                
                return promise;
            };
        }
        
        function load(callback) {
            var prefix  = CloudCmd.PREFIX,
                files   = [
                    '/spero/spero.js',
                    '/remedy/remedy.js',
                    '/ishtar/ishtar.js',
                    '/salam/salam.js'
            ].map(function(name) {
                return prefix + name;
            });
            
            DOM.load.parallel(files, function(error) {
                if (error) {
                    Dialog.alert(TITLE, error.message);
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
