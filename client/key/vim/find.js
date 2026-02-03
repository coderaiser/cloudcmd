import {fullstore} from 'fullstore';
import limier from 'limier';

const searchStore = fullstore([]);
const searchIndex = fullstore(0);

export const find = (value, names) => {
    const result = limier(value, names);
    
    searchStore(result);
    searchIndex(0);
    
    return result;
};

export const findNext = () => {
    const names = searchStore();
    const index = next(searchIndex(), names.length);
    
    searchIndex(index);
    return names[searchIndex()];
};

export const findPrevious = () => {
    const names = searchStore();
    const index = previous(searchIndex(), names.length);
    
    searchIndex(index);
    return names[index];
};

export const _next = next;
export const _previous = previous;

function next(index, length) {
    if (index === length - 1)
        return 0;
    
    return ++index;
}

function previous(index, length) {
    if (!index)
        return length - 1;
    
    return --index;
}
