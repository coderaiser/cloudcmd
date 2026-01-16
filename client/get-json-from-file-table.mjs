/* global DOM */
/**
 * Функция генерирует JSON из html-таблицы файлов и
 * используеться при первом заходе в корень
 */
export const getJsonFromFileTable = () => {
    const Info = DOM.CurrentInfo;
    const path = DOM.getCurrentDirPath();
    const infoFiles = Info.files || [];
    
    const files = infoFiles
        .filter(notParent)
        .map(parse);
    
    const fileTable = {
        path,
        files,
    };
    
    return fileTable;
};

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
