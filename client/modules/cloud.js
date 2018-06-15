/* global CloudCmd, filepicker */

'use strict';

const exec = require('execon');
const currify = require('currify/legacy');
const {promisify} = require('es6-promisify');

const {log} = CloudCmd;

const load = require('../dom/load');
const Files = require('../dom/files');
const Images = require('../dom/images');

const upload = currify(_upload);

module.exports.init = async () => {
    await loadFiles();
};

module.exports.uploadFile = (filename, data) => {
    const mimetype = '';
    
    filepicker.store(data, {
        mimetype,
        filename,
    }, (fpFile) => {
        filepicker.exportFile(fpFile, log, log);
    });
};

module.exports.saveFile = (callback) => {
    filepicker.pick(upload(callback));
};

function _upload(callback, file) {
    const {
        url,
        filename,
    } = file;
    
    const responseType = 'arraybuffer';
    const success = exec.with(callback, filename);
    
    load.ajax({
        url,
        responseType,
        success,
    });
}

const loadFiles = promisify((callback) => {
    const js = '//api.filepicker.io/v2/filepicker.js';
    
    load.js(js, () => {
        Files.get('modules', (error, modules) => {
            const {key} = modules.data.FilePicker;
            
            filepicker.setKey(key);
            
            Images.hide();
            exec(callback);
        });
    });
});

