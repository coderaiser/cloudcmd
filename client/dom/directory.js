'use strict';

/* global CloudCmd */
const philip = require('philip');

const Images = require('./images');
const {FS} = require('../../common/cloudfunc');
const DOM = require('.');
const Dialog = require('./dialog');

const {getCurrentDirPath: getPathWhenRootEmpty} = DOM;

module.exports = (items) => {
    if (items.length)
        Images.show('top');
    
    const entries = Array
        .from(items)
        .map((item) => item.webkitGetAsEntry());
    
    const dirPath = getPathWhenRootEmpty();
    const path = dirPath.replace(/\/$/, '');
    
    const progress = Dialog.progress('Uploading...');
    
    progress.catch(() => {
        Dialog.alert('Upload aborted');
        uploader.abort();
    });
    
    const uploader = philip(entries, (type, name, data, i, n, callback) => {
        const {prefixURL} = CloudCmd;
        const full = prefixURL + FS + path + name;
        
        let upload;
        switch(type) {
        case 'file':
            upload = uploadFile(full, data);
            break;
        
        case 'directory':
            upload = uploadDir(full);
            break;
        }
        
        upload.on('end', callback);
        
        upload.on('progress', (count) => {
            const current = percent(i, n);
            const next = percent(i + 1, n);
            const max = next - current;
            const value = current + percent(count, 100, max);
            
            progress.setProgress(value);
        });
    });
    
    uploader.on('error', (error) => {
        Dialog.alert(error);
        uploader.abort();
    });
    
    uploader.on('end', CloudCmd.refresh);
};

function percent(i, n, per = 100) {
    return Math.round(i * per / n);
}

function uploadFile(url, data) {
    return DOM.load.put(url, data);
}

function uploadDir(url) {
    return DOM.load.put(`${url}?dir`);
}
