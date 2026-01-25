import currify from 'currify';

export const getIndex = currify((array, item) => {
    const index = array.indexOf(item);
    
    if (!~index)
        return 0;
    
    return index;
});

