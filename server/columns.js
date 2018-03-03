'use strict';

const path = require('path');
const readFilesSync = require('@cloudcmd/read-files-sync');

const defaultColumns = {
    '': '',
    'name-size-date-owner-mode': '',
};

const isDev = process.NODE_ENV === 'development';
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

const dist = getDist(isDev);
const columnsDir = path.join(__dirname, '..', dist, 'columns');
const columns = readFilesSync(columnsDir, 'utf8');

module.exports = Object.assign(
    columns,
    defaultColumns
);

