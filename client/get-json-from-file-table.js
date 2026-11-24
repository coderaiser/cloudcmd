/* global DOM */
import {getFields} from './get-fields.js';
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
    const type = DOM.getCurrentType(current);
    
    return {
        ...getFields(DOM, current),
        type,
    };
};
