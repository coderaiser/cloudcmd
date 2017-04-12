'use strict';

/* global CloudCmd */

const exec = require('execon');

const DOM = require('.');
const load = require('./load');
const Images = require('./images');

const {FS} = require('../../common/cloudfunc');
const {CurrentInfo} = DOM;

module.exports = (dir, files) => {
    let i = 0;
    
    if (!files) {
        files = dir;
        dir = CurrentInfo.dirPath;
    }
    
    const n = files.length;
    
    if (!n)
        return;
    
    const array = [...files];
    const {name} = files[0];
    
    exec.eachSeries(array, loadFile, func(name));
    
    function func(name) {
        return () => {
            CloudCmd.refresh(null, () => {
                DOM.setCurrentByName(name);
            });
        };
    }
    
    function loadFile(file, callback) {
        const name = file.name;
        const path = dir + name;
        const {PREFIX_URL} = CloudCmd;
        const api = PREFIX_URL + FS;
        
        const percent = (i, n, per = 100) => {
            return Math.round(i * per / n);
        };
        
        const step = (n) => 100 / n;
        
        ++i;
        
        load.put(api + path, file)
            .on('end', callback)
            .on('progress', (count) => {
                const max = step(n);
                const value = (i - 1) * max + percent(count, 100, max);
                
                Images.show.load('top');
                Images.setProgress(Math.round(value));
            });
    }
};

