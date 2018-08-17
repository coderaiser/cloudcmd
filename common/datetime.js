'use strict';

const shortdate = require('shortdate');

module.exports = (date) => {
    date = date || new Date();
    check(date);
    
    const timeStr = shorttime(date);
    const dateStr = shortdate(date);
    
    return `${dateStr} ${timeStr}`;
};

const addZero = (a) => {
    if (a > 9)
        return a;
    
    return `0${a}`;
};

function shorttime(date) {
    const seconds = addZero(date.getSeconds());
    const minutes = addZero(date.getMinutes());
    const hours = addZero(date.getHours());
    
    return `${hours}:${minutes}:${seconds}`;
}

function check(date) {
    if (!(date instanceof Date))
        throw Error('date should be instanceof Date!');
}
