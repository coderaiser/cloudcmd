'use strict';

/* global CloudCmd */

const jonny = require('jonny');
const exec = require('execon');

const Storage = require('./storage');
const DOM = require('./');

module.exports = new BufferProto();

function BufferProto() {
    const Info = DOM.CurrentInfo;
    const CLASS = 'cut-file';
    const COPY = 'copy';
    const CUT = 'cut';
    const TITLE = 'Buffer';
    
    const Buffer  = {
        cut     : callIfEnabled.bind(null, cut),
        copy    : callIfEnabled.bind(null, copy),
        clear   : callIfEnabled.bind(null, clear),
        paste   : callIfEnabled.bind(null, paste)
    };
    
    function showMessage(msg) {
        DOM.Dialog.alert(TITLE, msg);
    }
    
    function getNames() {
        const files = DOM.getActiveFiles();
        const names = DOM.getFilenames(files);
        
        return names;
    }
    
    function addCutClass() {
        const files = DOM.getActiveFiles();
        
        files.forEach((element) => {
            element.classList.add(CLASS);
        });
    }
    
    function rmCutClass() {
        const files = DOM.getByClassAll(CLASS);
        
        [...files].forEach((element) => {
            element.classList.remove(CLASS);
        });
    }
    
    function callIfEnabled(callback) {
        const is = CloudCmd.config('buffer');
        
        if (is)
            return callback();
        
        showMessage('Buffer disabled in config!');
    }
    
    function copy() {
        const names = getNames();
        const from = Info.dirPath;
        
        clear();
        
        if (!names.length)
            return;
            
        Storage.remove(CUT)
            .set(COPY, {
                from : from,
                names: names
            });
    }
    
    function cut() {
        const names = getNames();
        const from = Info.dirPath;
        
        clear();
        
        if (!names.length)
            return;
        
        addCutClass();
        
        Storage
            .set(CUT, {
                from : from,
                names: names
            });
    }
    
    function clear() {
        Storage.remove(COPY)
                .remove(CUT);
        
        rmCutClass();
    }
    
    function paste() {
        const copy = Storage.get.bind(Storage, COPY);
        const cut = Storage.get.bind(Storage, CUT);
        
        exec.parallel([copy, cut], function(error, cp, ct) {
            const opStr = cp ? 'copy' : 'move';
            const opData = cp || ct;
            const Operation = CloudCmd.Operation;
            const msg = 'Path is same!';
            const path = Info.dirPath;
            
            if (!error && !cp && !ct)
                error = 'Buffer is empty!';
           
            if (error)
                return showMessage(error);
                
            const data = jonny.parse(opData);
            data.to = path;
            
            if (data.from === path)
                return showMessage(msg);
            
            Operation.show(opStr, data);
            clear();
        });
    }
    
    return Buffer;
}
