'use strict';

const fullstore = require('fullstore');
const store = fullstore('');
const visual = fullstore(false);

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

const noop = () => {};

module.exports = (key, operations) => {
    const prevStore = store();
    const value = store(prevStore.concat(key));
    const {
        escape = noop,
        move = noop,
        remove = noop,
        copy = noop,
        paste = noop,
        select = noop,
        find = noop,
        findNext = noop,
        findPrevious = noop,
    } = operations;
    
    if (key === 'Enter')
        return end();
    
    if (key === 'Escape') {
        visual(false);
        escape();
        return end();
    }
    
    if (key === 'j') {
        const [prev, isDelete] = handleDelete(prevStore);
        const count = getNumber(prev);
        
        !isNaN(count) && move('next', {
            isDelete,
            count,
            visual,
        });
        
        return end();
    }
    
    if (key === 'k') {
        const [prev, isDelete] = handleDelete(prevStore);
        const count = getNumber(prev);
        
        !isNaN(count) && move('previous', {
            count,
            visual,
            isDelete,
        });
        
        return end();
    }
    
    if (/^gg$/.test(value)) {
        const [, isDelete] = handleDelete(prevStore);
        
        move('previous', {
            count: Infinity,
            visual,
            isDelete,
        });
        
        return end();
    }
    
    if (key === 'd' && (visual() || prevStore === 'd')) {
        stopVisual();
        remove();
        return end();
    }
    
    if (key === 'G') {
        move('next', {
            count: Infinity,
            visual,
        });
        
        return end();
    }
    
    if (key === 'y') {
        if (!visual())
            return end();
        
        stopVisual();
        copy();
        return end();
    }
    
    if (/^p$/i.test(key)) {
        paste();
        return end();
    }
    
    if (/^v$/i.test(key)) {
        visual(!visual());
        select();
        return end();
    }
    
    if (key === '/') {
        find();
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

function handleDelete(prevStore) {
    const isDelete = prevStore[0] === 'd';
    
    if (isDelete) {
        visual(true);
        prevStore = rmFirst(prevStore);
    }
    
    return [prevStore, isDelete];
}

function getNumber(value) {
    if (!value)
        return 1;
    
    if (value === 'g')
        return 1;
    
    return parseInt(value);
}

