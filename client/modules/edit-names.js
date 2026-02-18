import {tryToCatch} from 'try-to-catch';
import exec from 'execon';
import {supermenu} from 'supermenu';
import {multiRename} from 'multi-rename';

const {CloudCmd, DOM} = globalThis;

CloudCmd.EditNames = {
    init,
    show,
    hide,
    isChanged,
};

const Info = DOM.CurrentInfo;
const {Dialog} = DOM;

let Menu;

const ConfigView = {
    beforeClose: async () => {
        exec.ifExist(Menu, 'hide');
        DOM.Events.remove('keydown', keyListener);
        await isChanged();
    },
};

export async function init() {
    await CloudCmd.Edit();
    
    setListeners();
}

export function show(options) {
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
}

async function keyListener(event) {
    const ctrl = event.ctrlKey;
    const meta = event.metaKey;
    const ctrlMeta = ctrl || meta;
    const {Key} = CloudCmd;
    
    if (ctrlMeta && event.keyCode === Key.S) {
        hide();
    } else if (ctrlMeta && event.keyCode === Key.P) {
        const [, pattern] = await Dialog.prompt('Apply pattern:', '[n][e]');
        pattern && applyPattern(pattern);
    }
}

function applyPattern(pattern) {
    const newNames = multiRename(pattern, getActiveNames());
    const editor = CloudCmd.Edit.getEditor();
    
    editor.setValue(newNames.join('\n'));
}

function getActiveNames() {
    return DOM.getFilenames(DOM.getActiveFiles());
}

export function hide() {
    CloudCmd.Edit.hide();
}

function setListeners() {
    const element = CloudCmd.Edit.getElement();
    
    DOM.Events.addOnce('contextmenu', element, setMenu);
}

async function applyNames() {
    const dir = Info.dirPath;
    const from = getActiveNames();
    const nameIndex = from.indexOf(Info.name);
    
    const editor = CloudCmd.Edit.getEditor();
    const to = editor
        .getValue()
        .split('\n');
    
    const root = CloudCmd.config('root');
    
    const response = rename(dir, from, to, root);
    const [error] = await tryToCatch(refresh, to, nameIndex, response);
    
    if (error)
        alert(error);
}

function refresh(to, nameIndex, res) {
    if (res.status === 404) {
        const error = res.text();
        throw error;
    }
    
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

function rename(path, from, to, root) {
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
        'Save           Ctrl+S': async () => {
            await applyNames();
            hide();
        },
        'Go To Line     Ctrl+G': () => {
            editor.goToLine();
        },
        'Cut            Ctrl+X': () => {
            editor.cutToClipboard();
        },
        'Copy           Ctrl+C': () => {
            editor.copyToClipboard();
        },
        'Paste          Ctrl+V': () => {
            editor.pasteFromClipboard();
        },
        'Delete         Del': () => {
            editor.remove('right');
        },
        'Select All     Ctrl+A': () => {
            editor.selectAll();
        },
        'Close          Esc': hide,
    };
    
    const element = CloudCmd.Edit.getElement();
    
    Menu = supermenu(element, options, menuData);
    
    Menu.addContextMenuListener();
    Menu.show(position.x, position.y);
}

export async function isChanged() {
    const editor = CloudCmd.Edit.getEditor();
    const msg = 'Apply new names?';
    
    if (!editor.isChanged())
        return;
    
    const [cancel] = await Dialog.confirm(msg);
    
    !cancel && await applyNames();
}
