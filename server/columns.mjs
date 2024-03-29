import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import fs from 'node:fs';
import fullstore from 'fullstore';
import nanomemoizeDefault from 'nano-memoize';
import readFilesSync from '@cloudcmd/read-files-sync';

const {nanomemoize} = nanomemoizeDefault;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isMap = (a) => /\.map$/.test(a);
const not = (fn) => (a) => !fn(a);

const defaultColumns = {
    '': '',
    'name-size-date-owner-mode': '',
};

const _isDev = fullstore(process.env.NODE_ENV === 'development');
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

export const isDev = _isDev;

export const getColumns = ({isDev = _isDev()} = {}) => {
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
