/* global CloudCmd, DOM */

'use strict';

const Info = DOM.CurrentInfo;

const exec = require('execon');
const clipboard = require('@cloudcmd/clipboard');
const wraptile = require('wraptile/legacy');

const Events = require('../dom/events');
const Buffer = require('../dom/buffer');
const KEY = require('./key');
const vim = require('./vim');
const setCurrentByChar = require('./set-current-by-char');
const fullstore = require('fullstore/legacy');
const Chars = fullstore();

Chars([]);

KeyProto.prototype = KEY;
CloudCmd.Key = KeyProto;
const {loadDir} = CloudCmd;

function KeyProto() {
    let Binded;
    
    const Key = this;
    
    this.isBind = () => {
        return Binded;
    };
    
    this.setBind = () => {
        Binded = true;
    };
    
    this.unsetBind = () => {
        Binded = false;
    };
    
    this.bind = () => {
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
        const {keyCode} = event;
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
        
        if (!Key.isBind())
            return;
        
        const isVim = CloudCmd.config('vim');
        
        if (!isVim && !isNumpad && !alt && !ctrl && !meta && (isBetween || isSymbol))
            return setCurrentByChar(char, Chars);
        
        Chars([]);
        switchKey(event);
        
        if (keyCode >= KEY.F1 && keyCode <= KEY.F10)
            return;
        
        if (isVim)
            vim(char, event);
    }
    
    function getSymbol(shift, keyCode) {
        switch(keyCode) {
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
    
    function switchKey(event) {
        let i;
        let isSelected;
        let prev;
        let next;
        let current = Info.element;
        let dataName;
        
        const {
            name,
            panel,
            path,
            isDir,
        } = Info;
        
        const {Operation} = CloudCmd;
        const {keyCode} = event;
        
        const alt = event.altKey;
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        const meta = event.metaKey;
        const ctrlMeta = ctrl || meta;
        
        if (current) {
            prev = current.previousSibling;
            next = current.nextSibling;
        }
        
        switch(keyCode) {
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
            if (Info.isDir)
                loadDir({path});
            else if (shift)
                CloudCmd.Markdown.show(path);
            else if (ctrlMeta)
                CloudCmd.sortPanel('name');
            else
                CloudCmd.View.show();
            
            event.preventDefault();
            break;
        
        case Key.F4:
            if (shift)
                CloudCmd.EditFileVim.show();
            else
                CloudCmd.EditFile.show();
            
            event.preventDefault();
            break;
        
        case Key.F5:
            if (ctrlMeta)
                CloudCmd.sortPanel('date');
            else if (alt)
                Operation.show('pack');
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
            if (alt)
                Operation.show('extract');
            else
                CloudCmd.Menu.show();
            event.preventDefault();
            break;
        
        case Key.F10:
            CloudCmd.Config.show();
            event.preventDefault();
            break;
        
        case Key.TRA:
            event.preventDefault();
            
            if (shift)
                return CloudCmd.Terminal.show();
            
            CloudCmd.Konsole.show();
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
            
            dataName = Info.panel.getAttribute('data-name');
            
            if (dataName === 'js-right')
                DOM.duplicatePanel();
            
            break;
        
        case Key.RIGHT:
            if (!alt)
                return;
            
            event.preventDefault();
            
            dataName = Info.panel.getAttribute('data-name');
            
            if (dataName === 'js-left')
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
        
        case Key.ENTER:
            if (Info.isDir)
                loadDir({path});
            else
                CloudCmd.View.show();
            break;
        
        case Key.BACKSPACE:
            CloudCmd.goToParentDir();
            event.preventDefault();
            break;
        
        case Key.BACKSLASH:
            if (ctrlMeta)
                loadDir({
                    path: '/',
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
                if (shift)
                    CloudCmd.EditNamesVim.show();
                else
                    CloudCmd.EditNames.show();
                
                event.preventDefault();
            }
            
            break;
        
        case Key.P:
            if (!ctrlMeta)
                return;
            
            event.preventDefault();
            clipboard
                .writeText(Info.dirPath)
                .catch(CloudCmd.log);
            
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
                DOM.Storage.clear(wraptile(CloudCmd.log, 'storage cleared'));
                event.preventDefault();
            }
            break;
        }
    }
}

