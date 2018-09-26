'use strict';

const path = require('path');
const fs= require('fs');
const readFilesSync = require('@cloudcmd/read-files-sync');
const isMap = (a) => /\.map$/.test(a);
const not = (fn) => (a) => !fn(a);

const defaultColumns = {
    '': '',
    'name-size-date-owner-mode': '',
};

const isDev = process.env.NODE_ENV === 'development';
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

const dist = getDist(isDev);
const columnsDir = path.join(__dirname, '..', dist, 'columns');

const names = fs.readdirSync(columnsDir)
    .filter(not(isMap));

const columns = readFilesSync(columnsDir, names, 'utf8');

module.exports = {
    ...columns,
    ...defaultColumns,
};

