'use strict';

const fullstore = require('fullstore');
const process = require('process');
const path = require('path');
const fs = require('fs');

const {nanomemoize} = require('nano-memoize');
const readFilesSync = require('@cloudcmd/read-files-sync');

const isMap = (a) => /\.map$/.test(a);
const not = (fn) => (a) => !fn(a);

const defaultColumns = {
    '': '',
    'name-size-date-owner-mode': '',
};

const _isDev = fullstore(process.env.NODE_ENV === 'development');
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

module.exports.isDev = _isDev;

module.exports.getColumns = ({isDev = _isDev()} = {}) => {
    const columns = readFilesSyncMemo(isDev);

    return {
        ...columns,
        ...defaultColumns,
    };
};

const readFilesSyncMemo = nanomemoize((isDev) => {
    const dist = getDist(isDev);
    const columnsDir = path.join(__dirname, '..', dist, 'columns');
    const names = fs
        .readdirSync(columnsDir)
        .filter(not(isMap));

    return readFilesSync(columnsDir, names, 'utf8');
});
