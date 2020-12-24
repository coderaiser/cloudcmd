/* global CloudCmd, filepicker */

import exec from 'execon';
import currify from 'currify';
import load from 'load.js';

const {log} = CloudCmd;

import {ajax} from '../dom/load.js';
import Files from '../dom/files.js';
import Images from '../dom/images.js';

const upload = currify(_upload);

const Name = 'Cloud';
CloudCmd[Name] = module.exports;

export const init = async () => {
    const [modules] = await loadFiles();
    const {key} = modules.data.FilePicker;
    
    filepicker.setKey(key);
    Images.hide();
};

export const uploadFile = (filename, data) => {
    const mimetype = '';
    
    filepicker.store(data, {
        mimetype,
        filename,
    }, (fpFile) => {
        filepicker.exportFile(fpFile, log, log);
    });
};

export const saveFile = (callback) => {
    filepicker.pick(upload(callback));
};

function _upload(callback, file) {
    const {
        url,
        filename,
    } = file;
    
    const responseType = 'arraybuffer';
    const success = exec.with(callback, filename);
    
    ajax({
        url,
        responseType,
        success,
    });
}

async function loadFiles() {
    const js = '//api.filepicker.io/v2/filepicker.js';
    
    return Promise.all([
        Files.get('modules'),
        load.js(js),
    ]);
}

