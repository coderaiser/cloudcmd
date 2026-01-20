/* global CloudCmd*/
import tryToPromiseAll from '../../common/try-to-promise-all.js';
import Storage from './storage.js';

const CLASS = 'cut-file';
const COPY = 'copy';
const CUT = 'cut';

function showMessage(msg) {
    globalThis.DOM.Dialog.alert(msg);
}

function getNames() {
    const {DOM} = globalThis;
    const files = DOM.getActiveFiles();
    
    return DOM.getFilenames(files);
}

function addCutClass() {
    const {DOM} = globalThis;
    const files = DOM.getActiveFiles();
    
    for (const element of files) {
        element.classList.add(CLASS);
    }
}

function rmCutClass() {
    const {DOM} = globalThis;
    const files = DOM.getByClassAll(CLASS);
    
    for (const element of files) {
        element.classList.remove(CLASS);
    }
}

const checkEnabled = (fn) => () => {
    const is = CloudCmd.config('buffer');
    
    if (is)
        return fn();
    
    showMessage('Buffer disabled in config!');
};

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

export const copy = checkEnabled(async () => {
    const Info = globalThis.DOM.CurrentInfo;
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
});

export const cut = checkEnabled(async () => {
    const Info = globalThis.DOM.CurrentInfo;
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
});

export const clear = checkEnabled(async () => {
    await Storage.remove(COPY);
    await Storage.remove(CUT);
    
    rmCutClass();
});

export const paste = checkEnabled(async () => {
    const Info = globalThis.DOM.CurrentInfo;
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
});
