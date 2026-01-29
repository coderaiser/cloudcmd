/* global DOM, CloudCmd */
import philip from 'philip';
import * as Dialog from '#dom/dialog';
import * as Images from './images.mjs';
import {FS} from '../../common/cloudfunc.mjs';

export default (items) => {
    if (items.length)
        Images.show('top');
    
    const entries = Array
        .from(items)
        .map((item) => item.webkitGetAsEntry());
    
    const dirPath = DOM.getCurrentDirPath();
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

const percent = (i, n, per = 100) => Math.round(i * per / n);

const uploadFile = (url, data) => DOM.load.put(url, data);

const uploadDir = (url) => DOM.load.put(`${url}?dir`);
