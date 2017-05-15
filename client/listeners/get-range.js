'use strict';

module.exports = (indexFrom, indexTo, files) => {
    if (indexFrom < indexTo)
        return files.slice(indexFrom, indexTo + 1);
    
    if (indexFrom > indexTo)
        return files.slice(indexTo, indexFrom + 1);
    
    return [files[indexFrom]];
};

