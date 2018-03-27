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
const wraptile = require('wraptile/legacy');
const exec = require('execon');
const forEachKey = require('../../../common/for-each-key');

const RESTful = require('../../dom/rest');
const removeExtension = require('./remove-extension');

function OperationProto(operation, data) {
    const Name = 'Operation';
    const TITLE = CloudCmd.TITLE;
    const {config} = CloudCmd;
    const {Dialog, Images} = DOM;
    const create = wraptile(_create);
    
    let Loaded;
    
    let {
        cp: copyFn,
        mv: moveFn,
        delete: deleteFn,
        extract: extractFn,
    } = RESTful;
    
    let packZipFn = RESTful.pack;
    let packTarFn = RESTful.pack;
    
    const Info = DOM.CurrentInfo;
    const showLoad = Images.show.load.bind(null, 'top');
    const Operation = this;
    const processFiles = currify(_processFiles);
    
    const noFilesCheck = () => {
        const {length} = DOM.getActiveFiles();
        const is = Boolean(!length);
        
        if (is)
            return Dialog.alert.noFiles(TITLE);
        
        return is;
    };
    
    function init() {
        showLoad();
        
        exec.series([
            DOM.loadSocket,
            (callback) => {
                if (!config('progress'))
                    return callback();
                
                load(create(CloudCmd.PREFIX, callback));
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
                deleteFn = RESTful.delete;
            });
        });
    }
    
    function _setTarPacker(prefix, name, pack, fn) {
        pack(prefix + '/' + name, prefix, (packer) => {
            fn();
            packer.on('connect', () => {
                authCheck(packer, () => {
                    packTarFn = (data, callback) => {
                        setListeners(packer, {noContinue: true}, callback);
                        packer.pack(data.from, data.to, data.names);
                    };
                });
            });
            
            packer.on('disconnect', () => {
                packTarFn = RESTful.pack;
            });
        });
    }
    
    function _setZipPacker(prefix, name, pack, fn) {
        pack(prefix + '/' + name, prefix, (packer) => {
            fn();
            packer.on('connect', () => {
                authCheck(packer, () => {
                    packZipFn = (data, callback) => {
                        setListeners(packer, {noContinue: true}, callback);
                        packer.pack(data.from, data.to, data.names);
                    };
                });
            });
            
            packer.on('disconnect', () => {
                packZipFn = RESTful.pack;
            });
        });
    }
    
    function _initPacker(prefix, fn) {
        _setZipPacker(prefix, 'salam', salam, fn);
        _setTarPacker(prefix, 'ishtar', ishtar, fn);
    }
    
    function getPacker(type) {
        if (type === 'zip')
            return packZipFn;
        
        return packTarFn;
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
    
    function _create(prefix, callback) {
        const initSpero = currify(_initSpero);
        const initRemedy = currify(_initRemedy);
        const initPacker = currify(_initPacker);
        const initExtractor = currify(_initExtractor);
        
        exec.parallel([
            initSpero(prefix),
            initRemedy(prefix),
            initPacker(prefix),
            initExtractor(prefix)
        ], callback);
    }
    
    function setListeners(emitter, options, callback) {
        if (!callback) {
            callback = options;
            options = {};
        }
        
        let done;
        let lastError;
        
        const removeListener = emitter.removeListener.bind(emitter);
        const on = emitter.on.bind(emitter);
        
        const listeners = {
            progress: (value) => {
                done = value === 100;
                Images.setProgress(value);
            },
            
            end: () => {
                Images
                    .hide()
                    .clearProgress();
                
                forEachKey(removeListener, listeners);
                
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
        
        forEachKey(on, listeners);
    }
    
    this.hide = () => {
        CloudCmd.View.hide();
    };
    
    this.show = (operation, data) => {
        if (!Loaded)
            return;
        
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
    
    this.copy = processFiles({
        type: 'copy',
    });
    
    this.move = processFiles({
        type: 'move'
    });
    
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
        if (noFilesCheck())
            return;
        
        const msgAsk = 'Do you really want to delete the ';
        const msgSel = 'selected ';
        
        const files = DOM.getActiveFiles();
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
    function deleteSilent(files = DOM.getActiveFiles()) {
        const query = '?files';
        const path = Info.dirPath;
        
        if (noFilesCheck())
            return;
        
        showLoad();
        
        const names = DOM.getFilenames(files);
        
        deleteFn(path + query, names, (error) => {
            const Storage = DOM.Storage;
            const dirPath = Info.dirPath;
            
            if (error)
                return CloudCmd.refresh();
             
            DOM.deleteSelected(files);
            Storage.removeMatch(dirPath);
        });
    }
    
    /*
     * process files (copy or move)
     * @param data
     * @param operation
     */
    function _processFiles(options, data) {
        let selFiles, files;
        let panel;
        let shouldAsk;
        let sameName;
        let ok;
        
        let from = '';
        let to = '';
        
        let names = [];
        
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
        
        const name = names[0];
        
        sameName = DOM.getCurrentByName(name, panel);
        
        if (!data && noFilesCheck())
            return;
        
        const {type} = options;
        
        const isCopy = type === 'copy';
        const option = isCopy ? 'confirmCopy' : 'confirmMove';
        const title = isCopy ? 'Copy' : 'Rename/Move';
        const operation = isCopy ? copyFn : moveFn;
        
        if (shouldAsk && config(option))
            return message(title, to, names)
                .then(ask);
        
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
                        const {
                            panel,
                            panelPassive,
                        } = Info;
                        
                        const setCurrent = () => {
                            const currentName = name || data.names[0];
                            DOM.setCurrentByName(currentName);
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
            op = getPacker(type);
            
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
    
    function message(msg, to, names) {
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
            if (error) {
                Dialog.alert(TITLE, error.message);
                return exec(callback);
            }
            
            Loaded = true;
            Util.timeEnd(Name + ' load');
            exec(callback);
        });
        
        Util.time(Name + ' load');
    }
    
    init();
}

