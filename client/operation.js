/* global CloudCmd */
/* global Util */
/* global DOM */
/* global spero */
/* global remedy */
/* global ishtar */
/* global salam */
/* global omnes */

'use strict';

CloudCmd.Operation = OperationProto;

const currify = require('currify/legacy');
const exec = require('execon');

const RESTful = require('./rest');

function OperationProto(operation, data) {
    const Name = 'Operation';
    const TITLE = CloudCmd.TITLE;
    const config = CloudCmd.config;
    const {Dialog, Images} = DOM;
    
    let Loaded;
    
    let {
        cp: copyFn,
        mv: moveFn,
        pack: packFn,
        extract: extractFn,
    } = RESTful;
    
    let deleteFn = RESTful.delete;
    
    const Info = DOM.CurrentInfo;
    const showLoad = Images.show.load.bind(null, 'top');
    const Operation = this;
    
    function init() {
        showLoad();
        
        exec.series([
            DOM.loadSocket,
            (callback) => {
                if (CloudCmd.config('progress'))
                    load((callback) => {
                        create(CloudCmd.PREFIX, callback);
                    });
                
                callback();
            },
            function() {
                Loaded = true;
                Images.hide();
                Operation.show(operation, data);
            }
        ]);
    }
    
    function authCheck(spawn, ok) {
        if (!CloudCmd.config('auth'))
            return ok();
            
        spawn.on('accept', ok);
        spawn.on('reject', function() {
            Dialog.alert(TITLE, 'Wrong credentials!');
        });
        
        spawn.emit('auth', config('username'), config('password'));
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
                copyFn = RESTful.cp;
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
                deleteFn = RESTful.remove;
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
                });
            });
            
            packer.on('disconnect', function() {
                packFn = RESTful.pack;
            });
        });
    }
    
    function _initPacker(prefix, fn) {
        if (config('packer') === 'zip')
            return _setPacker(prefix, 'salam', salam, fn);
            
        _setPacker(prefix, 'ishtar', ishtar, fn);
    }
    
    function _initExtractor(prefix, fn) {
        omnes(prefix + '/omnes', prefix, function(packer) {
            fn();
            packer.on('connect', function() {
                authCheck(packer, function() {
                    extractFn = function(data, callback) {
                        setListeners(packer, {noContinue: true}, callback);
                        packer.extract(data.from, data.to);
                    };
                });
            });
            
            packer.on('disconnect', function() {
                extractFn = RESTful.extract;
            });
        });
    }
    
    function create(prefix) {
        var initSpero = currify(_initSpero);
        var initRemedy = currify(_initRemedy);
        var initPacker = currify(_initPacker);
        var initExtractor = currify(_initExtractor);
        
        exec.parallel([
            initSpero(prefix),
            initRemedy(prefix),
            initPacker(prefix),
            initExtractor(prefix)
        ], exec.ret);
    }
    
    function setListeners(emitter, options, callback) {
        if (!callback) {
            callback = options;
            options = {};
        }
        
        var done;
        var lastError;
        
        var listeners = {
            progress: function(value) {
                done = value === 100;
                Images.setProgress(value);
            },
            
            end: function() {
                Images
                    .hide()
                    .clearProgress();
                
                events.forEach(function(name) {
                    emitter.removeListener(name, listeners[name]);
                });
                
                if (lastError || done)
                    callback(lastError);
            },
            
            error: function(error) {
                lastError = error;
                
                if (options.noContinue) {
                    listeners.end(error);
                    Dialog.alert(TITLE, error);
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
        var isZip = config('packer') === 'zip';
        twopack('pack', isZip ? 'zip' : 'tar');
    };
    
    this.extract        = function() {
        var isZip = config('packer') === 'zip';
        twopack('extract', isZip ? 'zip' : 'tar');
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
            panel,
            shouldAsk,
            sameName,
            ok,
            
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
        
        name = names[0];
        
        sameName = !!DOM.getCurrentByName(name, panel);
        
        if (name === '..')
            return Dialog.alert.noFiles(TITLE);
        
        if (shouldAsk)
            return message(to, names).then(ask);
        
        ask(to);
        
        function ask(to) {
            ok = from !== to && to;
            
            if (ok && !shouldAsk || !sameName)
                return go();
            
            const str = `"${ name }" already exist. Overwrite?`;
            const cancel = false;
            
            Dialog.confirm(TITLE, str, {cancel}).then(go);
            
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
        
        return /\.tar\.gz$/;
    }
    
    function checkEmpty(name, operation) {
        if (!operation)
            throw Error(name + ' could not be empty!');
    }
    
    function twopack(operation, type) {
        var op,
            fileFrom,
            Images      = DOM.Images,
            name        = Info.name,
            path        = Info.path,
            dirPath     = Info.dirPath,
            activeFiles = DOM.getActiveFiles(),
            names       = DOM.getFilenames(activeFiles);
        
        checkEmpty('operation', operation);
        
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
        const prefix = CloudCmd.PREFIX;
        const files = [
            '/spero/spero.js',
            '/remedy/remedy.js',
            '/ishtar/ishtar.js',
            '/salam/salam.js',
            '/omnes/omnes.js'
        ].map((name) => {
            return prefix + name;
        });
        
        DOM.load.parallel(files, (error) => {
            if (error)
                return Dialog.alert(TITLE, error.message);
            
            Loaded = true;
            Util.timeEnd(Name + ' load');
            exec(callback);
        });
        
        Util.time(Name + ' load');
    }
    
    init();
}

