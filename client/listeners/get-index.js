'use strict';

module.exports = (array, item) => {
    const index = array.indexOf(item);
    
    if (!~index)
        return 0;
    
    return index;
};

