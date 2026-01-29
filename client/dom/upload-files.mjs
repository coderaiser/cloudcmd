/* global CloudCmd */
import {eachSeries} from 'execon';
import wraptile from 'wraptile';
import * as load from '#dom/load';
import {alert} from '#dom/dialog';
import * as Images from './images.mjs';
import {FS} from '../../common/cloudfunc.mjs';
import {getCurrentDirPath} from './current-file.mjs';

const loadFile = wraptile(_loadFile);
const onEnd = wraptile(_onEnd);

export const uploadFiles = (dir, files) => {
    if (!files) {
        files = dir;
        dir = getCurrentDirPath();
    }
    
    const n = files.length;
    
    if (!n)
        return;
    
    const array = Array.from(files);
    const {name} = files[0];
    
    eachSeries(array, loadFile(dir, n), onEnd(name));
};

function _onEnd(currentName) {
    CloudCmd.refresh({
        currentName,
    });
}

function _loadFile(dir, n, file, callback) {
    let i = 0;
    
    const {name} = file;
    const path = dir + name;
    const {prefixURL} = CloudCmd;
    const api = prefixURL + FS;
    
    const percent = (i, n, per = 100) => {
        return Math.round(i * per / n);
    };
    
    const step = (n) => 100 / n;
    
    ++i;
    
    load
        .put(api + path, file)
        .on('error', showError)
        .on('end', callback)
        .on('progress', (count) => {
            const max = step(n);
            const value = (i - 1) * max + percent(count, 100, max);
            
            Images.show.load('top');
            Images.setProgress(Math.round(value));
        });
}

function showError({message}) {
    alert(message);
}
