/* global CloudCmd, DOM */

'use strict';

const Info = DOM.CurrentInfo;

const exec = require('execon');

const Events = require('./events');
const Buffer = require('./buffer');
const {escapeRegExp} = require('../common/util');

let Chars = [];
const KEY = {
    BACKSPACE   : 8,
    TAB         : 9,
    ENTER       : 13,
    ESC         : 27,
    
    SPACE       : 32,
    PAGE_UP     : 33,
    PAGE_DOWN   : 34,
    END         : 35,
    HOME        : 36,
    
    LEFT        : 37,
    UP          : 38,
    RIGHT       : 39,
    DOWN        : 40,
    
    INSERT      : 45,
    DELETE      : 46,
    
    ZERO        : 48,
    
    A           : 65,
    
    C           : 67,
    D           : 68,
    
    G           : 71,
    
    M           : 77,
    
    O           : 79,
    Q           : 81,
    R           : 82,
    S           : 83,
    T           : 84,
    U           : 85,
    
    V           : 86,
    
    X           : 88,
    
    Z           : 90,
    
    INSERT_MAC  : 96,
    
    ASTERISK    : 106,
    PLUS        : 107,
    MINUS       : 109,
    
    F1          : 112,
    F2          : 113,
    F3          : 114,
    F4          : 115,
    F5          : 116,
    F6          : 117,
    F7          : 118,
    F8          : 119,
    F9          : 120,
    F10         : 121,
    
    EQUAL       : 187,
    HYPHEN      : 189,
    DOT         : 190,
    SLASH       : 191,
    TRA         : 192, /* Typewritten Reverse Apostrophe (`) */
    BACKSLASH   : 220,
    
    BRACKET_CLOSE: 221
};

KeyProto.prototype = KEY;
CloudCmd.Key = KeyProto;

function KeyProto() {
    const Key = this;
    
    let Binded;
    
    this.isBind     = () => {
        return Binded;
    };
    
    this.setBind    = () => {
        Binded = true;
    };
    
    this.unsetBind  = () => {
        Binded = false;
    };
    
    this.bind   = () => {
        Events.addKey(listener);
        Binded = true;
    };
    
    function getChar(event) {
         /*
          * event.keyIdentifier deprecated in chrome v51
          * but event.key is absent in chrome <= v51
          */
        
        if (event.key)
            return event.key;
        
        return fromCharCode(event.keyIdentifier);
    }
    
    function listener(event) {
        const keyCode = event.keyCode;
        const alt = event.altKey;
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const meta = event.metaKey;
        const isBetween = keyCode >= KEY.ZERO && keyCode <= KEY.Z;
        const isNumpad = /Numpad/.test(event.code);
        
        let char = getChar(event);
        let isSymbol = ~['.', '_', '-', '+', '='].indexOf(char);
        
        if (!isSymbol) {
            isSymbol = getSymbol(shift, keyCode);
            
            if (isSymbol)
                char = isSymbol;
        }
        
        /* in case buttons can be processed */
        if (Key.isBind())
            if (!isNumpad && !alt && !ctrl && !meta && (isBetween || isSymbol))
                setCurrentByChar(char);
            else {
                Chars       = [];
                switchKey(event);
            }
    }
    
    function getSymbol(shift, keyCode) {
        switch (keyCode) {
        case KEY.DOT:
            return '.';
        
        case KEY.HYPHEN:
            return shift ? '_' : '-';
        
        case KEY.EQUAL:
            return shift ? '+' : '=';
        }
    }
    
    function fromCharCode(keyIdentifier) {
        const code = keyIdentifier.substring(2);
        const hex = parseInt(code, 16);
        const char = String.fromCharCode(hex);
        
        return char;
    }
    
    function setCurrentByChar(char) {
        let firstByName;
        let skipCount = 0;
        let setted = false;
        let i = 0;
        
        const escapeChar = escapeRegExp(char);
        const regExp = new RegExp('^' + escapeChar + '.*$', 'i');
        const {files} = Info;
        const n = Chars.length;
        
        while(i < n && char === Chars[i]) {
            i++;
        }
        
        if (!i)
            Chars = [];
        
        const skipN = skipCount = i;
        Chars.push(char);
        
        const names = DOM.getFilenames(files);
        const isTest = (a) => regExp.test(a);
        const isRoot = (a) => a === '..';
        const not = (f) => (a) => !f(a);
        const setCurrent = (name) => {
            const byName = DOM.getCurrentByName(name);
            
            if (!skipCount) {
                setted = true;
                DOM.setCurrentFile(byName);
                return true;
            } else {
                if (skipN === skipCount)
                    firstByName = byName;
                
                --skipCount;
            }
        };
        
        names
            .filter(isTest)
            .filter(not(isRoot))
            .some(setCurrent);
        
        if (!setted) {
            DOM.setCurrentFile(firstByName);
            Chars = [char];
        }
    }
    
    function switchKey(event) {
        let i, isSelected, prev, next;
        let current = Info.element;
        let name = Info.name;
        
        const {Operation} = CloudCmd;
        const panel = Info.panel;
        const path = Info.path;
        const isDir = Info.isDir;
        
        const keyCode = event.keyCode;
        const alt = event.altKey;
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        const meta = event.metaKey;
        const ctrlMeta = ctrl || meta;
        
        if (current) {
            prev = current.previousSibling;
            next = current.nextSibling;
        }
        
        switch (keyCode) {
        case Key.TAB:
            DOM.changePanel();
            event.preventDefault();
            break;
        
        case Key.INSERT:
            DOM .toggleSelectedFile(current)
                .setCurrentFile(next);
            break;
        
        case Key.INSERT_MAC:
            DOM .toggleSelectedFile(current)
                .setCurrentFile(next);
            break;
        
        case Key.DELETE:
            if (shift)
                Operation.show('delete:silent');
            else
                Operation.show('delete');
            break;
        
        case Key.ASTERISK:
            DOM.toggleAllSelectedFiles(current);
            break;
        
        case Key.PLUS:
            DOM.expandSelection();
            event.preventDefault();
            break;
        
        case Key.MINUS:
            DOM.shrinkSelection();
            event.preventDefault();
            break;
        
        case Key.F1:
            CloudCmd.Help.show();
            event.preventDefault();
            break;
        
        case Key.F2:
            DOM.renameCurrent(current);
            break;
            
        case Key.F3:
            if (shift)
                CloudCmd.Markdown.show(path);
            else if (ctrlMeta)
                CloudCmd.sortPanel('name');
            else
                CloudCmd.View.show();
            
            event.preventDefault();
            break;
        
        case Key.F4:
            CloudCmd.EditFile.show();
            event.preventDefault();
            break;
        
        case Key.F5:
            if (ctrlMeta)
                CloudCmd.sortPanel('date');
            else
                Operation.show('copy');
            
            event.preventDefault();
            break;
        
        case Key.F6:
            if (ctrlMeta)
                CloudCmd.sortPanel('size');
            else
                Operation.show('move');
            
            event.preventDefault();
            break;
        
        case Key.F7:
            if (shift)
                DOM.promptNewFile();
            else
                DOM.promptNewDir();
            
            event.preventDefault();
            break;
        
        case Key.F8:
            Operation.show('delete');
            event.preventDefault();
            break;
        
        case Key.F9:
            CloudCmd.Menu.show();
            event.preventDefault();
            break;
        
        case Key.F10:
            CloudCmd.Config.show();
            event.preventDefault();
            break;
        
        case Key.TRA:
            CloudCmd.Konsole.show();
            event.preventDefault();
            break;
        
        case KEY.BRACKET_CLOSE:
            CloudCmd.Konsole.show();
            event.preventDefault();
            break;
            
        case Key.SPACE:
            if (!isDir || name === '..')
                isSelected = true;
            else
                isSelected = DOM.isSelected(current);
                
            exec.if(isSelected, () => {
                DOM.toggleSelectedFile(current);
            }, (callback) => {
                DOM.loadCurrentSize(callback, current);
            });
            
            event.preventDefault();
            break;
        
        case Key.U:
            if (ctrlMeta) {
                DOM.swapPanels();
                event.preventDefault();
            }
            break;
        
        /* navigation on file table:        *
         * in case of pressing button 'up', *
         * select previous row              */
        case Key.UP:
            if (shift)
                DOM.toggleSelectedFile(current);
            
            DOM.setCurrentFile(prev);
            event.preventDefault();
            break;
        
        /* in case of pressing button 'down', *
         * select next row                    */
        case Key.DOWN:
            if (shift)
                DOM.toggleSelectedFile(current);
            
            DOM.setCurrentFile(next);
            event.preventDefault();
            break;
        
        case Key.LEFT:
            if (!alt)
                return;
            
            event.preventDefault();
            
            name = Info.panel.getAttribute('data-name');
            
            if (name === 'js-right')
                DOM.duplicatePanel();
            
            break;
        
        case Key.RIGHT:
            if (!alt)
                return;
           
            event.preventDefault();
            
            name = Info.panel.getAttribute('data-name');
            
            if (name === 'js-left')
                DOM.duplicatePanel();
            
            break;
        
        /* in case of pressing button 'Home',  *
         * go to top element                   */
        case Key.HOME:
            DOM.setCurrentFile(Info.first);
            event.preventDefault();
            break;
        
        /* in case of pressing button 'End', select last element */
        case Key.END:
            DOM.setCurrentFile(Info.last);
            event.preventDefault();
            break;
        
        /* если нажали клавишу page down проматываем экран */
        case Key.PAGE_DOWN:
            DOM.scrollByPages(panel, 1);
            
            for (i = 0; i < 30; i++) {
                if (!current.nextSibling)
                    break;
                
                current = current.nextSibling;
            }
            
            DOM.setCurrentFile(current);
            event.preventDefault();
            break;
        
        /* если нажали клавишу page up проматываем экран */
        case Key.PAGE_UP:
            DOM.scrollByPages(panel, -1);
            
            for (i = 0; i < 30; i++) {
                if (!current.previousSibling)
                    break;
                
                current = current.previousSibling;
            }
            
            DOM.setCurrentFile(current);
            event.preventDefault();
            break;
            
        /* open directory */
        case Key.ENTER:
            if (Info.isDir)
                CloudCmd.loadDir({
                    path: path === '/' ? '/' : path + '/'
                });
            break;
            
        case Key.BACKSPACE:
            CloudCmd.goToParentDir();
            event.preventDefault();
            break;
        
        case Key.BACKSLASH:
            if (ctrlMeta)
                CloudCmd.loadDir({
                    path: '/'
                });
            break;
        
        case Key.A:
            if (ctrlMeta) {
                DOM.selectAllFiles();
                event.preventDefault();
            }
            
            break;
        
        case Key.G:
            if (alt) {
                DOM.goToDirectory();
                event.preventDefault();
            }
            
            break;
        
        case Key.M:
            if (ctrlMeta) {
                CloudCmd.EditNames.show();
                event.preventDefault();
            }
            
            break;
        
        /**
         * обновляем страницу,
         * загружаем содержимое каталога
         * при этом данные берём всегда с
         * сервера, а не из кэша
         * (обновляем кэш)
         */
        case Key.R:
            if (ctrlMeta) {
                CloudCmd.log('reloading page...\n');
                CloudCmd.refresh();
                event.preventDefault();
            }
            break;
        
        case Key.C:
            if (ctrlMeta)
                Buffer.copy();
            break;
        
        case Key.X:
            if (ctrlMeta)
                Buffer.cut();
            break;
            
        case Key.V:
            if (ctrlMeta)
                Buffer.paste();
            break;
        
        case Key.Z:
            if (ctrlMeta)
                Buffer.clear();
            break;
        
        /* чистим хранилище */
        case Key.D:
            if (ctrlMeta) {
                CloudCmd.log('clearing storage...');
                
                DOM.Storage.clear(() => {
                    CloudCmd.log('storage cleared');
                });
                
                event.preventDefault();
            }
            break;
        }
    }
}

