/* global CloudCmd, filepicker */
import exec from 'execon';
import currify from 'currify';
import load from 'load.js';
import {ajax} from '#dom/load';
import Files from '../dom/files.js';
import * as Images from '../dom/images.mjs';

const {log} = CloudCmd;

const upload = currify(_upload);

const Name = 'Cloud';

CloudCmd[Name] = {
    init,
    uploadFile,
    saveFile,
};

export async function init() {
    const [modules] = await loadFiles();
    const {key} = modules.data.FilePicker;
    
    filepicker.setKey(key);
    Images.hide();
}

export function uploadFile(filename, data) {
    const mimetype = '';
    
    filepicker.store(data, {
        mimetype,
        filename,
    }, (fpFile) => {
        filepicker.exportFile(fpFile, log, log);
    });
}

export function saveFile(callback) {
    filepicker.pick(upload(callback));
}

function _upload(callback, file) {
    const {url, filename} = file;
    
    const responseType = 'arraybuffer';
    const success = exec.with(callback, filename);
    
    ajax({
        url,
        responseType,
        success,
    });
}

function loadFiles() {
    const js = '//api.filepicker.io/v2/filepicker.js';
    
    return Promise.all([
        Files.get('modules'),
        load.js(js),
    ]);
}
