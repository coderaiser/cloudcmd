'use strict';

/* global CloudCmd, DOM */

const KEY = require('../key');
const Info = DOM.CurrentInfo;
const {Dialog} = DOM;

const fullstore = require('fullstore/legacy');
const store = fullstore('');
const visual = fullstore(false);
const {
    find,
    findNext,
    findPrevious,
} = require('./find');

const stopVisual = () => {
    visual(false);
};

const end = () => {
    store('');
};

const rmFirst = (a) => {
    return a
        .split('')
        .slice(1)
        .join('');
};

module.exports = (key, event) => {
    const current = Info.element;
    const {keyCode} = event;
    const prevStore = store();
    
    const value = store(prevStore.concat(key));
    
    if (keyCode === KEY.ENTER)
        return end();
    
    if (keyCode === KEY.ESC) {
        DOM.unselectFiles();
        visual(false);
        return end();
    }
    
    if (key === 'j') {
        move('next', {
            prevStore,
            current,
        });
        
        return end();
    }
    
    if (key === 'k') {
        move('previous', {
            prevStore,
            current,
        });
        
        return end();
    }
    
    if (/gg/.test(value)) {
        move('previous', {
            current,
            prevStore,
            max: Infinity,
        });
        
        return end();
    }
    
    if (key === 'd' && (visual() || prevStore === 'd')) {
        CloudCmd.Operation.show('delete');
        stopVisual();
        return end();
    }
    
    if (key === 'G') {
        move('next', {
            current,
            prevStore,
            max: Infinity,
        });
        
        return end();
    }
    
    if (key === 'y') {
        if (!visual())
            return end();
        
        DOM.Buffer.copy();
        stopVisual();
        DOM.unselectFiles();
        return end();
    }
    
    if (/^p$/i.test(key)) {
        DOM.Buffer.paste();
        return end();
    }
    
    if (/^v$/i.test(key)) {
        DOM.toggleSelectedFile(current);
        visual(!visual());
        
        return end();
    }
    
    if (key === '/') {
        event.preventDefault();
        
        Dialog.prompt('Find', '', {cancel: false})
            .then(find);
        
        return end();
    }
    
    if (key === 'n') {
        findNext();
        return end();
    }
    
    if (key === 'N') {
        findPrevious();
        return end();
    }
};

module.exports.selectFile = selectFile;

function move(sibling, {max, current, prevStore}) {
    const isDelete = prevStore[0] === 'd';
    
    if (isDelete) {
        visual(true);
        prevStore = rmFirst(prevStore);
    }
    
    const n = max || getNumber(prevStore);
    
    if (isNaN(n))
        return;
    
    setCurrent({
        n,
        current,
        sibling,
        visual: visual(),
    });
    
    if (isDelete)
        CloudCmd.Operation.show('delete');
}

function getNumber(value) {
    if (!value)
        return 1;
    
    if (value === 'g')
        return 1;
    
    return parseInt(value);
}

function selectFile(current) {
    const name = DOM.getCurrentName(current);
    
    if (name === '..')
        return;
    
    DOM.selectFile(current);
}

function setCurrent({n, current, visual, sibling}) {
    const select = visual ? selectFile : DOM.unselectFile;
    
    select(current);
    
    const position = `${sibling}Sibling`;
    for (let i = 0; i < n; i++) {
        const next = current[position];
        
        if (!next)
            break;
        
        current = next;
        select(current);
    }
    
    DOM.setCurrentFile(current);
}

