'use strict';

/* global DOM */
const Info = DOM.CurrentInfo;

/**
 * Функция генерирует JSON из html-таблицы файлов и
 * используеться при первом заходе в корень
 */
module.exports = () => {
    const path = DOM.getCurrentDirPath();
    const infoFiles = Info.files || [];
    
    const notParent = (current) => {
        const name = DOM.getCurrentName(current);
        return name !== '..';
    };
    
    const parse = (current) => {
        const name = DOM.getCurrentName(current);
        const size = DOM.getCurrentSize(current);
        const owner = DOM.getCurrentOwner(current);
        const mode = DOM.getCurrentMode(current);
        const date = DOM.getCurrentDate(current);
        const type = DOM.getCurrentType(current);
        
        return {
            name,
            size,
            mode,
            owner,
            date,
            type,
        };
    };
    
    const files = infoFiles
        .filter(notParent)
        .map(parse);
    
    const fileTable = {
        path,
        files,
    };
    
    return fileTable;
};
