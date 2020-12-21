'use strict';

/* global CloudCmd, DOM */

CloudCmd.EditNames = exports;

const currify = require('currify');
const exec = require('execon');
const supermenu = require('supermenu');
const multiRename = require('multi-rename');

const reject = Promise.reject.bind(Promise);

const Info = DOM.CurrentInfo;
const {Dialog} = DOM;

const refresh = currify(_refresh);
const rename = currify(_rename);

let Menu;

const ConfigView = {
    beforeClose: async () => {
        exec.ifExist(Menu, 'hide');
        DOM.Events.remove('keydown', keyListener);
        await isChanged();
    },
};

module.exports.init = async () => {
    await CloudCmd.Edit();
    
    setListeners();
};

module.exports.show = (options) => {
    const names = getActiveNames().join('\n');
    const config = {
        ...ConfigView,
        ...options,
    };
    
    if (Info.name === '..' && names.length === 1)
        return Dialog.alert.noFiles();
    
    DOM.Events.addKey(keyListener);
    
    CloudCmd.Edit
        .getEditor()
        .setValueFirst('edit-names', names)
        .setMode()
        .setOption('keyMap', 'default')
        .disableKey();
    
    CloudCmd.Edit.show(config);
    
    return CloudCmd.Edit;
};

async function keyListener(event) {
    const ctrl = event.ctrlKey;
    const meta = event.metaKey;
    const ctrlMeta = ctrl || meta;
    const {Key} = CloudCmd;
    
    if (ctrlMeta && event.keyCode === Key.S)
        hide();
    
    else if (ctrlMeta && event.keyCode === Key.P) {
        const [, pattern] = await Dialog.prompt('Apply pattern:', '[n][e]');
        pattern && applyPattern(pattern);
    }
    
    event.preventDefault();
}

function applyPattern(pattern) {
    const newNames = multiRename(pattern, getActiveNames());
    const editor = CloudCmd.Edit.getEditor();
    
    editor.setValue(newNames.join('\n'));
}

function getActiveNames() {
    return DOM.getFilenames(DOM.getActiveFiles());
}

module.exports.hide = hide;

function hide() {
    CloudCmd.Edit.hide();
}

function setListeners() {
    const element = CloudCmd.Edit.getElement();
    
    DOM.Events.addOnce('contextmenu', element, setMenu);
}

function applyNames() {
    const dir = Info.dirPath;
    const from = getActiveNames();
    const nameIndex = from.indexOf(Info.name);
    
    const editor = CloudCmd.Edit.getEditor();
    const to = editor
        .getValue()
        .split('\n');
    
    const root = CloudCmd.config('root');
    
    Promise.resolve(root)
        .then(rename(dir, from, to))
        .then(refresh(to, nameIndex))
        .catch(alert);
}

function _refresh(to, nameIndex, res) {
    if (res.status === 404)
        return res.text().then(reject);
    
    const currentName = to[nameIndex];
    
    CloudCmd.refresh({
        currentName,
    });
}

function getDir(root, dir) {
    if (root === '/')
        return dir;
    
    return root + dir;
}

function _rename(path, from, to, root) {
    const dir = getDir(root, path);
    const {prefix} = CloudCmd;
    
    return fetch(`${prefix}/rename`, {
        method: 'put',
        credentials: 'include',
        body: JSON.stringify({
            from,
            to,
            dir,
        }),
    });
}

function setMenu(event) {
    const position = {
        x: event.clientX,
        y: event.clientY,
    };
    
    event.preventDefault();
    
    if (Menu)
        return;
    
    const editor = CloudCmd.Edit.getEditor();
    const options = {
        beforeShow: (params) => {
            params.x -= 18;
            params.y -= 27;
        },
        
        afterClick: () => {
            editor.focus();
        },
    };
    
    const menuData = {
        'Save           Ctrl+S' : () => {
            applyNames();
            hide();
        },
        'Go To Line     Ctrl+G' : () => {
            editor.goToLine();
        },
        'Cut            Ctrl+X' : () => {
            editor.cutToClipboard();
        },
        'Copy           Ctrl+C' : () => {
            editor.copyToClipboard();
        },
        'Paste          Ctrl+V' : () => {
            editor.pasteFromClipboard();
        },
        'Delete         Del'    : () => {
            editor.remove('right');
        },
        'Select All     Ctrl+A' : () => {
            editor.selectAll();
        },
        'Close          Esc'    : hide,
    };
    
    const element = CloudCmd.Edit.getElement();
    
    Menu = supermenu(element, options, menuData);
    
    Menu.addContextMenuListener();
    Menu.show(position.x, position.y);
}

module.exports.isChanged = isChanged;

async function isChanged() {
    const editor = CloudCmd.Edit.getEditor();
    const msg = 'Apply new names?';
    
    if (!editor.isChanged())
        return;
    
    const [, names] = await Dialog.confirm(msg);
    names && applyNames();
}

