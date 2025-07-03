import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import fs from 'node:fs';
import fullstore from 'fullstore';
import nanomemoizeDefault from 'nano-memoize';
import readFilesSync from '@cloudcmd/read-files-sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isMap = (a) => /\.(map|js)$/.test(a);
const not = (fn) => (a) => !fn(a);

const _isDev = fullstore(process.env.NODE_ENV === 'development');
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

export const isDev = _isDev;

export const getThemes = ({isDev = _isDev()} = {}) => {
    return readFilesSyncMemo(isDev);
};

const {nanomemoize} = nanomemoizeDefault;

const readFilesSyncMemo = nanomemoize((isDev) => {
    const dist = getDist(isDev);
    const themesDir = path.join(__dirname, '..', dist, 'themes');
    const names = fs
        .readdirSync(themesDir)
        .filter(not(isMap));
    
    const a = readFilesSync(themesDir, names, 'utf8');
    
    return a;
});
