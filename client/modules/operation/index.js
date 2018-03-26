/* global CloudCmd */
/* global Util */
/* global DOM */
/* global fileop */

'use strict';

CloudCmd.Operation = OperationProto;

const currify = require('currify/legacy');
const wraptile = require('wraptile/legacy');
const exec = require('execon');

const RESTful = require('../../dom/rest');
const removeExtension = require('./remove-extension');
const setListeners = require('./set-listeners');

const removeQuery = (a) => a.replace(/\?.*/, '');

function OperationProto(operation, data) {
    const Name = 'Operation';
    const {
        TITLE,
        config,
    } = CloudCmd;
    const {Dialog, Images} = DOM;
    const initOperations = wraptile(_initOperations);
    const authCheck = wraptile(_authCheck);
    
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
                
                load(initOperations(CloudCmd.PREFIX, callback));
            },
            () => {
                Loaded = true;
                Images.hide();
                Operation.show(operation, data);
            }
        ]);
    }
    
    function _authCheck(spawn, ok) {
        const accept = wraptile(ok);
        const alertDialog = wraptile(Dialog.alert);
        
        if (!config('auth'))
            return ok(spawn);
        
        spawn.on('accept', accept(spawn));
        spawn.on('reject', alertDialog (TITLE, 'Wrong credentials!'));
        spawn.emit('auth', config('username'), config('password'));
    }
    
    function _initOperations(socketPrefix, fn) {
        const prefix = `${socketPrefix}/fileop`;
        fileop({prefix, socketPrefix}, (e, operator) => {
            fn();
            
            operator.on('connect', authCheck(operator, onConnect));
            operator.on('disconnect', onDisconnect);
        });
    }
    
    function onConnect(operator) {
        packTarFn = (data, callback) => {
            operator.tar(data.from, data.to, data.names)
                .then(setListeners({noContinue: true}, callback));
        };
        
        packZipFn = (data, callback) => {
            operator.zip(data.from, data.to, data.names)
                .then(setListeners({noContinue: true}, callback));
        };
        
        deleteFn = (from, files, callback) => {
            from = removeQuery(from);
            operator.remove(from, files)
                .then(setListeners(callback));
        };
        
        copyFn = (data, callback) => {
            operator.copy(data.from, data.to, data.names)
                .then(setListeners(callback));
        };
        
        extractFn = (data, callback) => {
            operator.extract(data.from, data.to)
                .then(setListeners({noContinue: true}, callback));
        };
    }
    
    function onDisconnect() {
        packZipFn = RESTful.pack;
        packTarFn = RESTful.pack;
        deleteFn = RESTful.delete;
        copyFn = RESTful.cp;
        extractFn = RESTful.extract;
    }
    
    function getPacker(type) {
        if (type === 'zip')
            return packZipFn;
        
        return packTarFn;
    }
    
    this.hide = () => {
        CloudCmd.View.hide();
    };
    
    this.show = (operation, data) => {
        if (!Loaded)
            return;
        
        if (operation === 'copy')
            return Operation.copy(data);
        
        if (operation === 'move')
            return Operation.move(data);
        
        if (operation === 'delete')
            return Operation.delete();
        
        if (operation === 'delete:silent')
            return Operation.deleteSilent();
        
        if (operation === 'pack')
            return Operation.pack();
        
        if (operation === 'extract')
            return Operation.extract();
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
        const file = `${prefix}/fileop/fileop.js`;
        
        DOM.load.js(file, (error) => {
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

