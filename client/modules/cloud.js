/* global CloudCmd, filepicker */

'use strict';

CloudCmd.Cloud = CloudProto;

const exec = require('execon');
const currify = require('currify/legacy');

const {log} = CloudCmd;

const load = require('../dom/load');
const Files = require('../dom/files');
const Images = require('../dom/images');

const upload = currify(_upload);

function CloudProto(callback) {
    loadFiles(callback);
    
    return module.exports;
}

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

function loadFiles(callback) {
    const js = '//api.filepicker.io/v2/filepicker.js';
    
    load.js(js, () => {
        Files.get('modules', (error, modules) => {
            const {key} = modules.data.FilePicker;
            
            filepicker.setKey(key);
            
            Images.hide();
            exec(callback);
        });
    });
}

