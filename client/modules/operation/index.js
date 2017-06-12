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

const RESTful = require('../../dom/rest');
const removeExtension = require('./remove-extension');

function OperationProto(operation, data) {
    const Name = 'Operation';
    const TITLE = CloudCmd.TITLE;
    const {config} = CloudCmd;
    const {Dialog, Images} = DOM;
    
    let Loaded;
    
    let {
        cp: copyFn,
        mv: moveFn,
        pack: packFn,
        delete: deleteFn,
        extract: extractFn,
    } = RESTful;
    
    const Info = DOM.CurrentInfo;
    const showLoad = Images.show.load.bind(null, 'top');
    const Operation = this;
    
    function init() {
        showLoad();
        
        exec.series([
            DOM.loadSocket,
            (callback) => {
                if (config('progress'))
                    load((callback) => {
                        create(CloudCmd.PREFIX, callback);
                    });
                
                callback();
            },
            () => {
                Loaded = true;
                Images.hide();
                Operation.show(operation, data);
            }
        ]);
    }
    
    function authCheck(spawn, ok) {
        if (!config('auth'))
            return ok();
        
        spawn.on('accept', ok);
        spawn.on('reject', () => {
            Dialog.alert(TITLE, 'Wrong credentials!');
        });
        
        spawn.emit('auth', config('username'), config('password'));
    }
    
    function _initSpero(prefix, fn) {
        spero(prefix + '/spero', prefix, (copier) => {
            fn();
            
            copier.on('connect', () => {
                authCheck(copier, () => {
                    copyFn = (data, callback) => {
                        setListeners(copier, callback);
                        copier.copy(data.from, data.to, data.names);
                    };
                });
            });
            
            copier.on('disconnect', () => {
                copyFn = RESTful.cp;
            });
        });
    }
    
    function _initRemedy(prefix, fn) {
        remedy(prefix + '/remedy', prefix, (remover) => {
            fn();
            remover.on('connect', () => {
                authCheck(remover, () => {
                    deleteFn = (from, files, callback) => {
                        setListeners(remover, callback);
                        from = from.replace(/\?.*/, '');
                        remover.remove(from, files);
                    };
                });
            });
            
            remover.on('disconnect', () => {
                deleteFn = RESTful.remove;
            });
        });
    }
    
    function _setPacker(prefix, name, pack, fn) {
        pack(prefix + '/' + name, prefix, (packer) => {
            fn();
            packer.on('connect', () => {
                authCheck(packer, () => {
                    packFn = (data, callback) => {
                        setListeners(packer, {noContinue: true}, callback);
                        packer.pack(data.from, data.to, data.names);
                    };
                });
            });
            
            packer.on('disconnect', () => {
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
        omnes(prefix + '/omnes', prefix, (packer) => {
            fn();
            packer.on('connect', () => {
                authCheck(packer, () => {
                    extractFn = (data, callback) => {
                        setListeners(packer, {noContinue: true}, callback);
                        packer.extract(data.from, data.to);
                    };
                });
            });
            
            packer.on('disconnect', () => {
                extractFn = RESTful.extract;
            });
        });
    }
    
    function create(prefix) {
        const initSpero = currify(_initSpero);
        const initRemedy = currify(_initRemedy);
        const initPacker = currify(_initPacker);
        const initExtractor = currify(_initExtractor);
        
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
        
        let done;
        let lastError;
        
        const listeners = {
            progress: (value) => {
                done = value === 100;
                Images.setProgress(value);
            },
            
            end: () => {
                Images
                    .hide()
                    .clearProgress();
                
                Object.keys(listeners).forEach((name) => {
                    emitter.removeListener(name, listeners[name]);
                });
                
                if (lastError || done)
                    callback(lastError);
            },
            
            error: (error) => {
                lastError = error;
                
                if (options.noContinue) {
                    listeners.end(error);
                    Dialog.alert(TITLE, error);
                    return;
                }
                
                Dialog.confirm(TITLE, error + '\n Continue?')
                    .then(() => {
                        emitter.continue();
                    }, () => {
                        emitter.abort();
                    });
            }
        };
        
        const events = Object.keys(listeners);
        
        events.forEach((name) => {
            emitter.on(name, listeners[name]);
        });
    }
    
    this.hide = () => {
        CloudCmd.View.hide();
    };
    
    this.show = (operation, data) => {
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
    
    this.copy = (data) => {
        processFiles(data, copyFn, message('Copy'));
    };
    
    this.move = (data) => {
        processFiles(data, moveFn, message('Rename/Move'));
    };
    
    this.delete = () => {
        promptDelete();
    };
    
    this.deleteSilent = () => {
        deleteSilent();
    };
    
    this.pack = () => {
        const isZip = config('packer') === 'zip';
        twopack('pack', isZip ? 'zip' : 'tar');
    };
    
    this.extract = () => {
        twopack('extract');
    };
    
    /**
     * prompt and delete current file or selected files
     *
     * @currentFile
     */
    function promptDelete() {
        const msgAsk = 'Do you really want to delete the ';
        const msgSel = 'selected ';
        
        const files = DOM.getSelectedFiles();
        const names = DOM.getFilenames(files);
        const n = names.length;
        
        let msg;
        if (n) {
            let name = '';
            
            for (let i = 0; i < 5 && i < n; i++)
                name += '\n' + names[i];
            
            if (n >= 5)
                name += '\n...';
            
            msg = msgAsk + msgSel + n + ' files/directories?\n' + name ;
        } else {
            const current = DOM.getCurrentFile();
            const isDir = DOM.isCurrentIsDir(current);
            const getType = (isDir) => {
                return isDir ? 'directory' : 'file';
            };
            
            const type = getType(isDir) + ' ';
            
            const name = DOM.getCurrentName(current);
            msg = msgAsk + msgSel + type + name + '?';
        }
        
        if (name === '..')
            return Dialog.alert.noFiles(TITLE);
        
        const cancel = false;
        
        Dialog.confirm(TITLE, msg, {cancel}).then(() => {
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
        
        deleteFn(path + query, names, (error) => {
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
                
                operation(files, (error) => {
                    !error && DOM.Storage.remove(from, () => {
                        const panel = Info.panel;
                        const panelPassive = Info.panelPassive;
                        const setCurrent = () => {
                            if (!name)
                                name = data.names[0];
                            
                            DOM.setCurrentByName(name);
                        };
                        
                        if (!Info.isOnePanel)
                            CloudCmd.refresh({
                                panel: panelPassive,
                                noCurrent: true,
                            });
                        
                        CloudCmd.refresh({panel}, setCurrent);
                    });
                });
            }
        }
    }
    
    function checkEmpty(name, operation) {
        if (!operation)
            throw Error(name + ' could not be empty!');
    }
    
    function twopack(operation, type) {
        let op;
        let fileFrom;
        let currentName = Info.name;
        
        const Images = DOM.Images;
        const path = Info.path;
        const dirPath = Info.dirPath;
        const activeFiles = DOM.getActiveFiles();
        const names = DOM.getFilenames(activeFiles);
        
        checkEmpty('operation', operation);
        
        if (!names.length)
            return Dialog.alert.noFiles(TITLE);
        
        switch(operation) {
        case 'extract':
            op = extractFn;
            
            fileFrom   = {
                from: path,
                to: dirPath
            };
            
            currentName = removeExtension(currentName);
            
            break;
        
        case 'pack':
            op = packFn;
            
            if (names.length > 1)
                currentName  = Info.dir;
            
            currentName += DOM.getPackerExt(type);
            
            fileFrom = {
                from: dirPath,
                to: dirPath + currentName,
                names,
            };
            break;
        }
        
        Images.show.load('top');
        
        op(fileFrom, (error) => {
            !error && CloudCmd.refresh({
                currentName
            });
        });
    }
    
    function message(msg) {
        return (to, names) => {
            const n = names.length;
            const name = names[0];
            
            msg += ' ';
            
            if (names.length > 1)
                msg     += n + ' file(s)';
            else
                msg     += '"' + name + '"';
            
            msg += ' to';
            
            const cancel = false;
            
            return Dialog.prompt(TITLE, msg, to, {cancel});
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

