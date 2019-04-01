'use strict';

/* global CloudCmd, DOM*/

CloudCmd.EditFile = exports;

const Format = require('format-io/legacy');
const fullstore = require('fullstore/legacy');
const exec = require('execon');
const supermenu = require('supermenu');

const Info = DOM.CurrentInfo;

const {
    Dialog,
    Images,
} = DOM;

const {config} = CloudCmd;

let Menu;

const TITLE = 'Edit';

let MSG_CHANGED;
const isLoading = fullstore();

const ConfigView = {
    beforeClose: () => {
        exec.ifExist(Menu, 'hide');
        isChanged();
    },
};

module.exports.init = async () => {
    isLoading(true);
    
    await CloudCmd.Edit();
    
    const editor = CloudCmd.Edit.getEditor();
    authCheck(editor);
    setListeners(editor);
    
    isLoading(false);
};

function getName() {
    const {name, isDir} = Info;
    
    if (isDir)
        return `${name}.json`;
    
    return name;
}

module.exports.show = (options) => {
    if (isLoading())
        return;
    
    const optionsEdit = {
        ...ConfigView,
        ...options,
    };
    
    if (CloudCmd.config('showFileName'))
        optionsEdit.title = Info.name;
    
    Images.show.load();
    
    CloudCmd.Edit
        .getEditor()
        .setOption('keyMap', 'default');
    
    Info.getData((error, data) => {
        const {path} = Info;
        const name = getName();
        
        if (error)
            return Images.hide();
        
        setMsgChanged(name);
        
        CloudCmd.Edit
            .getEditor()
            .setValueFirst(path, data)
            .setModeForPath(name)
            .enableKey();
        
        CloudCmd.Edit.show(optionsEdit);
    });
    
    return CloudCmd.Edit;
};

module.exports.hide = hide;

function hide() {
    CloudCmd.Edit.hide();
}

function setListeners(editor) {
    const element = CloudCmd.Edit.getElement();
    
    DOM.Events.addOnce('contextmenu', element, setMenu);
    
    editor.on('save', (value) => {
        DOM.setCurrentSize(Format.size(value));
    });
}

function authCheck(spawn) {
    spawn.emit('auth', config('username'), config('password'));
    spawn.on('reject', () => {
        Dialog.alert(TITLE, 'Wrong credentials!');
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
    
    const options = {
        beforeShow: (params) => {
            params.x -= 18;
            params.y -= 27;
        },
        
        afterClick: () => {
            CloudCmd.Edit
                .getEditor()
                .focus();
        },
    };
    
    const element = CloudCmd.Edit.getElement();
    
    Menu = supermenu(element, options, getMenuData());
    Menu.show(position.x, position.y);
}

function getMenuData() {
    const editor = CloudCmd.Edit.getEditor();
    
    return {
        'Save           Ctrl+S' : () => {
            editor.save();
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
        'Close          Esc'    : () => {
            hide();
        },
    };
}

function setMsgChanged(name) {
    MSG_CHANGED = 'Do you want to save changes to ' + name + '?';
}

module.exports.isChanged = isChanged;

function isChanged() {
    const editor = CloudCmd.Edit.getEditor();
    const is = editor.isChanged();
    
    if (!is)
        return;
    
    const cancel = false;
    Dialog.confirm(TITLE, MSG_CHANGED, {cancel})
        .then(() => {
            editor.save();
        });
}

