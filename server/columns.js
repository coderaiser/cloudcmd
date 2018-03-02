'use strict';

const fs = require('fs');
const isDev = process.NODE_ENV === 'development';
const dir = getDirPath(isDev);

module.exports = {
    '': '',
    'name-size-date': fs.readFileSync(`${dir}/name-size-date.css`, 'utf8'),
    'name-size-date-owner-mode': '',
};

function getDirPath (isDev) {
    const dist = isDev ? 'dist-dev' : 'dist';
    return `${__dirname}/../${dist}/columns`;
}

