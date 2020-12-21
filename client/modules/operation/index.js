/* global CloudCmd */
/* global Util */
/* global DOM */
/* global fileop */

'use strict';

const currify = require('currify');
const wraptile = require('wraptile');
const {promisify} = require('es6-promisify');
const exec = require('execon');
const load = require('load.js');
const tryToCatch = require('try-to-catch');

const {encode} = require('../../../common/entity');
const removeExtension = require('./remove-extension');
const setListeners = require('./set-listeners');
const getNextCurrentName = require('./get-next-current-name');

const removeQuery = (a) => a.replace(/\?.*/, '');

const Name = 'Operation';
CloudCmd[Name] = exports;

const {config} = CloudCmd;
const {Dialog, Images} = DOM;

const authCheck = wraptile(_authCheck);
const Operation = {};

let Loaded;

let copyFn;
let moveFn;
let deleteFn;
let extractFn;
let packZipFn;
let packTarFn;

const Info = DOM.CurrentInfo;
const showLoad = Images.show.load.bind(null, 'top');

const processFiles = currify(_processFiles);

const noFilesCheck = () => {
    const {length} = DOM.getActiveFiles();
    const is = Boolean(!length);
    
    if (is)
        return Dialog.alert.noFiles();
    
    return is;
};

module.exports.init = promisify((callback) => {
    showLoad();
    
    exec.series([
        DOM.loadSocket,
        async (callback) => {
            if (config('dropbox'))
                return callback();
            
            const {
                prefix,
                prefixSocket,
            } = CloudCmd;
            
            await loadAll();
            await initOperations(prefix, prefixSocket, callback);
        },
        (callback) => {
            Loaded = true;
            Images.hide();
            callback();
        },
    ], callback);
});

function _authCheck(spawn, ok) {
    const accept = wraptile(ok);
    const alertDialog = wraptile(Dialog.alert);
    
    spawn.on('accept', accept(spawn));
    spawn.on('reject', alertDialog ('Wrong credentials!'));
    spawn.emit('auth', config('username'), config('password'));
}

const onConnect = currify((fn, operator) => {
    setOperations(operator);
    fn();
});

async function initOperations(prefix, socketPrefix, fn) {
    socketPrefix = `${socketPrefix}/fileop`;
    
    const operator = await fileop({prefix, socketPrefix});
    operator.on('connect', authCheck(operator, onConnect(fn)));
}

function setOperations(operator) {
    packTarFn = ({from, to, names}, callback) => {
        const operation = 'Tar';
        const listen = setListeners({
            operation,
            callback,
            noContinue: true,
            from,
            to,
        });
        
        operator.tar(from, to, names)
            .then(listen);
    };
    
    packZipFn = ({from, to, names}, callback) => {
        const operation = 'Zip';
        const listen = setListeners({
            operation,
            callback,
            noContinue: true,
            from,
            to,
        });
        
        operator.zip(from, to, names)
            .then(listen);
    };
    
    deleteFn = (from, files, callback) => {
        from = removeQuery(from);
        
        const operation = 'Delete';
        const listen = setListeners({
            operation,
            callback,
            from,
        });
        
        operator.remove(from, files)
            .then(listen);
    };
    
    copyFn = ({from, to, names}, callback) => {
        const operation = 'Copy';
        const listen = setListeners({
            operation,
            callback,
            from,
            to,
            names,
        });
        
        operator.copy(from, to, names)
            .then(listen);
    };
    
    moveFn = ({from, to, names}, callback) => {
        const operation = 'Move';
        const listen = setListeners({
            operation,
            callback,
            from,
            to,
        });
        
        operator.move(from, to, names)
            .then(listen);
    };
    
    extractFn = ({from, to}, callback) => {
        const operation = 'Extract';
        const listen = setListeners({
            operation,
            callback,
            noContinue: true,
            from,
            to,
        });
        
        operator.extract(from, to)
            .then(listen);
    };
}

function getPacker(type) {
    if (type === 'zip')
        return packZipFn;
    
    return packTarFn;
}

module.exports.hide = () => {
    CloudCmd.View.hide();
};

module.exports.show = (operation, data) => {
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

Operation.copy = processFiles({
    type: 'copy',
});

Operation.move = processFiles({
    type: 'move',
});

Operation.delete = promptDelete;

Operation.deleteSilent = deleteSilent;

Operation.pack = () => {
    const isZip = config('packer') === 'zip';
    twopack('pack', isZip ? 'zip' : 'tar');
};

Operation.extract = () => {
    twopack('extract');
};

/**
 * prompt and delete current file or selected files
 *
 * @currentFile
 */
async function promptDelete() {
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
        
        msg = msgAsk + msgSel + n + ' files/directories?\n' + encode(name);
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
    
    const [cancel] = await Dialog.confirm(msg);
    
    if (cancel)
        return;
    
    deleteSilent(files);
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
    
    const removedNames = DOM.getFilenames(files);
    const names = DOM.CurrentInfo.files.map(DOM.getCurrentName);
    const currentName = DOM.getCurrentName();
    const nextCurrentName = getNextCurrentName(currentName, names, removedNames);
    
    deleteFn(path + query, removedNames, async () => {
        await CloudCmd.refresh();
        
        const names = Info.files.map(DOM.getCurrentName);
        const isCurrent = names.includes(currentName);
        
        const name = isCurrent ? currentName : nextCurrentName;
        
        DOM.setCurrentByName(name);
    });
}

/*
 * process files (copy or move)
 * @param data
 * @param operation
 */
async function _processFiles(options, data) {
    let selFiles;
    let files;
    let panel;
    let shouldAsk;
    let ok;
    
    let from = '';
    let to = '';
    
    let names = [];
    
    /* eslint no-multi-spaces: 0 */
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
    
    const [name] = names;
    
    const sameName = DOM.getCurrentByName(name, panel);
    
    if (!data && noFilesCheck())
        return;
    
    const {type} = options;
    
    const isCopy = type === 'copy';
    const option = isCopy ? 'confirmCopy' : 'confirmMove';
    const title = isCopy ? 'Copy' : 'Rename/Move';
    const operation = isCopy ? copyFn : moveFn;
    
    if (shouldAsk && config(option)) {
        const [cancel, newTo] = await prompt(title, to, names.map(encode));
        
        if (!cancel)
            ask(newTo);
        
        return;
    }
    
    ask(to);
    
    function ask(to) {
        ok = from !== to && to;
        
        if (ok && !shouldAsk || !sameName)
            return go();
        
        const str = `"${ name }" already exist. Overwrite?`;
        const cancel = false;
        
        Dialog.confirm(str, {cancel}).then(go);
        
        function go() {
            showLoad();
            
            files = {
                from,
                to,
                names,
            };
            
            operation(files, async () => {
                await DOM.Storage.remove(from);
                
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
    
    const {
        path,
        dirPath,
    } = Info;
    
    const activeFiles = DOM.getActiveFiles();
    const names = DOM.getFilenames(activeFiles);
    
    checkEmpty('operation', operation);
    
    if (!names.length)
        return Dialog.alert.noFiles();
    
    switch(operation) {
    case 'extract':
        op = extractFn;
        
        fileFrom   = {
            from: path,
            to: dirPath,
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
    
    showLoad();
    
    op(fileFrom, (error) => {
        !error && CloudCmd.refresh({
            currentName,
        });
    });
}

async function prompt(msg, to, names) {
    const n = names.length;
    const [name] = names;
    
    msg += ' ';
    
    if (names.length > 1)
        msg     += n + ' file(s)';
    else
        msg     += '"' + name + '"';
    
    msg += ' to';
    
    return Dialog.prompt(msg, to);
}

async function loadAll() {
    const {prefix} = CloudCmd;
    const file = `${prefix}/fileop/fileop.js`;
    
    const [error] = await tryToCatch(load.js, file);
    
    if (error)
        Dialog.alert(error.message);
    
    Loaded = true;
}

