'use strict';

const isNumber = (a) => typeof a === 'number';

module.exports = (error) => {
    const {lineNumber, columnNumber} = error;
    
    // thank you firefox
    if (isNumber(lineNumber) && isNumber(columnNumber))
        return [lineNumber, columnNumber];
    
    const before = error.stack.indexOf('>');
    const str = error.stack.slice(before + 1);
    const after = str.indexOf(')');
    const newStr = str.slice(1, after);
    
    const [line, column] = newStr.split(':');
    
    return [
        Number(line),
        Number(column),
    ];
};
