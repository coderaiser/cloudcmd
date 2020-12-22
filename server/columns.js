import {join, dirname} from 'path';
import fs from 'fs';
import readFilesSync from '@cloudcmd/read-files-sync';
import {fileURLToPath} from 'url';

const isMap = (a) => /\.map$/.test(a);
const not = (fn) => (a) => !fn(a);
const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultColumns = {
    '': '',
    'name-size-date-owner-mode': '',
};

const isDev = process.env.NODE_ENV === 'development';
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

const dist = getDist(isDev);
const columnsDir = join(__dirname, '..', dist, 'columns');

const names = fs.readdirSync(columnsDir)
    .filter(not(isMap));

const columns = readFilesSync(columnsDir, names, 'utf8');

export default {
    ...columns,
    ...defaultColumns,
};

