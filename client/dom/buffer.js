'use strict';

/* global CloudCmd */
const tryToPromiseAll = require('../../common/try-to-promise-all');
const Storage = require('./storage');
const DOM = require('./');

module.exports = new BufferProto();

function BufferProto() {
    const Info = DOM.CurrentInfo;
    const CLASS = 'cut-file';
    const COPY = 'copy';
    const CUT = 'cut';
    
    const Buffer = {
        cut: callIfEnabled.bind(null, cut),
        copy: callIfEnabled.bind(null, copy),
        clear: callIfEnabled.bind(null, clear),
        paste: callIfEnabled.bind(null, paste),
    };
    
    function showMessage(msg) {
        DOM.Dialog.alert(msg);
    }

    function getNames() {
        const files = DOM.getActiveFiles();
        const names = DOM.getFilenames(files);
        
        return names;
    }

    function addCutClass() {
        const files = DOM.getActiveFiles();
        
        for (const element of files) {
            element.classList.add(CLASS);
        }
    }

    function rmCutClass() {
        const files = DOM.getByClassAll(CLASS);
        
        for (const element of files) {
            element.classList.remove(CLASS);
        }
    }

    function callIfEnabled(callback) {
        const is = CloudCmd.config('buffer');
        
        if (is)
            return callback();
        
        showMessage('Buffer disabled in config!');
    }

    async function readBuffer() {
        const [e, cp, ct] = await tryToPromiseAll([
            Storage.getJson(COPY),
            Storage.getJson(CUT),
        ]);
        
        return [
            e,
            cp,
            ct,
        ];
    }

    async function copy() {
        const names = getNames();
        const from = Info.dirPath;
        
        await clear();
        
        if (!names.length)
            return;
        
        await Storage.remove(CUT);
        await Storage.setJson(COPY, {
            from,
            names,
        });
    }

    async function cut() {
        const names = getNames();
        const from = Info.dirPath;
        
        await clear();
        
        if (!names.length)
            return;
        
        addCutClass();
        
        await Storage.setJson(CUT, {
            from,
            names,
        });
    }

    async function clear() {
        await Storage.remove(COPY);
        await Storage.remove(CUT);
        
        rmCutClass();
    }

    async function paste() {
        const [error, cp, ct] = await readBuffer();
        
        if (error || !cp && !ct)
            return showMessage(error || 'Buffer is empty!');
        
        const opStr = cp ? 'copy' : 'move';
        const data = cp || ct;
        const {Operation} = CloudCmd;
        const msg = 'Path is same!';
        const to = Info.dirPath;
        
        if (data.from === to)
            return showMessage(msg);
        
        Operation.show(opStr, {
            ...data,
            to,
        });
        
        await clear();
    }

    return Buffer;
}
