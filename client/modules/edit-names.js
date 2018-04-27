'use strict';

/* global CloudCmd, DOM */

const currify = require('currify/legacy');
const exec = require('execon');
const supermenu = require('supermenu');

const reject = Promise.reject.bind(Promise);

CloudCmd.EditNames = function EditNamesProto(callback) {
    const Info = DOM.CurrentInfo;
    const Dialog = DOM.Dialog;
    
    const TITLE = 'Edit Names';
    const alert = currify(Dialog.alert, TITLE);
    const refresh = currify(_refresh);
    
    let Menu;
    
    const EditNames = this;
    const ConfigView  = {
        beforeClose: () => {
            exec.ifExist(Menu, 'hide');
            isChanged();
            DOM.Events.remove('keydown', keyListener);
        }
    };
    
    function init(callback) {
        let editor;
        
        exec.series([
            CloudCmd.Edit,
            
            (callback) => {
                editor = CloudCmd.Edit.getEditor();
                callback();
            },
            
            (callback) => {
                setListeners(editor);
                callback();
            },
            
            (callback) => {
                EditNames.show();
                callback();
            },
        ], callback);
    }
    
    this.show = () => {
        const names = getActiveNames().join('\n');
        
        if (Info.name === '..' && names.length === 1)
            return Dialog.alert.noFiles(TITLE);
        
        CloudCmd.Edit
            .getEditor()
            .setValueFirst('edit-names', names)
            .setMode()
            .setOption('keyMap', 'default')
            .disableKey();
        
        DOM.Events.addKey(keyListener);
        
        CloudCmd.Edit.show(ConfigView);
    };
    
    function keyListener(event) {
        const ctrl = event.ctrlKey;
        const meta = event.metaKey;
        const ctrlMeta = ctrl || meta;
        const Key = CloudCmd.Key;
        
        if (!ctrlMeta || event.keyCode !== Key.S)
            return;
        
        EditNames.hide();
    }
    
    function getActiveNames() {
        return DOM.getFilenames(DOM.getActiveFiles());
    }
    
    this.hide = () => {
        CloudCmd.Edit.hide();
    };
    
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
            currentName
        });
    }
    
    function getDir(root, dir) {
        if (root === '/')
            return dir;
        
        return root + dir;
    }
    
    function rename(dir, from, to) {
        return (root) => {
            return fetch(CloudCmd.PREFIX + '/rename', {
                method: 'put',
                credentials: 'include',
                body: JSON.stringify({
                    from: from,
                    to: to,
                    dir: getDir(root, dir)
                })
            });
        };
    }
    
    function setMenu(event) {
        const position = {
            x: event.clientX,
            y: event.clientY
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
            }
        };
        
        const menuData = {
            'Save           Ctrl+S' : () => {
                editor.save();
                EditNames.hide();
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
                EditNames.hide();
            }
        };
        
        const element = CloudCmd.Edit.getElement();
        
        Menu = supermenu(element, options, menuData);
        Menu.show(position.x, position.y);
    }
    
    function isChanged() {
        const editor = CloudCmd.Edit.getEditor();
        const msg = 'Apply new names?';
        
        if (!editor.isChanged())
            return;
        
        Dialog.confirm(TITLE, msg)
            .then(EditNames.hide)
            .then(applyNames)
            .catch(EditNames.hide);
    }
    
    init(callback);
};

