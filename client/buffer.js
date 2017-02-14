/* global CloudCmd */

'use strict';

const jonny = require('jonny');
const exec = require('execon');

const Storage = require('./storage');
const DOM = require('./dom');
const {Dialog} = DOM;

module.exports = new BufferProto(DOM, CloudCmd);

function BufferProto(DOM, CloudCmd) {
    const Info = DOM.CurrentInfo,
        CLASS   = 'cut-file',
        COPY    = 'copy',
        CUT     = 'cut',
        TITLE   = 'Buffer',
        
        Buffer  = {
            cut     : callIfEnabled.bind(null, cut),
            copy    : callIfEnabled.bind(null, copy),
            clear   : callIfEnabled.bind(null, clear),
            paste   : callIfEnabled.bind(null, paste)
        };
    
    function showMessage(msg) {
        Dialog.alert(TITLE, msg);
    }
    
    function getNames() {
        var files   = DOM.getActiveFiles(),
            names   = DOM.getFilenames(files);
        
        return names;
    }
    
    function addCutClass() {
        var files   = DOM.getActiveFiles();
        
        files.forEach(function(element) {
            element.classList.add(CLASS);
        });
    }
    
    function rmCutClass() {
        var files   = DOM.getByClassAll(CLASS);
        
        []
            .slice.call(files)
            .forEach(function(element) {
                element.classList.remove(CLASS);
            });
    }
    
    function callIfEnabled(callback) {
        var is = CloudCmd.config('buffer');
        
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
            var opStr       = cp ? 'copy' : 'move',
                opData      = cp || ct,
                data        = {},
                Operation   = CloudCmd.Operation,
                msg         = 'Path is same!',
                path        = Info.dirPath;
            
            if (!error && !cp && !ct)
                error   = 'Buffer is empty!';
                
            if (error)
                return showMessage(error);
                
            data        = jonny.parse(opData);
            data.to     = path;
            
            if (data.from === path) {
                showMessage(msg);
            } else {
                Operation.show(opStr, data);
                clear();
            }
        });
    }
    
    return Buffer;
}
