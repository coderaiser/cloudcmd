import {fields} from '#common/fields';

const readers = {
    name: (DOM, id, current) => DOM.getCurrentName(current),
    size: (DOM, id, current) => DOM.getCurrentSize(current),
};

const fromMarkup = (DOM, id, current) => DOM.getByDataName(`js-${id}`, current).textContent;

export const getFields = (DOM, current) => {
    const result = {};
    
    for (const {id} of fields) {
        const read = readers[id] || fromMarkup;
        result[id] = read(DOM, id, current);
    }
    
    return result;
};
