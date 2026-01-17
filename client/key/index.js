'use strict';

/* global CloudCmd, DOM */
const clipboard = require('@cloudcmd/clipboard');
const {fullstore} = require('fullstore');

const Buffer = require('../dom/buffer');
const Events = require('../dom/events/index.mjs');
const KEY = require('./key');

const _vim = require('./vim');
const setCurrentByChar = require('./set-current-by-char');
const {createBinder} = require('./binder');

const Chars = fullstore();

const toggleVim = (keyCode, overrides = {}) => {
    const {_config, config} = overrides;
    
    if (keyCode === KEY.ESC)
        _config('vim', !config('vim'));
};

const isUndefined = (a) => typeof a === 'undefined';

Chars([]);

const {assign} = Object;
const binder = createBinder();

module.exports = assign(binder, KEY);
module.exports.bind = () => {
    Events.addKey(listener, true);
    binder.setBind();
};

module.exports._listener = listener;

function getChar(event) {
    /*
      * event.keyIdentifier deprecated in chrome v51
      * but event.key is absent in chrome <= v51
      */
    const {
        key,
        shift,
        keyCode,
        keyIdentifier,
    } = event;
    
    const char = key || fromCharCode(keyIdentifier);
    const symbol = getSymbol(shift, keyCode);
    
    return [symbol, char];
}

async function listener(event, overrides = {}) {
    const {
        config = CloudCmd.config,
        _config = CloudCmd._config,
        switchKey = _switchKey,
        vim = _vim,
    } = overrides;
    
    const {keyCode} = event;
    
    // strange chrome bug calles listener twice
    // in second time event misses a lot fields
    if (isUndefined(event.altKey))
        return;
    
    const alt = event.altKey;
    const ctrl = event.ctrlKey;
    const meta = event.metaKey;
    const isBetween = keyCode >= KEY.ZERO && keyCode <= KEY.Z;
    const isNumpad = /Numpad/.test(event.code);
    
    const [symbol, char] = getChar(event);
    
    if (!binder.isBind())
        return;
    
    toggleVim(keyCode, {
        config,
        _config,
    });
    
    const isVim = config('vim');
    
    if (!isVim && !isNumpad && !alt && !ctrl && !meta && (isBetween || symbol))
        return setCurrentByChar(char, Chars);
    
    Chars([]);
    await switchKey(event);
    
    if (keyCode >= KEY.F1 && keyCode <= KEY.F10)
        return;
    
    if (isVim)
        await vim(char, event);
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
    
    return '';
}

function fromCharCode(keyIdentifier) {
    const code = keyIdentifier.substring(2);
    const hex = parseInt(code, 16);
    
    return String.fromCharCode(hex);
}

async function _switchKey(event) {
    const Info = DOM.CurrentInfo;
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
    
    const {
        Operation,
        changeDir,
        config,
    } = CloudCmd;
    
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
    case KEY.TAB:
        DOM.changePanel();
        event.preventDefault();
        break;
    
    case KEY.INSERT:
        DOM
            .toggleSelectedFile(current)
            .setCurrentFile(next);
        break;
    
    case KEY.INSERT_MAC:
        DOM
            .toggleSelectedFile(current)
            .setCurrentFile(next);
        break;
    
    case KEY.DELETE:
        if (shift)
            Operation.show('delete:silent');
        else
            Operation.show('delete');
        
        break;
    
    case KEY.ASTERISK:
        DOM.toggleAllSelectedFiles(current);
        break;
    
    case KEY.PLUS:
        DOM.expandSelection();
        event.preventDefault();
        break;
    
    case KEY.MINUS:
        DOM.shrinkSelection();
        event.preventDefault();
        break;
    
    case KEY.F1:
        CloudCmd.Help.show();
        event.preventDefault();
        break;
    
    case KEY.F2:
        CloudCmd.UserMenu.show();
        break;
    
    case KEY.F3:
        event.preventDefault();
        
        if (Info.isDir)
            await changeDir(path);
        else if (shift)
            CloudCmd.View.show(null, {
                raw: true,
            });
        else if (ctrlMeta)
            CloudCmd.sortPanel('name');
        else
            CloudCmd.View.show();
        
        break;
    
    case KEY.F4:
        if (config('vim'))
            CloudCmd.EditFileVim.show();
        else
            CloudCmd.EditFile.show();
        
        event.preventDefault();
        break;
    
    case KEY.F5:
        if (ctrlMeta)
            CloudCmd.sortPanel('date');
        else if (alt)
            Operation.show('pack');
        else
            Operation.show('copy');
        
        event.preventDefault();
        break;
    
    case KEY.F6:
        if (ctrlMeta)
            CloudCmd.sortPanel('size');
        else if (shift)
            DOM.renameCurrent(current);
        else
            Operation.show('move');
        
        event.preventDefault();
        break;
    
    case KEY.F7:
        if (shift)
            DOM.promptNewFile();
        else
            DOM.promptNewDir();
        
        event.preventDefault();
        break;
    
    case KEY.F8:
        Operation.show('delete');
        event.preventDefault();
        break;
    
    case KEY.F9:
        if (alt)
            Operation.show('extract');
        else
            CloudCmd.Menu.show();
        
        event.preventDefault();
        break;
    
    case KEY.F10:
        CloudCmd.Config.show();
        event.preventDefault();
        break;
    
    case KEY.TRA:
        event.preventDefault();
        
        if (shift)
            return CloudCmd.Terminal.show();
        
        CloudCmd.Konsole.show();
        break;
    
    case KEY.BRACKET_CLOSE:
        CloudCmd.Konsole.show();
        event.preventDefault();
        break;
    
    case KEY.SPACE:
        event.preventDefault();
        
        if (!isDir || name === '..')
            isSelected = true;
        else
            isSelected = DOM.isSelected(current);
        
        if (!isSelected)
            await DOM.loadCurrentSize(current);
        
        DOM.toggleSelectedFile(current);
        
        break;
    
    case KEY.U:
        if (ctrlMeta) {
            DOM.swapPanels();
            event.preventDefault();
        }
        
        break;
    
    /* navigation on file table:        *
     * in case of pressing button 'up', *
     * select previous row              */
    case KEY.UP:
        if (shift)
            DOM.toggleSelectedFile(current);
        
        DOM.setCurrentFile(prev);
        event.preventDefault();
        break;
    
    /* in case of pressing button 'down', *
     * select next row                    */
    case KEY.DOWN:
        if (shift)
            DOM.toggleSelectedFile(current);
        
        DOM.setCurrentFile(next);
        event.preventDefault();
        break;
    
    case KEY.LEFT:
        if (!alt)
            return;
        
        event.preventDefault();
        
        dataName = Info.panel.getAttribute('data-name');
        
        if (dataName === 'js-right')
            DOM.duplicatePanel();
        
        break;
    
    case KEY.RIGHT:
        if (!alt)
            return;
        
        event.preventDefault();
        
        dataName = Info.panel.getAttribute('data-name');
        
        if (dataName === 'js-left')
            DOM.duplicatePanel();
        
        break;
    
    /* in case of pressing button 'Home',  *
     * go to top element                   */
    case KEY.HOME:
        DOM.setCurrentFile(Info.first);
        event.preventDefault();
        break;
    
    /* in case of pressing button 'End', select last element */
    case KEY.END:
        DOM.setCurrentFile(Info.last);
        event.preventDefault();
        break;
    
    /* если нажали клавишу page down проматываем экран */
    case KEY.PAGE_DOWN:
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
    case KEY.PAGE_UP:
        DOM.scrollByPages(panel, -1);
        
        for (i = 0; i < 30; i++) {
            if (!current.previousSibling)
                break;
            
            current = current.previousSibling;
        }
        
        DOM.setCurrentFile(current);
        event.preventDefault();
        break;
    
    case KEY.ENTER:
        if (Info.isDir)
            await changeDir(path);
        else
            CloudCmd.View.show();
        
        break;
    
    case KEY.BACKSPACE:
        CloudCmd.goToParentDir();
        event.preventDefault();
        break;
    
    case KEY.BACKSLASH:
        if (ctrlMeta)
            await changeDir('/');
        
        break;
    
    case KEY.A:
        if (ctrlMeta) {
            DOM.selectAllFiles();
            event.preventDefault();
        }
        
        break;
    
    case KEY.G:
        if (alt) {
            DOM.goToDirectory();
            event.preventDefault();
        }
        
        break;
    
    case KEY.M:
        if (ctrlMeta) {
            if (config('vim'))
                CloudCmd.EditNamesVim.show();
            else
                CloudCmd.EditNames.show();
            
            event.preventDefault();
        }
        
        break;
    
    case KEY.P:
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
    case KEY.R:
        if (ctrlMeta) {
            CloudCmd.log('reloading page...\n');
            CloudCmd.refresh();
            event.preventDefault();
        }
        
        break;
    
    case KEY.C:
        if (ctrlMeta)
            Buffer.copy();
        
        break;
    
    case KEY.X:
        if (ctrlMeta)
            Buffer.cut();
        
        break;
    
    case KEY.V:
        if (ctrlMeta)
            Buffer.paste();
        
        break;
    
    case KEY.Z:
        if (ctrlMeta)
            Buffer.clear();
        
        break;
    
    case KEY.COLON:
        CloudCmd.CommandLine.show();
        event.preventDefault();
        break;
    
    /* чистим хранилище */
    case KEY.D:
        if (ctrlMeta) {
            CloudCmd.log('clearing storage...');
            await DOM.Storage.clear();
            CloudCmd.log('storage cleared');
            event.preventDefault();
        }
        
        break;
    
    case KEY.DOT:
        if (meta && shift) {
            const showDotFiles = !CloudCmd.config('showDotFiles');
            CloudCmd._config('showDotFiles', showDotFiles);
            CloudCmd.refresh();
            await DOM.RESTful.Config.write({
                showDotFiles,
            });
        }
        
        break;
    }
}
