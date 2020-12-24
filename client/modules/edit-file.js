/* global CloudCmd, DOM*/

CloudCmd.EditFile = exports;

import Format from 'format-io';
import fullstore from 'fullstore';
import exec from 'execon';
import supermenu from 'supermenu';

const Info = DOM.CurrentInfo;

const {
    Dialog,
    Images,
} = DOM;

const {config} = CloudCmd;

let Menu;
let MSG_CHANGED;

const isLoading = fullstore();

const ConfigView = {
    beforeClose: async () => {
        exec.ifExist(Menu, 'hide');
        await isChanged();
    },
};

export const init = async () => {
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

export const show = (options) => {
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

export function hide() {
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
        Dialog.alert('Wrong credentials!');
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
    
    Menu.addContextMenuListener();
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
        'Close          Esc'    : hide,
    };
}

function setMsgChanged(name) {
    MSG_CHANGED = 'Do you want to save changes to ' + name + '?';
}

export async function isChanged() {
    const editor = CloudCmd.Edit.getEditor();
    const is = editor.isChanged();
    
    if (!is)
        return;
    
    const [cancel] = await Dialog.confirm(MSG_CHANGED);
    
    if (cancel)
        return;
    
    editor.save();
}

